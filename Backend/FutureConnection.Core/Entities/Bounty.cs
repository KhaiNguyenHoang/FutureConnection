namespace FutureConnection.Core.Entities
{
    public class Bounty : BaseEntity
    {
        public Guid QuestionId { get; set; }
        public virtual Question Question { get; set; } = null!;

        public Guid AwarderId { get; set; }
        public virtual User Awarder { get; set; } = null!;

        public Guid? WinnerId { get; set; }
        public virtual User? Winner { get; set; }

        public int Points { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsAwarded { get; set; } = false;
    }
}
