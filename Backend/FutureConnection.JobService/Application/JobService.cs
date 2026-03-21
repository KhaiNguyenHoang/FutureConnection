using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Repositories;

namespace FutureConnection.JobService.Application
{
    public class CompanyService(IUnitOfWork uow, IMapper mapper) : ICompanyService
    {
        public async Task<Response<IEnumerable<CompanyDto>>> GetAllAsync()
        {
            var companies = await uow.Companies.GetAllAsync();
            return new Response<IEnumerable<CompanyDto>> { Success = true, Data = mapper.Map<IEnumerable<CompanyDto>>(companies) };
        }

        public async Task<Response<CompanyDto>> GetByIdAsync(Guid id)
        {
            var company = await uow.Companies.GetByIdAsync(id);
            return company == null
                ? new Response<CompanyDto> { Success = false, Message = "Company not found." }
                : new Response<CompanyDto> { Success = true, Data = mapper.Map<CompanyDto>(company) };
        }

        public async Task<Response<CompanyDto>> CreateAsync(CreateCompanyDto dto)
        {
            var company = mapper.Map<Company>(dto);
            await uow.Companies.CreateAsync(company);
            await uow.CompleteAsync();
            return new Response<CompanyDto> { Success = true, Data = mapper.Map<CompanyDto>(company), Message = "Company created." };
        }

        public async Task<Response<CompanyDto>> UpdateAsync(Guid id, UpdateCompanyDto dto)
        {
            var company = await uow.Companies.GetByIdAsync(id);
            if (company == null) return new Response<CompanyDto> { Success = false, Message = "Company not found." };

            if (!string.IsNullOrEmpty(dto.Name)) company.Name = dto.Name;
            if (dto.Industry != null) company.Industry = dto.Industry;
            if (dto.Description != null) company.Description = dto.Description;
            if (dto.Location != null) company.Location = dto.Location;
            if (dto.LogoUrl != null) company.LogoUrl = dto.LogoUrl;
            if (dto.WebsiteUrl != null) company.WebsiteUrl = dto.WebsiteUrl;

            uow.Companies.Update(company);
            await uow.CompleteAsync();
            return new Response<CompanyDto> { Success = true, Data = mapper.Map<CompanyDto>(company), Message = "Company updated." };
        }

        public async Task<Response<string>> DeleteAsync(Guid id)
        {
            await uow.Companies.SoftDeleteAsync(id);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Company deleted." };
        }

        public async Task<Response<string>> FollowAsync(Guid companyId, Guid userId)
        {
            var existing = await uow.CompanyFollowers.GetAllAsync();
            if (existing.Any(f => f.CompanyId == companyId && f.UserId == userId))
                return new Response<string> { Success = false, Message = "Already following this company." };

            await uow.CompanyFollowers.CreateAsync(new CompanyFollower { CompanyId = companyId, UserId = userId });
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Company followed." };
        }

        public async Task<Response<string>> UnfollowAsync(Guid companyId, Guid userId)
        {
            var all = await uow.CompanyFollowers.GetAllAsync();
            var follower = all.FirstOrDefault(f => f.CompanyId == companyId && f.UserId == userId);
            if (follower == null) return new Response<string> { Success = false, Message = "Not following this company." };

            uow.CompanyFollowers.HardDelete(follower);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Unfollowed successfully." };
        }

        public async Task<Response<IEnumerable<JobDto>>> GetCompanyJobsAsync(Guid companyId)
        {
            var jobs = await uow.Jobs.GetAllAsync();
            return new Response<IEnumerable<JobDto>> { Success = true, Data = mapper.Map<IEnumerable<JobDto>>(jobs.Where(j => j.EmployerId == companyId)) };
        }

        public async Task<Response<IEnumerable<CompanyFollowerDto>>> GetCompanyFollowersAsync(Guid companyId)
        {
            var followers = await uow.CompanyFollowers.GetAllAsync();
            return new Response<IEnumerable<CompanyFollowerDto>> { Success = true, Data = mapper.Map<IEnumerable<CompanyFollowerDto>>(followers.Where(f => f.CompanyId == companyId)) };
        }
    }

    public class JobApplicationService(IUnitOfWork uow, IMapper mapper, FutureConnection.Core.Interfaces.Infrastructure.ICacheService cache) : IJobService
    {
        public async Task<PagedResponse<JobDto>> GetJobsAsync(PagedRequest request, string? locationType, string? seniority, decimal? minSalary, decimal? maxSalary)
        {
            var cacheKey = $"jobs-{request.Keyword}-{locationType}-{seniority}-{minSalary}-{maxSalary}-p{request.Page}-ps{request.PageSize}";
            var cached = await cache.GetAsync<PagedResponse<JobDto>>(cacheKey);
            if (cached != null) return cached;

            var jobs = (await uow.Jobs.GetAllAsync()).Where(j => j.Status == JobStatus.Open).ToList();
            if (!string.IsNullOrEmpty(request.Keyword))
                jobs = jobs.Where(j => j.Title.Contains(request.Keyword, StringComparison.OrdinalIgnoreCase)).ToList();
            if (!string.IsNullOrEmpty(locationType))
                jobs = jobs.Where(j => j.LocationType == locationType).ToList();
            if (!string.IsNullOrEmpty(seniority))
                jobs = jobs.Where(j => j.SeniorityLevel == seniority).ToList();
            if (minSalary.HasValue) jobs = jobs.Where(j => j.SalaryMin >= minSalary).ToList();
            if (maxSalary.HasValue) jobs = jobs.Where(j => j.SalaryMax <= maxSalary).ToList();

            var mappedData = mapper.Map<IEnumerable<JobDto>>(jobs);
            var result = PagedResponse<JobDto>.Create(mappedData, request.Page, request.PageSize);
            await cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

            return result;
        }

        public async Task<Response<JobDto>> GetByIdAsync(Guid id)
        {
            var job = await uow.Jobs.GetByIdAsync(id);
            return job == null
                ? new Response<JobDto> { Success = false, Message = "Job not found." }
                : new Response<JobDto> { Success = true, Data = mapper.Map<JobDto>(job) };
        }

        public async Task<Response<JobDto>> CreateAsync(Guid employerId, CreateJobDto dto)
        {
            if (dto.Budget.HasValue && dto.Budget <= 0)
                return new Response<JobDto> { Success = false, Message = "Budget must be a positive value." };
            if (dto.SalaryMin.HasValue && dto.SalaryMax.HasValue && dto.SalaryMin >= dto.SalaryMax)
                return new Response<JobDto> { Success = false, Message = "SalaryMin must be less than SalaryMax." };

            var job = mapper.Map<Job>(dto);
            job.EmployerId = employerId;
            job.Status = JobStatus.Open;
            await uow.Jobs.CreateAsync(job);
            await uow.CompleteAsync();
            return new Response<JobDto> { Success = true, Data = mapper.Map<JobDto>(job), Message = "Job posted." };
        }

        public async Task<Response<JobDto>> UpdateAsync(Guid id, Guid requesterId, UpdateJobDto dto)
        {
            var job = await uow.Jobs.GetByIdAsync(id);
            if (job == null) return new Response<JobDto> { Success = false, Message = "Job not found." };
            if (job.EmployerId != requesterId) return new Response<JobDto> { Success = false, Message = "Unauthorized." };

            var newMin = dto.SalaryMin ?? job.SalaryMin;
            var newMax = dto.SalaryMax ?? job.SalaryMax;
            if (newMin.HasValue && newMax.HasValue && newMin >= newMax)
                return new Response<JobDto> { Success = false, Message = "SalaryMin must be less than SalaryMax." };
            if (dto.Budget.HasValue && dto.Budget <= 0)
                return new Response<JobDto> { Success = false, Message = "Budget must be a positive value." };

            if (!string.IsNullOrEmpty(dto.Title)) job.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Description)) job.Description = dto.Description;
            if (dto.Budget.HasValue) job.Budget = dto.Budget;
            if (dto.SalaryMin.HasValue) job.SalaryMin = dto.SalaryMin;
            if (dto.SalaryMax.HasValue) job.SalaryMax = dto.SalaryMax;
            if (dto.Status.HasValue) job.Status = dto.Status.Value;
            if (dto.Deadline.HasValue) job.Deadline = dto.Deadline;

            uow.Jobs.Update(job);
            await uow.CompleteAsync();
            return new Response<JobDto> { Success = true, Data = mapper.Map<JobDto>(job), Message = "Job updated." };
        }

        public async Task<Response<string>> DeleteAsync(Guid id, Guid requesterId)
        {
            var job = await uow.Jobs.GetByIdAsync(id);
            if (job == null) return new Response<string> { Success = false, Message = "Job not found." };
            if (job.EmployerId != requesterId) return new Response<string> { Success = false, Message = "Unauthorized." };

            await uow.Jobs.SoftDeleteAsync(id);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Job deleted." };
        }

        public async Task<Response<IEnumerable<ApplicationDto>>> GetApplicationsAsync(Guid jobId, Guid requesterId)
        {
            var job = await uow.Jobs.GetByIdAsync(jobId);
            if (job == null) return new Response<IEnumerable<ApplicationDto>> { Success = false, Message = "Job not found." };
            if (job.EmployerId != requesterId) return new Response<IEnumerable<ApplicationDto>> { Success = false, Message = "Unauthorized." };

            var apps = await uow.Applications.GetAllAsync();
            return new Response<IEnumerable<ApplicationDto>> { Success = true, Data = mapper.Map<IEnumerable<ApplicationDto>>(apps.Where(a => a.JobId == jobId)) };
        }

        public async Task<Response<IEnumerable<ApplicationDto>>> GetMyApplicationsAsync(Guid applicantId)
        {
            var apps = await uow.Applications.GetAllAsync();
            return new Response<IEnumerable<ApplicationDto>> { Success = true, Data = mapper.Map<IEnumerable<ApplicationDto>>(apps.Where(a => a.ApplicantId == applicantId)) };
        }

        public async Task<Response<ApplicationDto>> ApplyAsync(Guid jobId, Guid applicantId, CreateApplicationDto dto)
        {
            var job = await uow.Jobs.GetByIdAsync(jobId);
            if (job == null || job.Status != JobStatus.Open)
                return new Response<ApplicationDto> { Success = false, Message = "Job is closed or does not exist." };

            if (job.EmployerId == applicantId)
                return new Response<ApplicationDto> { Success = false, Message = "You cannot apply to your own job posting." };

            if (job.Deadline.HasValue && job.Deadline.Value < DateTime.UtcNow)
                return new Response<ApplicationDto> { Success = false, Message = "The application deadline for this job has passed." };

            var existing = await uow.Applications.GetAllAsync();
            if (existing.Any(a => a.JobId == jobId && a.ApplicantId == applicantId))
                return new Response<ApplicationDto> { Success = false, Message = "You have already applied for this job." };

            dto.JobId = jobId;
            dto.ApplicantId = applicantId;
            var application = mapper.Map<FutureConnection.Core.Entities.Application>(dto);
            application.Status = ApplicationStatus.Pending;
            await uow.Applications.CreateAsync(application);
            await uow.CompleteAsync();
            return new Response<ApplicationDto> { Success = true, Data = mapper.Map<ApplicationDto>(application), Message = "Application submitted." };
        }

        public async Task<Response<ApplicationDto>> UpdateApplicationStatusAsync(Guid applicationId, Guid requesterId, ApplicationStatus status)
        {
            var application = await uow.Applications.GetByIdAsync(applicationId);
            if (application == null) return new Response<ApplicationDto> { Success = false, Message = "Application not found." };

            var job = await uow.Jobs.GetByIdAsync(application.JobId);
            if (job == null || job.EmployerId != requesterId)
                return new Response<ApplicationDto> { Success = false, Message = "Unauthorized." };

            // Enforce valid status transitions
            var current = application.Status;
            bool validTransition = (current, status) switch
            {
                (ApplicationStatus.Pending, ApplicationStatus.Reviewed) => true,
                (ApplicationStatus.Pending, ApplicationStatus.Accepted) => true,
                (ApplicationStatus.Pending, ApplicationStatus.Rejected) => true,
                (ApplicationStatus.Reviewed, ApplicationStatus.Accepted) => true,
                (ApplicationStatus.Reviewed, ApplicationStatus.Rejected) => true,
                _ => false
            };
            if (!validTransition)
                return new Response<ApplicationDto> { Success = false, Message = $"Cannot transition application from {current} to {status}." };

            // Only one accepted application per job
            if (status == ApplicationStatus.Accepted)
            {
                var allApps = await uow.Applications.GetAllAsync();
                if (allApps.Any(a => a.JobId == job.Id && a.Id != application.Id && a.Status == ApplicationStatus.Accepted))
                    return new Response<ApplicationDto> { Success = false, Message = "Another application has already been accepted for this job." };
            }

            application.Status = status;
            uow.Applications.Update(application);
            await uow.CompleteAsync();
            return new Response<ApplicationDto> { Success = true, Data = mapper.Map<ApplicationDto>(application), Message = "Status updated." };
        }

        public async Task<Response<IEnumerable<JobTypeDto>>> GetJobTypesAsync()
        {
            var types = await uow.JobTypes.GetAllAsync();
            return new Response<IEnumerable<JobTypeDto>> { Success = true, Data = mapper.Map<IEnumerable<JobTypeDto>>(types) };
        }

        public async Task<Response<JobTypeDto>> CreateJobTypeAsync(CreateJobTypeDto dto)
        {
            var type = mapper.Map<JobType>(dto);
            await uow.JobTypes.CreateAsync(type);
            await uow.CompleteAsync();
            return new Response<JobTypeDto> { Success = true, Data = mapper.Map<JobTypeDto>(type) };
        }

        public async Task<Response<IEnumerable<JobTagDto>>> GetJobTagsAsync(Guid jobId)
        {
            var tags = await uow.JobTags.GetAllAsync();
            return new Response<IEnumerable<JobTagDto>> { Success = true, Data = mapper.Map<IEnumerable<JobTagDto>>(tags.Where(t => t.JobId == jobId)) };
        }

        public async Task<Response<JobTagDto>> AddJobTagAsync(Guid jobId, Guid tagId)
        {
            var jobTag = new JobTag { JobId = jobId, TagId = tagId };
            await uow.JobTags.CreateAsync(jobTag);
            await uow.CompleteAsync();
            return new Response<JobTagDto> { Success = true, Data = mapper.Map<JobTagDto>(jobTag) };
        }

        public async Task<Response<string>> RemoveJobTagAsync(Guid jobId, Guid tagId)
        {
            var existing = await uow.JobTags.GetAllAsync();
            var tag = existing.FirstOrDefault(t => t.JobId == jobId && t.TagId == tagId);
            if (tag != null) {
                uow.JobTags.HardDelete(tag);
                await uow.CompleteAsync();
            }
            return new Response<string> { Success = true, Message = "Tag removed." };
        }
    }
}
