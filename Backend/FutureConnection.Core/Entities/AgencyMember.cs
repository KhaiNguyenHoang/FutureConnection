using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class AgencyMember : BaseEntity
    {
        public Guid AgencyId { get; set; }
        public virtual Agency Agency { get; set; } = null!;

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public AgencyRole Role { get; set; } = AgencyRole.Member;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
