namespace FutureConnection.Core.Interfaces.Infrastructure
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);
        Task SendVerificationEmailAsync(string toEmail, string toName, string token);
        Task SendPasswordResetEmailAsync(string toEmail, string toName, string token);
        Task SendChangePasswordOtpAsync(string toEmail, string toName, string otp);
    }
}
