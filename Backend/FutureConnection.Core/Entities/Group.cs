namespace FutureConnection.Core.Entities
{
    public class Group : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? AvatarUrl { get; set; }

        public virtual ICollection<GroupMember> Members { get; set; } = [];
        public virtual ICollection<Message> Messages { get; set; } = [];
        public virtual ICollection<Channel> Channels { get; set; } = [];
    }
}
