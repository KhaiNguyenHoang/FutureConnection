using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;

namespace FutureConnection.ProfileService.Application
{
    public class ProfileApplicationService(IUnitOfWork uow, IMapper mapper, FutureConnection.Core.Interfaces.Infrastructure.ICacheService cache) : IProfileService
    {
        public async Task<Response<UserDto>> GetProfileAsync(Guid userId)
        {
            var cacheKey = $"profile-{userId}";
            var cachedProfile = await cache.GetAsync<UserDto>(cacheKey);
            if (cachedProfile != null)
                return new Response<UserDto> { Success = true, Data = cachedProfile };

            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null) return new Response<UserDto> { Success = false, Message = "User not found." };

            var userDto = mapper.Map<UserDto>(user);
            await cache.SetAsync(cacheKey, userDto, TimeSpan.FromMinutes(15));
            return new Response<UserDto> { Success = true, Data = userDto };
        }

        public async Task<Response<UserDto>> UpdateProfileAsync(Guid userId, UpdateUserDto dto)
        {
            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null) return new Response<UserDto> { Success = false, Message = "User not found." };

            mapper.Map(dto, user);

            uow.Users.Update(user);
            await uow.CompleteAsync();

            await cache.RemoveAsync($"profile-{userId}");

            return new Response<UserDto> { Success = true, Data = mapper.Map<UserDto>(user), Message = "Profile updated." };
        }

        public async Task<Response<IEnumerable<CVDto>>> GetCvsAsync(Guid userId)
        {
            var cvs = await uow.CVs.GetAllAsync();
            return new Response<IEnumerable<CVDto>> { Success = true, Data = mapper.Map<IEnumerable<CVDto>>(cvs.Where(c => c.UserId == userId)) };
        }

        public async Task<Response<CVDto>> AddCvAsync(Guid userId, CreateCVDto dto)
        {
            dto.UserId = userId;
            var cv = mapper.Map<CV>(dto);
            await uow.CVs.CreateAsync(cv);
            await uow.CompleteAsync();
            return new Response<CVDto> { Success = true, Data = mapper.Map<CVDto>(cv), Message = "CV added." };
        }

        public async Task<Response<string>> DeleteCvAsync(Guid userId, Guid cvId)
        {
            var cv = await uow.CVs.GetByIdAsync(cvId);
            if (cv == null) return new Response<string> { Success = false, Message = "CV not found." };
            if (cv.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.CVs.SoftDeleteAsync(cvId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "CV deleted." };
        }

        public async Task<Response<IEnumerable<CertificateDto>>> GetCertificatesAsync(Guid userId)
        {
            var certs = await uow.Certificates.GetAllAsync();
            return new Response<IEnumerable<CertificateDto>> { Success = true, Data = mapper.Map<IEnumerable<CertificateDto>>(certs.Where(c => c.UserId == userId)) };
        }

        public async Task<Response<CertificateDto>> AddCertificateAsync(Guid userId, CreateCertificateDto dto)
        {
            dto.UserId = userId;
            var cert = mapper.Map<Certificate>(dto);
            await uow.Certificates.CreateAsync(cert);
            await uow.CompleteAsync();
            return new Response<CertificateDto> { Success = true, Data = mapper.Map<CertificateDto>(cert), Message = "Certificate added." };
        }

        public async Task<Response<string>> DeleteCertificateAsync(Guid userId, Guid certId)
        {
            var cert = await uow.Certificates.GetByIdAsync(certId);
            if (cert == null) return new Response<string> { Success = false, Message = "Certificate not found." };
            if (cert.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.Certificates.SoftDeleteAsync(certId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Certificate deleted." };
        }

        public async Task<Response<IEnumerable<PersonalProjectDto>>> GetProjectsAsync(Guid userId)
        {
            var projects = await uow.PersonalProjects.GetAllAsync();
            return new Response<IEnumerable<PersonalProjectDto>> { Success = true, Data = mapper.Map<IEnumerable<PersonalProjectDto>>(projects.Where(p => p.UserId == userId)) };
        }

        public async Task<Response<PersonalProjectDto>> AddProjectAsync(Guid userId, CreatePersonalProjectDto dto)
        {
            dto.UserId = userId;
            var project = mapper.Map<PersonalProject>(dto);
            await uow.PersonalProjects.CreateAsync(project);
            await uow.CompleteAsync();
            return new Response<PersonalProjectDto> { Success = true, Data = mapper.Map<PersonalProjectDto>(project), Message = "Project added." };
        }

        public async Task<Response<SocialMediaDto>> GetSocialMediaAsync(Guid userId)
        {
            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null || !user.SocialMediaId.HasValue)
                return new Response<SocialMediaDto> { Success = false, Message = "Social media not found." };

            var sm = await uow.SocialMediaLinks.GetByIdAsync(user.SocialMediaId.Value);
            return new Response<SocialMediaDto> { Success = true, Data = mapper.Map<SocialMediaDto>(sm) };
        }

        public async Task<Response<SocialMediaDto>> AddSocialMediaAsync(Guid userId, CreateSocialMediaDto dto)
        {
            var sm = mapper.Map<SocialMedia>(dto);
            await uow.SocialMediaLinks.CreateAsync(sm);

            var user = await uow.Users.GetByIdAsync(userId);
            if (user != null) { user.SocialMediaId = sm.Id; uow.Users.Update(user); }

            await uow.CompleteAsync();
            return new Response<SocialMediaDto> { Success = true, Data = mapper.Map<SocialMediaDto>(sm), Message = "Social media links saved." };
        }

        public async Task<Response<EndorsementDto>> AddEndorsementAsync(Guid userId, CreateEndorsementDto dto)
        {
            if (dto.EndorserId == userId)
                return new Response<EndorsementDto> { Success = false, Message = "You cannot endorse yourself." };

            dto.EndorseeId = userId;
            var endorsement = mapper.Map<Endorsement>(dto);
            await uow.Endorsements.CreateAsync(endorsement);
            await uow.CompleteAsync();
            return new Response<EndorsementDto> { Success = true, Data = mapper.Map<EndorsementDto>(endorsement), Message = "Endorsement recorded." };
        }

        public async Task<Response<CertificateDto>> UpdateCertificateAsync(Guid userId, Guid certId, UpdateCertificateDto dto)
        {
            var cert = await uow.Certificates.GetByIdAsync(certId);
            if (cert == null) return new Response<CertificateDto> { Success = false, Message = "Certificate not found." };
            if (cert.UserId != userId) return new Response<CertificateDto> { Success = false, Message = "Unauthorized." };

            if (!string.IsNullOrEmpty(dto.Name)) cert.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.IssuingOrganization)) cert.IssuingOrganization = dto.IssuingOrganization;
            if (!string.IsNullOrEmpty(dto.CredentialId)) cert.CredentialId = dto.CredentialId;
            if (!string.IsNullOrEmpty(dto.CertificateUrl)) cert.CertificateUrl = dto.CertificateUrl;
            if (dto.DateIssued.HasValue) cert.DateIssued = dto.DateIssued.Value;
            if (dto.ExpiredAt.HasValue) cert.ExpiredAt = dto.ExpiredAt;
            uow.Certificates.Update(cert);
            await uow.CompleteAsync();
            return new Response<CertificateDto> { Success = true, Data = mapper.Map<CertificateDto>(cert) };
        }

        public async Task<Response<PersonalProjectDto>> UpdateProjectAsync(Guid userId, Guid projectId, UpdatePersonalProjectDto dto)
        {
            var proj = await uow.PersonalProjects.GetByIdAsync(projectId);
            if (proj == null) return new Response<PersonalProjectDto> { Success = false, Message = "Project not found." };
            if (proj.UserId != userId) return new Response<PersonalProjectDto> { Success = false, Message = "Unauthorized." };

            if (!string.IsNullOrEmpty(dto.Name)) proj.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Description)) proj.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.RepositoryUrl)) proj.RepositoryUrl = dto.RepositoryUrl;
            if (!string.IsNullOrEmpty(dto.DeploymentUrl)) proj.DeploymentUrl = dto.DeploymentUrl;
            if (dto.StartAt.HasValue) proj.StartAt = dto.StartAt.Value;
            if (dto.EndAt.HasValue) proj.EndAt = dto.EndAt;
            uow.PersonalProjects.Update(proj);
            await uow.CompleteAsync();
            return new Response<PersonalProjectDto> { Success = true, Data = mapper.Map<PersonalProjectDto>(proj) };
        }

        public async Task<Response<string>> DeleteProjectAsync(Guid userId, Guid projectId)
        {
            var proj = await uow.PersonalProjects.GetByIdAsync(projectId);
            if (proj == null) return new Response<string> { Success = false, Message = "Project not found." };
            if (proj.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.PersonalProjects.SoftDeleteAsync(projectId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Project deleted." };
        }

        public async Task<Response<SocialMediaDto>> UpdateSocialMediaAsync(Guid userId, Guid socialMediaId, UpdateSocialMediaDto dto)
        {
            var sm = await uow.SocialMediaLinks.GetByIdAsync(socialMediaId);
            if (sm == null) return new Response<SocialMediaDto> { Success = false, Message = "Social media links not found." };
            
            // Verification: check if the user owning this socialMediaId is the requester
            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null || user.SocialMediaId != socialMediaId)
                return new Response<SocialMediaDto> { Success = false, Message = "Unauthorized." };

            if (dto.LinkedInUrl != null) sm.LinkedInUrl = dto.LinkedInUrl;
            if (dto.GithubUrl != null) sm.GithubUrl = dto.GithubUrl;
            if (dto.TwitterUrl != null) sm.TwitterUrl = dto.TwitterUrl;
            if (dto.YoutubeUrl != null) sm.YoutubeUrl = dto.YoutubeUrl;
            if (dto.InstagramUrl != null) sm.InstagramUrl = dto.InstagramUrl;
            uow.SocialMediaLinks.Update(sm);
            await uow.CompleteAsync();
            return new Response<SocialMediaDto> { Success = true, Data = mapper.Map<SocialMediaDto>(sm) };
        }

        public async Task<Response<IEnumerable<EndorsementDto>>> GetEndorsementsAsync(Guid userId)
        {
            var end = await uow.Endorsements.GetAllAsync();
            return new Response<IEnumerable<EndorsementDto>> { Success = true, Data = mapper.Map<IEnumerable<EndorsementDto>>(end.Where(e => e.EndorseeId == userId)) };
        }

        public async Task<Response<IEnumerable<OpenSourceContributionDto>>> GetOpenSourcesAsync(Guid userId)
        {
            var osc = await uow.OpenSourceContributions.GetAllAsync();
            return new Response<IEnumerable<OpenSourceContributionDto>> { Success = true, Data = mapper.Map<IEnumerable<OpenSourceContributionDto>>(osc.Where(o => o.UserId == userId)) };
        }

        public async Task<Response<OpenSourceContributionDto>> AddOpenSourceAsync(Guid userId, CreateOpenSourceContributionDto dto)
        {
            dto.UserId = userId;
            var obj = mapper.Map<OpenSourceContribution>(dto);
            await uow.OpenSourceContributions.CreateAsync(obj);
            await uow.CompleteAsync();
            return new Response<OpenSourceContributionDto> { Success = true, Data = mapper.Map<OpenSourceContributionDto>(obj) };
        }

        public async Task<Response<string>> DeleteOpenSourceAsync(Guid userId, Guid openSourceId)
        {
            var osc = await uow.OpenSourceContributions.GetByIdAsync(openSourceId);
            if (osc == null) return new Response<string> { Success = false, Message = "Not found." };
            if (osc.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.OpenSourceContributions.SoftDeleteAsync(openSourceId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Open source contribution deleted." };
        }
    }
}
