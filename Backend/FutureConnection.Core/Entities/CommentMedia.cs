namespace FutureConnection.Core.Entities
{
    public class CommentMedia : BaseEntity
    {
        public required string MediaUrl { get; set; }
        public required string PublicId { get; set; }
        public required string ResourceType { get; set; } // "image" or "video"

        public Guid CommentId { get; set; }
        public virtual Comment Comment { get; set; } = null!;
    }
}
