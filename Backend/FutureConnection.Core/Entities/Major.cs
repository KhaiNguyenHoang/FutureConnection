namespace FutureConnection.Core.Entities
{
    public class Major : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}
