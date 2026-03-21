namespace FutureConnection.Core.Entities
{
    public class PostMedia : BaseEntity
    {
        public required string MediaUrl { get; set; }
        public required string PublicId { get; set; }
        public required string ResourceType { get; set; } // "image" or "video"

        public Guid PostId { get; set; }
        public virtual Post Post { get; set; } = null!;
    }
}
