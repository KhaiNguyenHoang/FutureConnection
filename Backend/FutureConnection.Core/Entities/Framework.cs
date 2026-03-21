namespace FutureConnection.Core.Entities
{
    public class Framework : BaseEntity
    {
        public Guid? LanguageId { get; set; }
        public virtual CodeLanguage? Language { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string DocumentationUrl { get; set; }
        public required virtual ICollection<FrameworkType> FrameworkTypes { get; set; }
    }
}
