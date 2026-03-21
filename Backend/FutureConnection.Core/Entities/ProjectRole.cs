namespace FutureConnection.Core.Entities
{
    public class ProjectRole : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}
