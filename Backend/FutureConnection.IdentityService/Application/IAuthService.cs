using FutureConnection.Core.DTOs;

namespace FutureConnection.IdentityService.Application
{
    public interface IAuthService
    {
        Task<TokenResponse?> LoginAsync(LoginRequest request);
        Task<bool> RegisterAsync(RegisterRequest request);
        Task<TokenResponse?> RefreshTokenAsync(string refreshToken);

        // Email verification
        Task<Response<string>> SendVerificationEmailAsync(string email);
        Task<Response<string>> VerifyEmailAsync(string token);

        // Password reset
        Task<Response<string>> ForgotPasswordAsync(string email);
        Task<Response<string>> ResetPasswordAsync(string token, string newPassword);

        // Change password OTP
        Task<Response<string>> RequestChangePasswordOtpAsync(Guid userId);
        Task<Response<string>> VerifyChangePasswordOtpAsync(Guid userId, string otp);

        // OAuth2
        Task<Response<OAuthTokenResponse>> GitHubOAuthAsync(string code, string redirectUri);
        Task<Response<OAuthTokenResponse>> GoogleOAuthAsync(string code, string redirectUri);
    }

    public record LoginRequest(string Email, string Password, string? IpAddress = null);
    public record RegisterRequest(string FirstName, string LastName, string Email, string Password, string? RoleName = "Freelancer");
    public record ChangePasswordRequest(Guid UserId, string CurrentPassword, string NewPassword, string? Otp = null);
    public record LogoutRequest(Guid UserId);
    public record RefreshTokenRequest(string RefreshToken);

    public record TokenResponse
    {
        public string AccessToken { get; init; } = null!;
        public string RefreshToken { get; init; } = null!;
    }

    public record OAuthTokenResponse
    {
        public string AccessToken { get; init; } = null!;
        public string RefreshToken { get; init; } = null!;
        public UserDto User { get; init; } = null!;
        public bool IsNewUser { get; init; }
    }
}
