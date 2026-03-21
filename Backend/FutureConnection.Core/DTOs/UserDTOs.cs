using System;
using FutureConnection.Core.Enums;

namespace FutureConnection.Core.DTOs
{
    public class UserDto : BaseDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public Guid RoleId { get; set; }
        public string? Role { get; set; }
        public Guid? SocialMediaId { get; set; }
        public string? LastLoginIp { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool IsOnboarded { get; set; }
        public bool IsEmailVerified { get; set; }
        public string? ExternalProvider { get; set; }
    }

    public class LoginUserDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? IpAddress { get; set; }
    }

    public class CreateUserDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public Guid RoleId { get; set; }
    }

    public class UpdateUserDto
    {
        public Guid Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public ICollection<CreateCVDto>? CVs { get; set; }
        public Guid? SocialMediaId { get; set; }
        public bool IsOnboarded { get; set; }
    }

    public class CVDto : BaseDto
    {
        public Guid UserId { get; set; }
        public string? University { get; set; }
    }

    public class CreateCVDto
    {
        public Guid UserId { get; set; }
        public string? University { get; set; }
    }

    public class UpdateCVDto
    {
        public Guid Id { get; set; }
        public string? University { get; set; }
    }

    public class PersonalProjectDto : BaseDto
    {
        public Guid UserId { get; set; }
        public Guid? CVId { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string RepositoryUrl { get; set; }
        public string? DeploymentUrl { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime? EndAt { get; set; }
    }

    public class CreatePersonalProjectDto
    {
        public Guid UserId { get; set; }
        public Guid? CVId { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string RepositoryUrl { get; set; }
        public string? DeploymentUrl { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime? EndAt { get; set; }
    }

    public class UpdatePersonalProjectDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? RepositoryUrl { get; set; }
        public string? DeploymentUrl { get; set; }
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
    }

    public class ConnectionDto : BaseDto
    {
        public Guid RequesterId { get; set; }
        public Guid AddresseeId { get; set; }
        public ConnectionStatus Status { get; set; }
    }

    public class CreateConnectionDto
    {
        public Guid RequesterId { get; set; }
        public Guid AddresseeId { get; set; }
    }

    public class UpdateConnectionDto
    {
        public Guid Id { get; set; }
        public ConnectionStatus Status { get; set; }
    }

    public class EndorsementDto : BaseDto
    {
        public Guid EndorserId { get; set; }
        public Guid EndorseeId { get; set; }
        public Guid SkillTagId { get; set; }
    }

    public class CreateEndorsementDto
    {
        public Guid EndorserId { get; set; }
        public Guid EndorseeId { get; set; }
        public Guid SkillTagId { get; set; }
    }

    public class CertificateDto : BaseDto
    {
        public required string Name { get; set; }
        public string? IssuingOrganization { get; set; }
        public string? CertificateUrl { get; set; }
        public string? CredentialId { get; set; }
        public DateTime? DateIssued { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public Guid UserId { get; set; }
    }

    public class CreateCertificateDto
    {
        public required string Name { get; set; }
        public string? IssuingOrganization { get; set; }
        public string? CertificateUrl { get; set; }
        public string? CredentialId { get; set; }
        public DateTime? DateIssued { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public Guid UserId { get; set; }
    }

    public class UpdateCertificateDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? IssuingOrganization { get; set; }
        public string? CertificateUrl { get; set; }
        public string? CredentialId { get; set; }
        public DateTime? DateIssued { get; set; }
        public DateTime? ExpiredAt { get; set; }
    }

    public class SocialMediaDto : BaseDto
    {
        public string? LinkedInUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? YoutubeUrl { get; set; }
        public string? GithubUrl { get; set; }
    }

    public class CreateSocialMediaDto
    {
        public string? LinkedInUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? YoutubeUrl { get; set; }
        public string? GithubUrl { get; set; }
    }

    public class UpdateSocialMediaDto
    {
        public Guid Id { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? YoutubeUrl { get; set; }
        public string? GithubUrl { get; set; }
    }
}
