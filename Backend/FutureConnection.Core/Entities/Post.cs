namespace FutureConnection.Core.Entities
{
    public class Post : BaseEntity
    {
        public required string Title { get; set; }
        public required string Content { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public virtual ICollection<Comment> Comments { get; set; } = [];
        public virtual ICollection<Reaction> Reactions { get; set; } = [];
        public virtual ICollection<PostTag> PostTags { get; set; } = [];
        public virtual ICollection<PostMedia> Media { get; set; } = [];
    }
}
