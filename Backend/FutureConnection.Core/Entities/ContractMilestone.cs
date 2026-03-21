namespace FutureConnection.Core.Entities
{
    public class ContractMilestone : BaseEntity
    {
        public Guid ContractId { get; set; }
        public virtual Contract Contract { get; set; } = null!;

        public required string Title { get; set; }
        public string? Description { get; set; }

        public decimal Amount { get; set; }
        public DateTime? DueDate { get; set; }

        public bool IsCompleted { get; set; } = false;
        public bool IsPaid { get; set; } = false;
    }
}
