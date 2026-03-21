namespace FutureConnection.Core.Entities
{
    public class Reputation : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public int Points { get; set; } // Can be positive or negative
        public string? Reason { get; set; } // e.g., "Answer Accepted", "Downvoted"
    }
}
