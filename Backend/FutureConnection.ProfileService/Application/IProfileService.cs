using FutureConnection.Core.DTOs;

namespace FutureConnection.ProfileService.Application
{
    public interface IProfileService
    {
        Task<Response<UserDto>> GetProfileAsync(Guid userId);
        Task<Response<UserDto>> UpdateProfileAsync(Guid userId, UpdateUserDto dto);

        Task<Response<IEnumerable<CVDto>>> GetCvsAsync(Guid userId);
        Task<Response<CVDto>> AddCvAsync(Guid userId, CreateCVDto dto);
        Task<Response<string>> DeleteCvAsync(Guid userId, Guid cvId);

        Task<Response<IEnumerable<CertificateDto>>> GetCertificatesAsync(Guid userId);
        Task<Response<CertificateDto>> AddCertificateAsync(Guid userId, CreateCertificateDto dto);
        Task<Response<CertificateDto>> UpdateCertificateAsync(Guid userId, Guid certId, UpdateCertificateDto dto);
        Task<Response<string>> DeleteCertificateAsync(Guid userId, Guid certId);

        Task<Response<IEnumerable<PersonalProjectDto>>> GetProjectsAsync(Guid userId);
        Task<Response<PersonalProjectDto>> AddProjectAsync(Guid userId, CreatePersonalProjectDto dto);
        Task<Response<PersonalProjectDto>> UpdateProjectAsync(Guid userId, Guid projectId, UpdatePersonalProjectDto dto);
        Task<Response<string>> DeleteProjectAsync(Guid userId, Guid projectId);

        Task<Response<SocialMediaDto>> GetSocialMediaAsync(Guid userId);
        Task<Response<SocialMediaDto>> AddSocialMediaAsync(Guid userId, CreateSocialMediaDto dto);
        Task<Response<SocialMediaDto>> UpdateSocialMediaAsync(Guid userId, Guid socialMediaId, UpdateSocialMediaDto dto);

        Task<Response<EndorsementDto>> AddEndorsementAsync(Guid userId, CreateEndorsementDto dto);
        Task<Response<IEnumerable<EndorsementDto>>> GetEndorsementsAsync(Guid userId);

        Task<Response<IEnumerable<OpenSourceContributionDto>>> GetOpenSourcesAsync(Guid userId);
        Task<Response<OpenSourceContributionDto>> AddOpenSourceAsync(Guid userId, CreateOpenSourceContributionDto dto);
        Task<Response<string>> DeleteOpenSourceAsync(Guid userId, Guid openSourceId);
    }
}
