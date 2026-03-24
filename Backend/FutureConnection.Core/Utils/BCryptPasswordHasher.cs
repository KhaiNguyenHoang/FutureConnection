using BCrypt.Net;

namespace FutureConnection.Core.Utils
{
    public class BCryptPasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(hashedPassword)) return false;

            // Identity service uses "OAUTH_" prefix for social login placeholders
            if (hashedPassword.StartsWith("OAUTH_")) return false;

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch (Exception)
            {
                // If hashing format is invalid, just treat as failed verification rather than throwing 500
                return false;
            }
        }
    }
}
