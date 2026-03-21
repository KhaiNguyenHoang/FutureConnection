namespace FutureConnection.Core.Entities
{
    public class Company : BaseEntity
    {
        public required string Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; } // e.g., "1-10", "11-50", "1000+"
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? Description { get; set; }

        public Guid OwnerId { get; set; }
        public virtual User Owner { get; set; } = null!;

        public virtual ICollection<CompanyFollower> Followers { get; set; } = [];
        public virtual ICollection<Job> PostedJobs { get; set; } = [];
    }
}
