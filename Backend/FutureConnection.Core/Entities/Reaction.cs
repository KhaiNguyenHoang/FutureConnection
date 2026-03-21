using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Reaction : BaseEntity
    {
        public ReactionType Type { get; set; }

        public Guid? PostId { get; set; }
        public virtual Post? Post { get; set; }

        public Guid? MessageId { get; set; }
        public virtual Message? Message { get; set; }

        public Guid? CommentId { get; set; }
        public virtual Comment? Comment { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
    }
}
