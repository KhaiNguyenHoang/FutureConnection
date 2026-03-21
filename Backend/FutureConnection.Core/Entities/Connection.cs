using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Connection : BaseEntity
    {
        public Guid RequesterId { get; set; }
        public virtual User Requester { get; set; } = null!;

        public Guid AddresseeId { get; set; }
        public virtual User Addressee { get; set; } = null!;

        public ConnectionStatus Status { get; set; } = ConnectionStatus.Pending;
    }
}
