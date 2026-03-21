using System;

namespace FutureConnection.Core.DTOs
{
    // --- Tag DTOs ---
    public class TagDto : BaseDto
    {
        public required string Name { get; set; }
    }

    public class CreateTagDto
    {
        public required string Name { get; set; }
    }

    // --- CodeLanguage DTOs ---
    public class CodeLanguageDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string DocumentationUrl { get; set; }
    }

    public class CreateCodeLanguageDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string DocumentationUrl { get; set; }
    }

    // --- Framework DTOs ---
    public class FrameworkDto : BaseDto
    {
        public Guid? LanguageId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string DocumentationUrl { get; set; }
    }

    public class CreateFrameworkDto
    {
        public Guid? LanguageId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string DocumentationUrl { get; set; }
    }

    // --- FrameworkType DTOs ---
    public class FrameworkTypeDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class CreateFrameworkTypeDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    // --- Major DTOs ---
    public class MajorDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class CreateMajorDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    // --- Role DTOs ---
    public class RoleDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class CreateRoleDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    // --- ProjectRole DTOs ---
    public class ProjectRoleDto : BaseDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    public class CreateProjectRoleDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }

    // --- OpenSourceContribution DTOs ---
    public class OpenSourceContributionDto : BaseDto
    {
        public Guid UserId { get; set; }
        public required string RepositoryUrl { get; set; }
        public string? PullRequestUrl { get; set; }
        public required string Title { get; set; }
        public string Status { get; set; } = "Open";
        public DateTime? MergedAt { get; set; }
    }

    public class CreateOpenSourceContributionDto
    {
        public Guid UserId { get; set; }
        public required string RepositoryUrl { get; set; }
        public string? PullRequestUrl { get; set; }
        public required string Title { get; set; }
    }

    // --- RefreshToken DTOs ---
    public class RefreshTokenDto : BaseDto
    {
        public required string Token { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? RevokedByIp { get; set; }
        public string CreatedByIp { get; set; } = null!;
        public Guid UserId { get; set; }
    }

    // --- BlacklistedToken DTOs ---
    public class BlacklistedTokenDto : BaseDto
    {
        public required string Token { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string? Reason { get; set; }
    }
}
