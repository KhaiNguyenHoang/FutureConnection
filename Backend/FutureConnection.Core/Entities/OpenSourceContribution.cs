namespace FutureConnection.Core.Entities
{
    public class OpenSourceContribution : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public required string RepositoryUrl { get; set; }
        public string? PullRequestUrl { get; set; }
        public required string Title { get; set; }

        public string Status { get; set; } = "Open"; // e.g., Open, Merged, Closed
        public DateTime? MergedAt { get; set; }
    }
}
