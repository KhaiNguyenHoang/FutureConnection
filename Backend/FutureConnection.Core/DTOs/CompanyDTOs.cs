using System;

namespace FutureConnection.Core.DTOs
{
    // --- Company DTOs ---
    public class CompanyDto : BaseDto
    {
        public required string Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? Description { get; set; }
        public Guid OwnerId { get; set; }
    }

    public class CreateCompanyDto
    {
        public required string Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? Description { get; set; }
        public Guid OwnerId { get; set; }
    }

    public class UpdateCompanyDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? Description { get; set; }
    }

    // --- CompanyFollower DTOs ---
    public class CompanyFollowerDto : BaseDto
    {
        public Guid CompanyId { get; set; }
        public Guid UserId { get; set; }
    }

    public class CreateCompanyFollowerDto
    {
        public Guid CompanyId { get; set; }
        public Guid UserId { get; set; }
    }
}
