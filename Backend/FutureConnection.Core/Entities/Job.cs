using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Job : BaseEntity
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public decimal? Budget { get; set; }

        // LinkedIn-like extensions
        public string? LocationType { get; set; } // Remote, Hybrid, On-site
        public string? SeniorityLevel { get; set; } // Junior, Mid, Senior, Lead
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }

        public DateTime? Deadline { get; set; }
        public JobStatus Status { get; set; } = JobStatus.Open;

        public Guid EmployerId { get; set; }
        public virtual User Employer { get; set; } = null!;

        public Guid JobTypeId { get; set; }
        public virtual JobType JobType { get; set; } = null!;

        public virtual ICollection<Application> Applications { get; set; } = [];
        public virtual ICollection<JobTag> JobTags { get; set; } = [];
    }
}
