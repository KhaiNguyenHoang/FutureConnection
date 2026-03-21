using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Transaction : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }

        public Guid? RelatedContractId { get; set; }
        public virtual Contract? RelatedContract { get; set; }

        public Guid? RelatedMilestoneId { get; set; }
        public virtual ContractMilestone? RelatedMilestone { get; set; }
    }
}
