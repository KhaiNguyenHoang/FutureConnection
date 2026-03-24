namespace FutureConnection.Core.Entities
{
    public class AnswerMedia : BaseEntity
    {
        public required string MediaUrl { get; set; }
        public required string PublicId { get; set; }
        public required string ResourceType { get; set; } // "image" or "video"

        public Guid AnswerId { get; set; }
        public virtual Answer Answer { get; set; } = null!;
    }
}
