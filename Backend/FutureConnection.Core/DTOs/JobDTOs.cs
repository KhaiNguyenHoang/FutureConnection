using System;
using FutureConnection.Core.Enums;

namespace FutureConnection.Core.DTOs
{
    // --- Job DTOs ---
    public class JobDto : BaseDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public decimal? Budget { get; set; }
        public string? LocationType { get; set; }
        public string? SeniorityLevel { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public DateTime? Deadline { get; set; }
        public JobStatus Status { get; set; }
        public Guid EmployerId { get; set; }
        public Guid JobTypeId { get; set; }
    }

    public class CreateJobDto
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
        public decimal? Budget { get; set; }
        public string? LocationType { get; set; }
        public string? SeniorityLevel { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public DateTime? Deadline { get; set; }
        public Guid EmployerId { get; set; }
        public Guid JobTypeId { get; set; }
    }

    public class UpdateJobDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? Budget { get; set; }
        public string? LocationType { get; set; }
        public string? SeniorityLevel { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public DateTime? Deadline { get; set; }
        public JobStatus? Status { get; set; }
    }

    // --- JobTag DTOs ---
    public class JobTagDto : BaseDto
    {
        public Guid JobId { get; set; }
        public Guid TagId { get; set; }
    }

    public class CreateJobTagDto
    {
        public Guid JobId { get; set; }
        public Guid TagId { get; set; }
    }

    // --- JobType DTOs ---
    public class JobTypeDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class CreateJobTypeDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateJobTypeDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
    }

    // --- Application DTOs ---
    public class ApplicationDto : BaseDto
    {
        public required string CoverLetter { get; set; }
        public decimal? ProposedPrice { get; set; }
        public string? AttachmentsUrl { get; set; }
        public string? ProposedMilestones { get; set; }
        public ApplicationStatus Status { get; set; }
        public Guid JobId { get; set; }
        public Guid ApplicantId { get; set; }
    }

    public class CreateApplicationDto
    {
        public required string CoverLetter { get; set; }
        public decimal? ProposedPrice { get; set; }
        public string? AttachmentsUrl { get; set; }
        public string? ProposedMilestones { get; set; }
        public Guid JobId { get; set; }
        public Guid ApplicantId { get; set; }
    }

    public class UpdateApplicationDto
    {
        public Guid Id { get; set; }
        public string? CoverLetter { get; set; }
        public decimal? ProposedPrice { get; set; }
        public string? AttachmentsUrl { get; set; }
        public string? ProposedMilestones { get; set; }
        public ApplicationStatus? Status { get; set; }
    }
}
