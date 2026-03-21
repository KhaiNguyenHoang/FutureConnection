using FutureConnection.Core.DTOs;
using FutureConnection.IdentityService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace FutureConnection.IdentityService.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IUserService userService, IAuthService authService) : ControllerBase
    {
        // ── Registration & Login ─────────────────────────────────────────────

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            var result = await userService.Register(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            dto.IpAddress = clientIp;

            var userResult = await userService.Login(dto);
            if (!userResult.Success) return Unauthorized(userResult);

            var tokenResult = await authService.LoginAsync(new LoginRequest(dto.Email, dto.Password, clientIp));
            if (tokenResult == null) return Unauthorized(new { Success = false, Message = "Authentication failed" });

            return Ok(new { Success = true, Data = userResult.Data, Tokens = tokenResult });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest req)
        {
            var result = await authService.RefreshTokenAsync(req.RefreshToken);
            if (result == null) return Unauthorized(new { Success = false, Message = "Invalid or expired refresh token" });
            return Ok(new { Success = true, Data = result });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest req)
        {
            var authHeader = Request.Headers.Authorization.ToString();
            var token = string.IsNullOrEmpty(authHeader) ? string.Empty : authHeader.Replace("Bearer ", "").Trim();

            var result = await userService.LogoutAsync(req.UserId, token);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // ── Password Management ──────────────────────────────────────────────

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var authenticatedUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (authenticatedUserId == null || !Guid.TryParse(authenticatedUserId, out var authGuid) || authGuid != req.UserId)
                return Forbid();

            var result = await userService.ChangePasswordAsync(req.UserId, req.CurrentPassword, req.NewPassword);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// Step 1 of secure password change: sends an OTP to the user's email.
        /// </summary>
        [HttpPost("change-password/request-otp")]
        [Authorize]
        public async Task<IActionResult> RequestChangePasswordOtp()
        {
            var userId = GetAuthenticatedUserId();
            if (userId == null) return Forbid();

            var result = await authService.RequestChangePasswordOtpAsync(userId.Value);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Step 2 of secure password change: verifies the OTP before allowing the change.
        /// </summary>
        [HttpPost("change-password/verify-otp")]
        [Authorize]
        public async Task<IActionResult> VerifyChangePasswordOtp([FromBody] VerifyOtpRequest req)
        {
            var userId = GetAuthenticatedUserId();
            if (userId == null) return Forbid();

            var result = await authService.VerifyChangePasswordOtpAsync(userId.Value, req.Otp);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>Sends a password reset email. Does not require authentication.</summary>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
        {
            var result = await authService.ForgotPasswordAsync(req.Email);
            return Ok(result); // Always 200 to prevent email enumeration
        }

        /// <summary>Resets the password using the token from the reset email.</summary>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
        {
            var result = await authService.ResetPasswordAsync(req.Token, req.NewPassword);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ── Email Verification ───────────────────────────────────────────────

        /// <summary>Verifies an email address using the token sent in the verification email.</summary>
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            var result = await authService.VerifyEmailAsync(token);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>Resends the verification email to the given address.</summary>
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest req)
        {
            var result = await authService.SendVerificationEmailAsync(req.Email);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ── OAuth2 ───────────────────────────────────────────────────────────

        /// <summary>
        /// Exchange a GitHub OAuth authorization code for a FutureConnection JWT.
        /// Frontend should redirect the user to GitHub, receive the code in the callback,
        /// then POST it here.
        /// </summary>
        [HttpPost("oauth/github")]
        public async Task<IActionResult> GitHubOAuth([FromBody] OAuthCodeRequest req)
        {
            var result = await authService.GitHubOAuthAsync(req.Code, req.RedirectUri);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Exchange a Google OAuth authorization code for a FutureConnection JWT.
        /// </summary>
        [HttpPost("oauth/google")]
        public async Task<IActionResult> GoogleOAuth([FromBody] OAuthCodeRequest req)
        {
            var result = await authService.GoogleOAuthAsync(req.Code, req.RedirectUri);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ── User Management ──────────────────────────────────────────────────

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
            => Ok(await userService.CheckEmail(email));

        [HttpGet("users/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var result = await userService.GetUser(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpGet("users")]
        [Authorize]
        public async Task<IActionResult> GetUsers()
            => Ok(await userService.GetAllUsers());

        [HttpPut("users/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            var authenticatedUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (authenticatedUserId == null || !Guid.TryParse(authenticatedUserId, out var authGuid) || authGuid != id)
                return Forbid();

            dto.Id = id;
            var result = await userService.UpdateUser(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("users/{id:guid}/avatar")]
        [Authorize]
        public async Task<IActionResult> UploadAvatar(Guid id, IFormFile file)
        {
            var authenticatedUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (authenticatedUserId == null || !Guid.TryParse(authenticatedUserId, out var authGuid) || authGuid != id)
                return Forbid();

            if (file == null || file.Length == 0)
                return BadRequest(new { Success = false, Message = "No file uploaded" });

            var result = await userService.UpdateAvatarAsync(id, file);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("users/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var authenticatedUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (authenticatedUserId == null || !Guid.TryParse(authenticatedUserId, out var authGuid) || authGuid != id)
                return Forbid();

            var result = await userService.DeleteUser(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private Guid? GetAuthenticatedUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public record ForgotPasswordRequest(string Email);
    public record ResetPasswordRequest(string Token, string NewPassword);
    public record VerifyOtpRequest(string Otp);
    public record ResendVerificationRequest(string Email);
    public record OAuthCodeRequest(string Code, string RedirectUri);
}
