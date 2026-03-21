using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace FutureConnection.IdentityService.Application
{
    public class AuthService(
        IUnitOfWork uow,
        IConfiguration config,
        IEventPublisher eventPublisher,
        IEmailService emailService,
        IMapper mapper,
        ILogger<AuthService> logger) : IAuthService
    {
        private static bool IsPasswordStrong(string password) =>
            password.Length >= 8 && password.Any(char.IsUpper) && password.Any(char.IsDigit);

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            var exists = await uow.Users.CheckEmail(request.Email);
            if (exists) return false;

            if (!IsPasswordStrong(request.Password)) return false;

            var roleName = request.RoleName ?? "Freelancer";
            var roles = await uow.Roles.GetAllAsync();
            var role = roles.FirstOrDefault(r => r.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase))
                       ?? roles.FirstOrDefault(r => r.Name == "Freelancer");

            var verificationToken = GenerateSecureToken();

            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                HashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = role?.Id ?? Guid.Empty,
                Role = role!,
                IsOnboarded = false,
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
            };

            await uow.Users.CreateAsync(user);
            await uow.CompleteAsync();

            // Send verification email
            try
            {
                await emailService.SendVerificationEmailAsync(user.Email, user.FirstName, verificationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send verification email to {Email}", user.Email);
            }

            try
            {
                await eventPublisher.PublishAsync("user.events", new
                {
                    EventType = "UserCreated",
                    UserId = user.Id,
                    Email = user.Email,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to publish UserCreated event for {Email}", user.Email);
            }

            return true;
        }

        public async Task<TokenResponse?> LoginAsync(LoginRequest request)
        {
            var user = await uow.Users.GetUserByEmail(request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.HashedPassword))
                return null;

            var clientIp = request.IpAddress ?? "unknown";
            if (!string.IsNullOrEmpty(user.LastLoginIp) && user.LastLoginIp != clientIp)
            {
                try
                {
                    await eventPublisher.PublishAsync("auth.events", new
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
                    logger.LogWarning(ex, "Failed to publish IPMismatch event for {Email}", request.Email);
                }
            }

            user.LastLoginIp = clientIp;
            user.LastLoginDate = DateTime.UtcNow;
            uow.Users.Update(user);

            var tokens = GenerateTokens(user, clientIp);

            await uow.RefreshTokens.CreateAsync(new RefreshToken
            {
                Token = tokens.RefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedByIp = clientIp,
                UserId = user.Id
            });
            await uow.CompleteAsync();

            return tokens;
        }

        public async Task<TokenResponse?> RefreshTokenAsync(string refreshToken)
        {
            var tokenEntity = await uow.RefreshTokens.GetByTokenAsync(refreshToken);

            if (tokenEntity == null || !tokenEntity.IsActive)
                return null;

            var user = await uow.Users.GetByIdAsync(tokenEntity.UserId);
            if (user == null) return null;

            tokenEntity.IsRevoked = true;
            tokenEntity.RevokedAt = DateTime.UtcNow;
            uow.RefreshTokens.Update(tokenEntity);

            var tokens = GenerateTokens(user, tokenEntity.CreatedByIp);

            await uow.RefreshTokens.CreateAsync(new RefreshToken
            {
                Token = tokens.RefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedByIp = tokenEntity.CreatedByIp,
                UserId = user.Id
            });
            await uow.CompleteAsync();

            return tokens;
        }

        // ── Email Verification ──────────────────────────────────────────────

        public async Task<Response<string>> SendVerificationEmailAsync(string email)
        {
            var user = await uow.Users.GetUserByEmail(email);
            if (user == null) return new Response<string> { Success = false, Message = "User not found." };
            if (user.IsEmailVerified) return new Response<string> { Success = false, Message = "Email is already verified." };

            user.EmailVerificationToken = GenerateSecureToken();
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
            uow.Users.Update(user);
            await uow.CompleteAsync();

            try
            {
                await emailService.SendVerificationEmailAsync(user.Email, user.FirstName, user.EmailVerificationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send verification email to {Email}", email);
            }

            return new Response<string> { Success = true, Message = "Verification email sent." };
        }

        public async Task<Response<string>> VerifyEmailAsync(string token)
        {
            var allUsers = await uow.Users.GetAllAsync();
            var user = allUsers.FirstOrDefault(u => u.EmailVerificationToken == token);
            if (user == null) return new Response<string> { Success = false, Message = "Invalid or expired verification token." };
            if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                return new Response<string> { Success = false, Message = "Verification token has expired. Please request a new one." };

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            uow.Users.Update(user);
            await uow.CompleteAsync();

            return new Response<string> { Success = true, Message = "Email verified successfully." };
        }

        // ── Password Reset ──────────────────────────────────────────────────

        public async Task<Response<string>> ForgotPasswordAsync(string email)
        {
            var user = await uow.Users.GetUserByEmail(email);
            // Always return success to prevent email enumeration
            if (user == null) return new Response<string> { Success = true, Message = "If that email exists, a reset link has been sent." };

            user.ResetPasswordToken = GenerateSecureToken();
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(1);
            uow.Users.Update(user);
            await uow.CompleteAsync();

            try
            {
                await emailService.SendPasswordResetEmailAsync(user.Email, user.FirstName, user.ResetPasswordToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send password reset email to {Email}", email);
            }

            return new Response<string> { Success = true, Message = "If that email exists, a reset link has been sent." };
        }

        public async Task<Response<string>> ResetPasswordAsync(string token, string newPassword)
        {
            if (!IsPasswordStrong(newPassword))
                return new Response<string> { Success = false, Message = "Password must be at least 8 characters with one uppercase letter and one digit." };

            var allUsers = await uow.Users.GetAllAsync();
            var user = allUsers.FirstOrDefault(u => u.ResetPasswordToken == token);
            if (user == null) return new Response<string> { Success = false, Message = "Invalid or expired reset token." };
            if (user.ResetPasswordTokenExpiry < DateTime.UtcNow)
                return new Response<string> { Success = false, Message = "Reset token has expired. Please request a new one." };

            user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;
            uow.Users.Update(user);

            // Revoke all refresh tokens for security
            var activeTokens = (await uow.RefreshTokens.GetAllAsync()).Where(rt => rt.UserId == user.Id && rt.IsActive);
            foreach (var rt in activeTokens)
            {
                rt.IsRevoked = true;
                rt.RevokedAt = DateTime.UtcNow;
                uow.RefreshTokens.Update(rt);
            }

            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Password reset successfully. Please log in with your new password." };
        }

        // ── Change Password OTP ─────────────────────────────────────────────

        public async Task<Response<string>> RequestChangePasswordOtpAsync(Guid userId)
        {
            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null) return new Response<string> { Success = false, Message = "User not found." };

            var otp = GenerateOtp();
            user.ChangePasswordOtp = BCrypt.Net.BCrypt.HashPassword(otp);
            user.ChangePasswordOtpExpiry = DateTime.UtcNow.AddMinutes(10);
            uow.Users.Update(user);
            await uow.CompleteAsync();

            try
            {
                await emailService.SendChangePasswordOtpAsync(user.Email, user.FirstName, otp);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send OTP email to {Email}", user.Email);
            }

            return new Response<string> { Success = true, Message = "OTP sent to your email address." };
        }

        public async Task<Response<string>> VerifyChangePasswordOtpAsync(Guid userId, string otp)
        {
            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null) return new Response<string> { Success = false, Message = "User not found." };
            if (string.IsNullOrEmpty(user.ChangePasswordOtp) || user.ChangePasswordOtpExpiry < DateTime.UtcNow)
                return new Response<string> { Success = false, Message = "OTP has expired. Please request a new one." };
            if (!BCrypt.Net.BCrypt.Verify(otp, user.ChangePasswordOtp))
                return new Response<string> { Success = false, Message = "Invalid OTP." };

            // Clear OTP after successful verification
            user.ChangePasswordOtp = null;
            user.ChangePasswordOtpExpiry = null;
            uow.Users.Update(user);
            await uow.CompleteAsync();

            return new Response<string> { Success = true, Message = "OTP verified." };
        }

        // ── OAuth2 ──────────────────────────────────────────────────────────

        public async Task<Response<OAuthTokenResponse>> GitHubOAuthAsync(string code, string redirectUri)
        {
            var clientId = config["OAuth:GitHub:ClientId"] ?? throw new InvalidOperationException("OAuth:GitHub:ClientId not configured.");
            var clientSecret = config["OAuth:GitHub:ClientSecret"] ?? throw new InvalidOperationException("OAuth:GitHub:ClientSecret not configured.");

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Add("Accept", "application/json");
            http.DefaultRequestHeaders.Add("User-Agent", "FutureConnection");

            // Exchange code for access token
            var tokenRes = await http.PostAsJsonAsync("https://github.com/login/oauth/access_token", new
            {
                client_id = clientId,
                client_secret = clientSecret,
                code,
                redirect_uri = redirectUri
            });

            var tokenJson = await tokenRes.Content.ReadFromJsonAsync<JsonElement>();
            if (!tokenJson.TryGetProperty("access_token", out var accessTokenEl))
                return new Response<OAuthTokenResponse> { Success = false, Message = "Failed to obtain GitHub access token." };

            var githubToken = accessTokenEl.GetString()!;

            // Get user profile
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", githubToken);
            var profileRes = await http.GetFromJsonAsync<JsonElement>("https://api.github.com/user");

            var githubId = profileRes.GetProperty("id").GetInt64().ToString();
            var githubEmail = profileRes.TryGetProperty("email", out var emailEl) && emailEl.ValueKind != JsonValueKind.Null
                ? emailEl.GetString()
                : null;
            var firstName = profileRes.TryGetProperty("name", out var nameEl) && nameEl.ValueKind != JsonValueKind.Null
                ? nameEl.GetString()?.Split(' ').FirstOrDefault() ?? "GitHub"
                : "GitHub";
            var lastName = profileRes.TryGetProperty("name", out var nameEl2) && nameEl2.ValueKind != JsonValueKind.Null
                ? nameEl2.GetString()?.Split(' ').Skip(1).FirstOrDefault() ?? "User"
                : "User";
            var avatarUrl = profileRes.TryGetProperty("avatar_url", out var avatarEl) ? avatarEl.GetString() : null;

            // If no public email, fetch from /user/emails endpoint
            if (string.IsNullOrEmpty(githubEmail))
            {
                var emailsRes = await http.GetFromJsonAsync<JsonElement[]>("https://api.github.com/user/emails");
                githubEmail = emailsRes?
                    .Where(e => e.TryGetProperty("primary", out var p) && p.GetBoolean())
                    .Select(e => e.TryGetProperty("email", out var em) ? em.GetString() : null)
                    .FirstOrDefault(e => !string.IsNullOrEmpty(e));
            }

            if (string.IsNullOrEmpty(githubEmail))
                return new Response<OAuthTokenResponse> { Success = false, Message = "GitHub account has no accessible email address." };

            return await FindOrCreateOAuthUserAsync(githubEmail, firstName, lastName, avatarUrl, "GitHub", githubId);
        }

        public async Task<Response<OAuthTokenResponse>> GoogleOAuthAsync(string code, string redirectUri)
        {
            var clientId = config["OAuth:Google:ClientId"] ?? throw new InvalidOperationException("OAuth:Google:ClientId not configured.");
            var clientSecret = config["OAuth:Google:ClientSecret"] ?? throw new InvalidOperationException("OAuth:Google:ClientSecret not configured.");

            using var http = new HttpClient();

            // Exchange code for access token
            var tokenRes = await http.PostAsync("https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["code"] = code,
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["redirect_uri"] = redirectUri,
                    ["grant_type"] = "authorization_code"
                }));

            var tokenJson = await tokenRes.Content.ReadFromJsonAsync<JsonElement>();
            if (!tokenJson.TryGetProperty("access_token", out var accessTokenEl))
                return new Response<OAuthTokenResponse> { Success = false, Message = "Failed to obtain Google access token." };

            var googleToken = accessTokenEl.GetString()!;

            // Get user profile
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", googleToken);
            var profile = await http.GetFromJsonAsync<JsonElement>("https://www.googleapis.com/oauth2/v3/userinfo");

            var googleId = profile.GetProperty("sub").GetString()!;
            var email = profile.GetProperty("email").GetString()!;
            var firstName = profile.TryGetProperty("given_name", out var gnEl) ? gnEl.GetString() ?? "Google" : "Google";
            var lastName = profile.TryGetProperty("family_name", out var fnEl) ? fnEl.GetString() ?? "User" : "User";
            var avatarUrl = profile.TryGetProperty("picture", out var picEl) ? picEl.GetString() : null;

            return await FindOrCreateOAuthUserAsync(email, firstName, lastName, avatarUrl, "Google", googleId);
        }

        // ── Helpers ─────────────────────────────────────────────────────────

        private async Task<Response<OAuthTokenResponse>> FindOrCreateOAuthUserAsync(
            string email, string firstName, string lastName, string? avatarUrl,
            string provider, string providerId)
        {
            // Try find by provider ID first, then by email
            var allUsers = await uow.Users.GetAllAsync();
            var user = allUsers.FirstOrDefault(u => u.ExternalProvider == provider && u.ExternalProviderId == providerId)
                    ?? await uow.Users.GetUserByEmail(email);

            bool isNewUser = false;

            if (user == null)
            {
                var roles = await uow.Roles.GetAllAsync();
                var freelancerRole = roles.FirstOrDefault(r => r.Name == "Freelancer");

                user = new User
                {
                    Id = Guid.NewGuid(),
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    // OAuth users have no password — set a non-loginable placeholder
                    HashedPassword = "OAUTH_" + Guid.NewGuid().ToString("N"),
                    RoleId = freelancerRole?.Id ?? Guid.Empty,
                    Role = freelancerRole!,
                    IsOnboarded = false,
                    IsEmailVerified = true, // Email verified by OAuth provider
                    ExternalProvider = provider,
                    ExternalProviderId = providerId,
                    AvatarUrl = avatarUrl
                };
                await uow.Users.CreateAsync(user);
                isNewUser = true;

                try
                {
                    await eventPublisher.PublishAsync("user.events", new
                    {
                        EventType = "UserCreated",
                        UserId = user.Id,
                        Email = user.Email,
                        Timestamp = DateTime.UtcNow
                    });
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to publish UserCreated event for OAuth user {Email}", email);
                }
            }
            else
            {
                // Link existing account to OAuth provider if not already linked
                if (string.IsNullOrEmpty(user.ExternalProvider))
                {
                    user.ExternalProvider = provider;
                    user.ExternalProviderId = providerId;
                    if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(avatarUrl))
                        user.AvatarUrl = avatarUrl;
                    uow.Users.Update(user);
                }
            }

            var tokens = GenerateTokens(user, "oauth");
            await uow.RefreshTokens.CreateAsync(new RefreshToken
            {
                Token = tokens.RefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedByIp = "oauth",
                UserId = user.Id
            });
            await uow.CompleteAsync();

            return new Response<OAuthTokenResponse>
            {
                Success = true,
                Data = new OAuthTokenResponse
                {
                    AccessToken = tokens.AccessToken,
                    RefreshToken = tokens.RefreshToken,
                    User = mapper.Map<UserDto>(user),
                    IsNewUser = isNewUser
                }
            };
        }

        private TokenResponse GenerateTokens(User user, string createdByIp)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured."));
            var jwtIssuer = config["Jwt:Issuer"] ?? "FutureConnection.IdentityService";
            var jwtAudience = config["Jwt:Audience"] ?? "FutureConnection.Clients";

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

        private static string GenerateSecureToken() =>
            Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64))
                   .Replace("+", "-").Replace("/", "_").Replace("=", "");

        private static string GenerateOtp() =>
            Random.Shared.Next(100000, 999999).ToString();
    }
}
