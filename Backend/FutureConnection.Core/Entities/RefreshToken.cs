namespace FutureConnection.Core.Entities
{
    public class RefreshToken : BaseEntity
    {
        public required string Token { get; set; }
        public DateTime ExpiryDate { get; set; }

        public bool IsRevoked { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? RevokedByIp { get; set; }

        public required string CreatedByIp { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public new bool IsActive => !IsRevoked && ExpiryDate > DateTime.UtcNow;
    }
}
