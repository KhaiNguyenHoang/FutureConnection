using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Contract : BaseEntity
    {
        public Guid ApplicationId { get; set; }
        public virtual Application Application { get; set; } = null!;

        public Guid EmployerId { get; set; }
        public virtual User Employer { get; set; } = null!;

        public Guid FreelancerId { get; set; }
        public virtual User Freelancer { get; set; } = null!;

        public decimal AgreedPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public ContractStatus Status { get; set; } = ContractStatus.PendingSignature;

        public virtual ICollection<Review> Reviews { get; set; } = [];

        // Upwork Advanced Features
        public virtual ICollection<ContractMilestone> Milestones { get; set; } = [];
        public virtual ICollection<Transaction> Transactions { get; set; } = [];
        public virtual ICollection<Dispute> Disputes { get; set; } = [];
    }
}
