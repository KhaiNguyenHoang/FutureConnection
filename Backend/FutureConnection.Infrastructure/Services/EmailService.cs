using FutureConnection.Core.Interfaces.Infrastructure;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace FutureConnection.Infrastructure.Services
{
    public class EmailService(IConfiguration config) : IEmailService
    {
        private readonly string _smtpHost = config["Email:SmtpHost"] ?? "smtp.gmail.com";
        private readonly int _smtpPort = int.Parse(config["Email:SmtpPort"] ?? "587");
        private readonly string _smtpUser = config["Email:SmtpUser"] ?? "";
        private readonly string _smtpPassword = config["Email:SmtpPassword"] ?? "";
        private readonly string _fromEmail = config["Email:FromEmail"] ?? "no-reply@futureconnection.io";
        private readonly string _fromName = config["Email:FromName"] ?? "FutureConnection";
        private readonly string _appUrl = config["App:Url"] ?? "http://localhost:3000";

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_fromName, _fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUser, _smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public async Task SendVerificationEmailAsync(string toEmail, string toName, string token)
        {
            var link = $"{_appUrl}/verify-email?token={Uri.EscapeDataString(token)}";
            var body = $"""
                <h2>Verify your FutureConnection account</h2>
                <p>Hi {toName},</p>
                <p>Click the button below to verify your email address. This link expires in 24 hours.</p>
                <p><a href="{link}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Verify Email</a></p>
                <p>Or copy this link: {link}</p>
                <p>If you didn't create an account, you can ignore this email.</p>
                """;
            await SendEmailAsync(toEmail, toName, "Verify your email — FutureConnection", body);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string toName, string token)
        {
            var link = $"{_appUrl}/reset-password?token={Uri.EscapeDataString(token)}";
            var body = $"""
                <h2>Reset your password</h2>
                <p>Hi {toName},</p>
                <p>Click the button below to reset your password. This link expires in 1 hour.</p>
                <p><a href="{link}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
                <p>Or copy this link: {link}</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                """;
            await SendEmailAsync(toEmail, toName, "Reset your password — FutureConnection", body);
        }

        public async Task SendChangePasswordOtpAsync(string toEmail, string toName, string otp)
        {
            var body = $"""
                <h2>Password change verification</h2>
                <p>Hi {toName},</p>
                <p>Your one-time verification code is:</p>
                <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#4F46E5;">{otp}</p>
                <p>This code expires in 10 minutes. Do not share it with anyone.</p>
                <p>If you didn't request this, please change your password immediately.</p>
                """;
            await SendEmailAsync(toEmail, toName, "Your password change OTP — FutureConnection", body);
        }
    }
}
