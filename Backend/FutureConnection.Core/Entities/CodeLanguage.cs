namespace FutureConnection.Core.Entities
{
    public class CodeLanguage : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string DocumentationUrl { get; set; }
        public virtual ICollection<Framework> Frameworks { get; set; } = [];
    }
}
