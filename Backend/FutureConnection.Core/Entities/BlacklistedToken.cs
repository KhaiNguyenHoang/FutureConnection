namespace FutureConnection.Core.Entities
{
    public class BlacklistedToken : BaseEntity
    {
        public required string Token { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string? Reason { get; set; }
    }
}
