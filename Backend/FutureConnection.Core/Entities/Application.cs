using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Application : BaseEntity
    {
        public required string CoverLetter { get; set; }
        public decimal? ProposedPrice { get; set; }

        // Upwork Advanced Features (Proposal extensions)
        public string? AttachmentsUrl { get; set; }
        public string? ProposedMilestones { get; set; } // JSON or text detailing the proposed split

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        public Guid JobId { get; set; }
        public virtual Job Job { get; set; } = null!;

        public Guid ApplicantId { get; set; }
        public virtual User Applicant { get; set; } = null!;
    }
}
