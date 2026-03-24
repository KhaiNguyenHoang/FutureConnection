namespace FutureConnection.Core.Entities
{
    public class QuestionMedia : BaseEntity
    {
        public required string MediaUrl { get; set; }
        public required string PublicId { get; set; }
        public required string ResourceType { get; set; } // "image" or "video"

        public Guid QuestionId { get; set; }
        public virtual Question Question { get; set; } = null!;
    }
}
