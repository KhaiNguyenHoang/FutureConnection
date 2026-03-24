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

        private async Task ClearProfileCachesAsync(Guid userId)
        {
            await cache.RemoveAsync($"profile-{userId}");
            await cache.RemoveAsync($"public-profile-{userId}");
        }

        public async Task<Response<UserProfileDto>> GetPublicProfileAsync(Guid userId)
        {
            var cacheKey = $"public-profile-{userId}";
            var cachedProfile = await cache.GetAsync<UserProfileDto>(cacheKey);
            if (cachedProfile != null)
                return new Response<UserProfileDto> { Success = true, Data = cachedProfile };

            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null || user.IsDeleted) return new Response<UserProfileDto> { Success = false, Message = "User not found." };

            var cvs = await uow.CVs.FindAsync(c => c.UserId == userId && !c.IsDeleted);
            var projects = await uow.PersonalProjects.FindAsync(p => p.UserId == userId && !p.IsDeleted);
            var certs = await uow.Certificates.FindAsync(c => c.UserId == userId && !c.IsDeleted);
            var userBadges = await uow.UserBadges.FindAsync(ub => ub.UserId == userId && !ub.IsDeleted);
            
            var badgeIds = userBadges.Select(b => b.BadgeId).ToList();
            var badges = await uow.Badges.FindAsync(b => badgeIds.Contains(b.Id) && !b.IsDeleted);
            var badgeDtos = badges.Select(b => new UserProfileBadgeDto { BadgeId = b.Id, Name = b.Name, Description = b.Description, ImageUrl = b.ImageUrl }).ToList();

            SocialMediaDto? smDto = null;
            if (user.SocialMediaId.HasValue)
            {
                var sm = await uow.SocialMediaLinks.GetByIdAsync(user.SocialMediaId.Value);
                if (sm != null) smDto = mapper.Map<SocialMediaDto>(sm);
            }

            var companies = await uow.Companies.FindAsync(c => c.OwnerId == userId && !c.IsDeleted);

            var userLangs = await uow.UserLanguages.FindAsync(ul => ul.UserId == userId && !ul.IsDeleted);
            var langIds = userLangs.Select(ul => ul.CodeLanguageId).ToList();
            var codeLangs = await uow.CodeLanguages.FindAsync(cl => langIds.Contains(cl.Id) && !cl.IsDeleted);
            var langDtos = codeLangs.Select(cl => new UserLanguageDto { CodeLanguageId = cl.Id, Name = cl.Name, DocumentationUrl = cl.DocumentationUrl }).ToList();

            var userFws = await uow.UserFrameworks.FindAsync(uf => uf.UserId == userId && !uf.IsDeleted);
            var fwIds = userFws.Select(uf => uf.FrameworkId).ToList();
            var fws = await uow.Frameworks.FindAsync(f => fwIds.Contains(f.Id) && !f.IsDeleted);
            var fwDtos = fws.Select(f => new UserFrameworkDto { FrameworkId = f.Id, Name = f.Name }).ToList();


            var profile = new UserProfileDto
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                RoleId = user.RoleId,
                CVs = mapper.Map<IEnumerable<CVDto>>(cvs),
                PersonalProjects = mapper.Map<IEnumerable<PersonalProjectDto>>(projects),
                Certificates = mapper.Map<IEnumerable<CertificateDto>>(certs),
                Badges = badgeDtos,
                SocialMedia = smDto,
                OwnedCompanies = mapper.Map<IEnumerable<CompanyDto>>(companies),
                Languages = langDtos,
                Frameworks = fwDtos
            };

            var role = await uow.Roles.GetByIdAsync(user.RoleId);
            profile.Role = role?.Name;

            await cache.SetAsync(cacheKey, profile, TimeSpan.FromMinutes(15));
            return new Response<UserProfileDto> { Success = true, Data = profile };
        }

        public async Task<Response<UserDto>> UpdateProfileAsync(Guid userId, UpdateUserDto dto)
        {
            var user = await uow.Users.GetByIdAsync(userId);
            if (user == null) return new Response<UserDto> { Success = false, Message = "User not found." };

            mapper.Map(dto, user);

            uow.Users.Update(user);
            await uow.CompleteAsync();

            await ClearProfileCachesAsync(userId);

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
            await ClearProfileCachesAsync(userId);
            return new Response<CVDto> { Success = true, Data = mapper.Map<CVDto>(cv), Message = "CV added." };
        }

        public async Task<Response<string>> DeleteCvAsync(Guid userId, Guid cvId)
        {
            var cv = await uow.CVs.GetByIdAsync(cvId);
            if (cv == null) return new Response<string> { Success = false, Message = "CV not found." };
            if (cv.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.CVs.SoftDeleteAsync(cvId);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
            return new Response<CertificateDto> { Success = true, Data = mapper.Map<CertificateDto>(cert), Message = "Certificate added." };
        }

        public async Task<Response<string>> DeleteCertificateAsync(Guid userId, Guid certId)
        {
            var cert = await uow.Certificates.GetByIdAsync(certId);
            if (cert == null) return new Response<string> { Success = false, Message = "Certificate not found." };
            if (cert.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.Certificates.SoftDeleteAsync(certId);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
            return new Response<PersonalProjectDto> { Success = true, Data = mapper.Map<PersonalProjectDto>(proj) };
        }

        public async Task<Response<string>> DeleteProjectAsync(Guid userId, Guid projectId)
        {
            var proj = await uow.PersonalProjects.GetByIdAsync(projectId);
            if (proj == null) return new Response<string> { Success = false, Message = "Project not found." };
            if (proj.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.PersonalProjects.SoftDeleteAsync(projectId);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
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
            await ClearProfileCachesAsync(userId);
            return new Response<OpenSourceContributionDto> { Success = true, Data = mapper.Map<OpenSourceContributionDto>(obj) };
        }

        public async Task<Response<string>> DeleteOpenSourceAsync(Guid userId, Guid openSourceId)
        {
            var osc = await uow.OpenSourceContributions.GetByIdAsync(openSourceId);
            if (osc == null) return new Response<string> { Success = false, Message = "Not found." };
            if (osc.UserId != userId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.OpenSourceContributions.SoftDeleteAsync(openSourceId);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
            return new Response<string> { Success = true, Message = "Open source contribution deleted." };
        }

        public async Task<Response<UserLanguageDto>> AddUserLanguageAsync(Guid userId, Guid codeLanguageId)
        {
            var cl = await uow.CodeLanguages.GetByIdAsync(codeLanguageId);
            if (cl == null) return new Response<UserLanguageDto> { Success = false, Message = "Language not found." };

            var existing = await uow.UserLanguages.FindAsync(ul => ul.UserId == userId && ul.CodeLanguageId == codeLanguageId && !ul.IsDeleted);
            if (existing.Any()) return new Response<UserLanguageDto> { Success = false, Message = "Already added." };

            var ul = new UserLanguage { UserId = userId, CodeLanguageId = codeLanguageId };
            await uow.UserLanguages.CreateAsync(ul);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
            return new Response<UserLanguageDto> { Success = true, Data = new UserLanguageDto { CodeLanguageId = cl.Id, Name = cl.Name, DocumentationUrl = cl.DocumentationUrl } };
        }

        public async Task<Response<string>> RemoveUserLanguageAsync(Guid userId, Guid codeLanguageId)
        {
            var existing = await uow.UserLanguages.FindAsync(ul => ul.UserId == userId && ul.CodeLanguageId == codeLanguageId && !ul.IsDeleted);
            var ul = existing.FirstOrDefault();
            if (ul == null) return new Response<string> { Success = false, Message = "Not found." };

            await uow.UserLanguages.SoftDeleteAsync(ul.Id);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
            return new Response<string> { Success = true, Message = "Language removed." };
        }

        public async Task<Response<UserFrameworkDto>> AddUserFrameworkAsync(Guid userId, Guid frameworkId)
        {
            var f = await uow.Frameworks.GetByIdAsync(frameworkId);
            if (f == null) return new Response<UserFrameworkDto> { Success = false, Message = "Framework not found." };

            var existing = await uow.UserFrameworks.FindAsync(uf => uf.UserId == userId && uf.FrameworkId == frameworkId && !uf.IsDeleted);
            if (existing.Any()) return new Response<UserFrameworkDto> { Success = false, Message = "Already added." };

            var uf = new UserFramework { UserId = userId, FrameworkId = frameworkId };
            await uow.UserFrameworks.CreateAsync(uf);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
            return new Response<UserFrameworkDto> { Success = true, Data = new UserFrameworkDto { FrameworkId = f.Id, Name = f.Name } };
        }

        public async Task<Response<string>> RemoveUserFrameworkAsync(Guid userId, Guid frameworkId)
        {
            var existing = await uow.UserFrameworks.FindAsync(uf => uf.UserId == userId && uf.FrameworkId == frameworkId && !uf.IsDeleted);
            var uf = existing.FirstOrDefault();
            if (uf == null) return new Response<string> { Success = false, Message = "Not found." };

            await uow.UserFrameworks.SoftDeleteAsync(uf.Id);
            await uow.CompleteAsync();
            await ClearProfileCachesAsync(userId);
            return new Response<string> { Success = true, Message = "Framework removed." };
        }

        public async Task<Response<IEnumerable<CodeLanguageDto>>> GetAllCodeLanguagesAsync()
        {
            var data = await uow.CodeLanguages.GetAllAsync();
            return new Response<IEnumerable<CodeLanguageDto>> { Success = true, Data = mapper.Map<IEnumerable<CodeLanguageDto>>(data) };
        }

        public async Task<Response<IEnumerable<FrameworkDto>>> GetAllFrameworksAsync()
        {
            var data = await uow.Frameworks.GetAllAsync();
            return new Response<IEnumerable<FrameworkDto>> { Success = true, Data = mapper.Map<IEnumerable<FrameworkDto>>(data) };
        }
    }
}
