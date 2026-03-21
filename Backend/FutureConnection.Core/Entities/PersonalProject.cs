namespace FutureConnection.Core.Entities
{
    public class PersonalProject : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public Guid? CVId { get; set; }
        public virtual CV? CV { get; set; }

        public required string Name { get; set; }
        public virtual ICollection<ProjectRole> ProjectRoles { get; set; } = [];
        public virtual ICollection<Framework> Frameworks { get; set; } = [];
        public required string Description { get; set; }
        public required string RepositoryUrl { get; set; }
        public string? DeploymentUrl { get; set; }
        public required DateTime StartAt { get; set; }
        public DateTime? EndAt { get; set; }
    }
}
