using System;
using FutureConnection.Core.Enums;

namespace FutureConnection.Core.DTOs
{
    // --- Agency DTOs ---
    public class AgencyDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }
        public Guid OwnerId { get; set; }
    }

    public class CreateAgencyDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }
        public Guid OwnerId { get; set; }
    }

    public class UpdateAgencyDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }
    }

    // --- AgencyMember DTOs ---
    public class AgencyMemberDto : BaseDto
    {
        public Guid AgencyId { get; set; }
        public Guid UserId { get; set; }
        public AgencyRole Role { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class CreateAgencyMemberDto
    {
        public Guid AgencyId { get; set; }
        public Guid UserId { get; set; }
        public AgencyRole Role { get; set; } = AgencyRole.Member;
    }

    // --- Contract DTOs ---
    public class ContractDto : BaseDto
    {
        public Guid ApplicationId { get; set; }
        public Guid EmployerId { get; set; }
        public Guid FreelancerId { get; set; }
        public decimal AgreedPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public ContractStatus Status { get; set; }
    }

    public class CreateContractDto
    {
        public Guid ApplicationId { get; set; }
        public Guid EmployerId { get; set; }
        public Guid FreelancerId { get; set; }
        public decimal AgreedPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class UpdateContractDto
    {
        public Guid Id { get; set; }
        public ContractStatus? Status { get; set; }
        public DateTime? EndDate { get; set; }
    }

    // --- ContractMilestone DTOs ---
    public class ContractMilestoneDto : BaseDto
    {
        public Guid ContractId { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsPaid { get; set; }
    }

    public class CreateContractMilestoneDto
    {
        public Guid ContractId { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateContractMilestoneDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? IsCompleted { get; set; }
        public bool? IsPaid { get; set; }
    }

    // --- Transaction DTOs ---
    public class TransactionDto : BaseDto
    {
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public Guid? RelatedContractId { get; set; }
        public Guid? RelatedMilestoneId { get; set; }
    }

    // --- Dispute DTOs ---
    public class DisputeDto : BaseDto
    {
        public Guid ContractId { get; set; }
        public Guid IssuerId { get; set; }
        public required string Reason { get; set; }
        public string? Resolution { get; set; }
        public DisputeStatus Status { get; set; }
    }

    public class CreateDisputeDto
    {
        public Guid ContractId { get; set; }
        public Guid IssuerId { get; set; }
        public required string Reason { get; set; }
    }

    public class UpdateDisputeDto
    {
        public Guid Id { get; set; }
        public string? Resolution { get; set; }
        public DisputeStatus? Status { get; set; }
    }

    // --- Review DTOs ---
    public class ReviewDto : BaseDto
    {
        public Guid ContractId { get; set; }
        public Guid ReviewerId { get; set; }
        public Guid RevieweeId { get; set; }
        public int Score { get; set; }
        public string? Comment { get; set; }
    }

    public class CreateReviewDto
    {
        public Guid ContractId { get; set; }
        public Guid ReviewerId { get; set; }
        public Guid RevieweeId { get; set; }
        public int Score { get; set; }
        public string? Comment { get; set; }
    }
}
