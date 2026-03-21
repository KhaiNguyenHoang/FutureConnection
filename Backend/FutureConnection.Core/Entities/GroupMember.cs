using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class GroupMember : BaseEntity
    {
        public Guid GroupId { get; set; }
        public virtual Group Group { get; set; } = null!;

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public GroupRole Role { get; set; } = GroupRole.Member;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
