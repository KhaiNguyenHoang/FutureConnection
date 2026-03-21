namespace FutureConnection.Core.Entities
{
    public class Role : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}
