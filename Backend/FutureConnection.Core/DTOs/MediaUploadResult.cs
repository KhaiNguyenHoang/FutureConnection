namespace FutureConnection.Core.DTOs
{
    public class MediaUploadResult
    {
        public required string Url { get; set; }
        public required string PublicId { get; set; }
        public string ResourceType { get; set; } = "image"; // "image" or "video"
    }
}
