using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using FutureConnection.Core.Utils;

namespace FutureConnection.IdentityService.Application
{
    public class AuthService(
        IUnitOfWork uow,
        IConfiguration config,
        IEventPublisher eventPublisher,
        IEmailService emailService,
        IMapper mapper,
        IPasswordHasher passwordHasher,
        ILogger<AuthService> logger) : IAuthService
    {
        private readonly IUnitOfWork _uow = uow;
        private readonly IConfiguration _config = config;
        private readonly IEventPublisher _eventPublisher = eventPublisher;
        private readonly IEmailService _emailService = emailService;
        private readonly IMapper _mapper = mapper;
        private readonly IPasswordHasher _passwordHasher = passwordHasher;
        private readonly ILogger _logger = logger;

        private static bool IsPasswordStrong(string password) =>
            password.Length >= 8 && password.Any(char.IsUpper) && password.Any(char.IsDigit);

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            var exists = await _uow.Users.CheckEmail(request.Email);
            if (exists) return false;

            if (!IsPasswordStrong(request.Password)) return false;

            var roleName = request.RoleName ?? "Freelancer";
            var roles = await _uow.Roles.GetAllAsync();
            var role = roles.FirstOrDefault(r => r.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase))
                       ?? roles.FirstOrDefault(r => r.Name == "Freelancer");

            var verificationToken = GenerateSecureToken();

            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                HashedPassword = _passwordHasher.HashPassword(request.Password),
                RoleId = role?.Id ?? Guid.Empty,
                Role = role!,
                IsOnboarded = false,
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
            };

            await _uow.Users.CreateAsync(user);
            await _uow.CompleteAsync();

            try
            {
                await _emailService.SendVerificationEmailAsync(user.Email, user.FirstName, verificationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send verification email to {Email}", user.Email);
            }

            try
            {
                await _eventPublisher.PublishAsync("user.events", new
                {
                    EventType = "UserCreated",
                    UserId = user.Id,
                    Email = user.Email,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to publish UserCreated event for {Email}", user.Email);
            }

            return true;
        }

        public async Task<TokenResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _uow.Users.GetUserByEmail(request.Email);
            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.HashedPassword))
                return null;

            var clientIp = request.IpAddress ?? "unknown";
            if (!string.IsNullOrEmpty(user.LastLoginIp) && user.LastLoginIp != clientIp)
            {
                try
                {
                    await _eventPublisher.PublishAsync("auth.events", new
                    {
                        EventType = "LoginAttemptIPMismatch",
                        UserId = user.Id,
                        Email = request.Email,
                        KnownIp = user.LastLoginIp,
                        AttemptedIp = clientIp,
                        Timestamp = DateTime.UtcNow
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to publish IPMismatch event for {Email}", request.Email);
                }
            }

            user.LastLoginIp = clientIp;
            user.LastLoginDate = DateTime.UtcNow;
            _uow.Users.Update(user);

            var tokens = GenerateTokens(user, clientIp);

            await _uow.RefreshTokens.CreateAsync(new RefreshToken
            {
                Token = tokens.RefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedByIp = clientIp,
                UserId = user.Id
            });
            await _uow.CompleteAsync();

            return tokens;
        }

        public async Task<TokenResponse?> RefreshTokenAsync(string refreshToken)
        {
            var tokenEntity = await _uow.RefreshTokens.GetByTokenAsync(refreshToken);

            if (tokenEntity == null || !tokenEntity.IsActive)
                return null;

            var user = await _uow.Users.GetByIdAsync(tokenEntity.UserId);
            if (user == null) return null;

            tokenEntity.IsRevoked = true;
            tokenEntity.RevokedAt = DateTime.UtcNow;
            _uow.RefreshTokens.Update(tokenEntity);

            var tokens = GenerateTokens(user, tokenEntity.CreatedByIp);

            await _uow.RefreshTokens.CreateAsync(new RefreshToken
            {
                Token = tokens.RefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedByIp = tokenEntity.CreatedByIp,
                UserId = user.Id
            });
            await _uow.CompleteAsync();

            return tokens;
        }

        public async Task<Response<string>> SendVerificationEmailAsync(string email)
        {
            var user = await _uow.Users.GetUserByEmail(email);
            if (user == null) return new Response<string> { Success = false, Message = "User not found." };
            if (user.IsEmailVerified) return new Response<string> { Success = false, Message = "Email is already verified." };

            user.EmailVerificationToken = GenerateSecureToken();
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
            _uow.Users.Update(user);
            await _uow.CompleteAsync();

            try
            {
                await _emailService.SendVerificationEmailAsync(user.Email, user.FirstName, user.EmailVerificationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send verification email to {Email}", email);
            }

            return new Response<string> { Success = true, Message = "Verification email sent." };
        }

        public async Task<Response<string>> VerifyEmailAsync(string token)
        {
            var allUsers = await _uow.Users.GetAllAsync();
            var user = allUsers.FirstOrDefault(u => u.EmailVerificationToken == token);
            if (user == null) return new Response<string> { Success = false, Message = "Invalid or expired verification token." };
            if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                return new Response<string> { Success = false, Message = "Verification token has expired. Please request a new one." };

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            _uow.Users.Update(user);
            await _uow.CompleteAsync();

            return new Response<string> { Success = true, Message = "Email verified successfully." };
        }

        public async Task<Response<string>> ForgotPasswordAsync(string email)
        {
            var user = await _uow.Users.GetUserByEmail(email);
            if (user == null) return new Response<string> { Success = true, Message = "If that email exists, a reset link has been sent." };

            user.ResetPasswordToken = GenerateSecureToken();
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);
            _uow.Users.Update(user);
            await _uow.CompleteAsync();

            try
            {
                await _emailService.SendPasswordResetEmailAsync(user.Email, user.FirstName, user.ResetPasswordToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send password reset email to {Email}", email);
            }

            return new Response<string> { Success = true, Message = "If that email exists, a reset link has been sent." };
        }

        public async Task<Response<string>> ResetPasswordAsync(string token, string newPassword)
        {
            if (!IsPasswordStrong(newPassword))
                return new Response<string> { Success = false, Message = "Password must be at least 8 characters with one uppercase letter and one digit." };

            var allUsers = await _uow.Users.GetAllAsync();
            var user = allUsers.FirstOrDefault(u => u.ResetPasswordToken == token);
            if (user == null) return new Response<string> { Success = false, Message = "Invalid or expired reset token." };
            if (user.ResetPasswordTokenExpiry < DateTime.UtcNow)
                return new Response<string> { Success = false, Message = "Reset token has expired. Please request a new one." };

            user.HashedPassword = _passwordHasher.HashPassword(newPassword);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;
            _uow.Users.Update(user);

            var activeTokens = (await _uow.RefreshTokens.GetAllAsync()).Where(rt => rt.UserId == user.Id && rt.IsActive);
            foreach (var rt in activeTokens)
            {
                rt.IsRevoked = true;
                rt.RevokedAt = DateTime.UtcNow;
                _uow.RefreshTokens.Update(rt);
            }

            await _uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Password reset successfully." };
        }

        public async Task<Response<string>> RequestChangePasswordOtpAsync(Guid userId)
        {
            var user = await _uow.Users.GetByIdAsync(userId);
            if (user == null) return new Response<string> { Success = false, Message = "User not found." };

            var otp = GenerateOtp();
            user.ChangePasswordOtp = _passwordHasher.HashPassword(otp);
            user.ChangePasswordOtpExpiry = DateTime.UtcNow.AddMinutes(10);
            _uow.Users.Update(user);
            await _uow.CompleteAsync();

            try
            {
                await _emailService.SendChangePasswordOtpAsync(user.Email, user.FirstName, otp);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send OTP email to {Email}", user.Email);
            }

            return new Response<string> { Success = true, Message = "OTP sent." };
        }

        public async Task<Response<string>> VerifyChangePasswordOtpAsync(Guid userId, string otp)
        {
            var user = await _uow.Users.GetByIdAsync(userId);
            if (user == null) return new Response<string> { Success = false, Message = "User not found." };
            if (string.IsNullOrEmpty(user.ChangePasswordOtp) || user.ChangePasswordOtpExpiry < DateTime.UtcNow)
                return new Response<string> { Success = false, Message = "OTP has expired." };
            if (!_passwordHasher.VerifyPassword(otp, user.ChangePasswordOtp))
                return new Response<string> { Success = false, Message = "Invalid OTP." };

            user.ChangePasswordOtp = null;
            user.ChangePasswordOtpExpiry = null;
            _uow.Users.Update(user);
            await _uow.CompleteAsync();

            return new Response<string> { Success = true, Message = "OTP verified." };
        }

        public async Task<Response<OAuthTokenResponse>> GitHubOAuthAsync(string code, string redirectUri)
        {
            var clientId = _config["OAuth:GitHub:ClientId"] ?? throw new InvalidOperationException("GitHub ClientId not configured.");
            var clientSecret = _config["OAuth:GitHub:ClientSecret"] ?? throw new InvalidOperationException("GitHub ClientSecret not configured.");

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Add("Accept", "application/json");
            http.DefaultRequestHeaders.Add("User-Agent", "FutureConnection");

            var tokenRes = await http.PostAsJsonAsync("https://github.com/login/oauth/access_token", new { client_id = clientId, client_secret = clientSecret, code, redirect_uri = redirectUri });
            var responseContent = await tokenRes.Content.ReadAsStringAsync();
            _logger.LogInformation("GitHub Token Response: {Content}", responseContent);

            var tokenJson = JsonSerializer.Deserialize<JsonElement>(responseContent);
            if (!tokenJson.TryGetProperty("access_token", out var accessTokenEl))
            {
                _logger.LogWarning("GitHub Token Response missing access_token: {Content}", responseContent);
                return new Response<OAuthTokenResponse> { Success = false, Message = "Failed to obtain GitHub token." };
            }

            var githubToken = accessTokenEl.GetString()!;
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", githubToken);
            var profileRes = await http.GetFromJsonAsync<JsonElement>("https://api.github.com/user");

            var githubId = profileRes.GetProperty("id").GetInt64().ToString();
            var githubEmail = profileRes.TryGetProperty("email", out var emailEl) && emailEl.ValueKind != JsonValueKind.Null ? emailEl.GetString() : null;
            var firstName = profileRes.TryGetProperty("name", out var nameEl) ? nameEl.GetString()?.Split(' ').FirstOrDefault() ?? "GitHub" : "GitHub";
            var lastName = profileRes.TryGetProperty("name", out var nameEl2) ? nameEl2.GetString()?.Split(' ').Skip(1).FirstOrDefault() ?? "User" : "User";
            var avatarUrl = profileRes.TryGetProperty("avatar_url", out var avatarEl) ? avatarEl.GetString() : null;

            if (string.IsNullOrEmpty(githubEmail))
            {
                var emailsRes = await http.GetFromJsonAsync<JsonElement[]>("https://api.github.com/user/emails");
                githubEmail = emailsRes?.Where(e => e.TryGetProperty("primary", out var p) && p.GetBoolean()).Select(e => e.TryGetProperty("email", out var em) ? em.GetString() : null).FirstOrDefault(e => !string.IsNullOrEmpty(e));
            }

            if (string.IsNullOrEmpty(githubEmail))
                return new Response<OAuthTokenResponse> { Success = false, Message = "GitHub account has no email." };

            return await FindOrCreateOAuthUserAsync(githubEmail, firstName, lastName, avatarUrl, "GitHub", githubId);
        }

        public async Task<Response<OAuthTokenResponse>> GoogleOAuthAsync(string code, string redirectUri)
        {
            var clientId = _config["OAuth:Google:ClientId"] ?? throw new InvalidOperationException("Google ClientId not configured.");
            var clientSecret = _config["OAuth:Google:ClientSecret"] ?? throw new InvalidOperationException("Google ClientSecret not configured.");

            using var http = new HttpClient();
            var tokenRes = await http.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string> { ["code"] = code, ["client_id"] = clientId, ["client_secret"] = clientSecret, ["redirect_uri"] = redirectUri, ["grant_type"] = "authorization_code" }));
            var tokenJson = await tokenRes.Content.ReadFromJsonAsync<JsonElement>();
            if (!tokenJson.TryGetProperty("access_token", out var accessTokenEl))
                return new Response<OAuthTokenResponse> { Success = false, Message = "Failed to obtain Google token." };

            var googleToken = accessTokenEl.GetString()!;
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", googleToken);
            var profile = await http.GetFromJsonAsync<JsonElement>("https://www.googleapis.com/oauth2/v3/userinfo");

            var googleId = profile.GetProperty("sub").GetString()!;
            var email = profile.GetProperty("email").GetString()!;
            var firstName = profile.TryGetProperty("given_name", out var gnEl) ? gnEl.GetString() ?? "Google" : "Google";
            var lastName = profile.TryGetProperty("family_name", out var fnEl) ? fnEl.GetString() ?? "User" : "User";
            var avatarUrl = profile.TryGetProperty("picture", out var picEl) ? picEl.GetString() : null;

            return await FindOrCreateOAuthUserAsync(email, firstName, lastName, avatarUrl, "Google", googleId);
        }

        private async Task<Response<OAuthTokenResponse>> FindOrCreateOAuthUserAsync(string email, string firstName, string lastName, string? avatarUrl, string provider, string providerId)
        {
            var allUsers = await _uow.Users.GetAllAsync();
            var user = allUsers.FirstOrDefault(u => u.ExternalProvider == provider && u.ExternalProviderId == providerId) ?? await _uow.Users.GetUserByEmail(email);
            bool isNewUser = false;

            if (user == null)
            {
                var roles = await _uow.Roles.GetAllAsync();
                var freelancerRole = roles.FirstOrDefault(r => r.Name == "Freelancer");
                user = new User
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    HashedPassword = "OAUTH_" + Guid.NewGuid().ToString("N"),
                    RoleId = freelancerRole?.Id ?? Guid.Empty,
                    Role = freelancerRole!,
                    IsOnboarded = false,
                    IsEmailVerified = true,
                    ExternalProvider = provider,
                    ExternalProviderId = providerId,
                    AvatarUrl = avatarUrl
                };
                await _uow.Users.CreateAsync(user);
                isNewUser = true;
                try { await _eventPublisher.PublishAsync("user.events", new { EventType = "UserCreated", UserId = user.Id, Email = user.Email, Timestamp = DateTime.UtcNow }); } catch (Exception ex) { _logger.LogWarning(ex, "Failed to publish UserCreated event."); }
            }
            else if (string.IsNullOrEmpty(user.ExternalProvider))
            {
                user.ExternalProvider = provider;
                user.ExternalProviderId = providerId;
                if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(avatarUrl)) user.AvatarUrl = avatarUrl;
                _uow.Users.Update(user);
            }

            var tokens = GenerateTokens(user, "oauth");
            await _uow.RefreshTokens.CreateAsync(new RefreshToken { Token = tokens.RefreshToken, ExpiryDate = DateTime.UtcNow.AddDays(7), CreatedByIp = "oauth", UserId = user.Id });
            await _uow.CompleteAsync();

            return new Response<OAuthTokenResponse>
            {
                Success = true,
                Data = new OAuthTokenResponse
                {
                    AccessToken = tokens.AccessToken,
                    RefreshToken = tokens.RefreshToken,
                    User = _mapper.Map<UserDto>(user),
                    IsNewUser = isNewUser
                }
            };
        }

        private TokenResponse GenerateTokens(User user, string createdByIp)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 16)
            {
                _logger.LogWarning("Jwt:Key is not configured or too short. Using a temporary unsafe key.");
                jwtKey = "TEMP_UNSAFE_KEY_FOR_DEV_ONLY_FIX_THIS_IN_PROD";
            }
            var key = Encoding.ASCII.GetBytes(jwtKey);
            var jwtIssuer = _config["Jwt:Issuer"] ?? "FutureConnection.IdentityService";
            var jwtAudience = _config["Jwt:Audience"] ?? "FutureConnection.Clients";

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity([
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
                    new Claim("isOnboarded", user.IsOnboarded.ToString().ToLower()),
                    new Claim("isEmailVerified", user.IsEmailVerified.ToString().ToLower())
                ]),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return new TokenResponse { AccessToken = tokenHandler.WriteToken(token), RefreshToken = Guid.NewGuid().ToString() };
        }

        private static string GenerateSecureToken() => Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64)).Replace("+", "-").Replace("/", "_").Replace("=", "");
        private static string GenerateOtp() => Random.Shared.Next(100000, 999999).ToString();
    }
}
