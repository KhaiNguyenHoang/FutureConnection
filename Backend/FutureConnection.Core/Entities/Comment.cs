namespace FutureConnection.Core.Entities
{
    public class Comment : BaseEntity
    {
        public required string Content { get; set; }

        public Guid? ParentCommentId { get; set; }
        public virtual Comment? ParentComment { get; set; }
        public virtual ICollection<Comment> Replies { get; set; } = [];

        public Guid PostId { get; set; }
        public virtual Post Post { get; set; } = null!;

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public virtual ICollection<CommentMedia> Media { get; set; } = [];
        public virtual ICollection<Reaction> Reactions { get; set; } = [];
    }
}
