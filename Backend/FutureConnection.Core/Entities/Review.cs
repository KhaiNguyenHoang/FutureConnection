namespace FutureConnection.Core.Entities
{
    public class Review : BaseEntity
    {
        public Guid ContractId { get; set; }
        public virtual Contract Contract { get; set; } = null!;

        public Guid ReviewerId { get; set; }
        public virtual User Reviewer { get; set; } = null!;

        public Guid RevieweeId { get; set; }
        public virtual User Reviewee { get; set; } = null!;

        public int Score { get; set; } // 1 to 5
        public string? Comment { get; set; }
    }
}
