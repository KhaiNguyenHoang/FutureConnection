using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Channel : BaseEntity
    {
        public Guid GroupId { get; set; }
        public virtual Group Group { get; set; } = null!;

        public required string Name { get; set; }
        public string? Description { get; set; }

        public ChannelType Type { get; set; } = ChannelType.Text;

        public virtual ICollection<Message> Messages { get; set; } = [];
    }
}
