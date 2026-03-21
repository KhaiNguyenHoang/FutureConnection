namespace FutureConnection.Core.Entities
{
    public class FrameworkType : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}
