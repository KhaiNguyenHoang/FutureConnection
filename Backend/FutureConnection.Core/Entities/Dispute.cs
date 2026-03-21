using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Dispute : BaseEntity
    {
        public Guid ContractId { get; set; }
        public virtual Contract Contract { get; set; } = null!;

        public Guid IssuerId { get; set; }
        public virtual User Issuer { get; set; } = null!;

        public required string Reason { get; set; }
        public string? Resolution { get; set; }

        public DisputeStatus Status { get; set; } = DisputeStatus.Open;
    }
}
