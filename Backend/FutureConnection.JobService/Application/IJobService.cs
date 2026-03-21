using FutureConnection.Core.DTOs;

namespace FutureConnection.JobService.Application
{
    public interface ICompanyService
    {
        Task<Response<IEnumerable<CompanyDto>>> GetAllAsync();
        Task<Response<CompanyDto>> GetByIdAsync(Guid id);
        Task<Response<CompanyDto>> CreateAsync(CreateCompanyDto dto);
        Task<Response<CompanyDto>> UpdateAsync(Guid id, UpdateCompanyDto dto);
        Task<Response<string>> DeleteAsync(Guid id);
        Task<Response<string>> FollowAsync(Guid companyId, Guid userId);
        Task<Response<string>> UnfollowAsync(Guid companyId, Guid userId);
        Task<Response<IEnumerable<JobDto>>> GetCompanyJobsAsync(Guid companyId);
        Task<Response<IEnumerable<CompanyFollowerDto>>> GetCompanyFollowersAsync(Guid companyId);
    }

    public interface IJobService
    {
        Task<PagedResponse<JobDto>> GetJobsAsync(PagedRequest request, string? locationType, string? seniority, decimal? minSalary, decimal? maxSalary);
        Task<Response<JobDto>> GetByIdAsync(Guid id);
        Task<Response<JobDto>> CreateAsync(Guid employerId, CreateJobDto dto);
        Task<Response<JobDto>> UpdateAsync(Guid jobId, Guid requesterId, UpdateJobDto dto);
        Task<Response<string>> DeleteAsync(Guid jobId, Guid requesterId);

        Task<Response<IEnumerable<ApplicationDto>>> GetApplicationsAsync(Guid jobId, Guid requesterId);
        Task<Response<IEnumerable<ApplicationDto>>> GetMyApplicationsAsync(Guid applicantId);
        Task<Response<ApplicationDto>> ApplyAsync(Guid jobId, Guid applicantId, CreateApplicationDto dto);
        Task<Response<ApplicationDto>> UpdateApplicationStatusAsync(Guid applicationId, Guid requesterId, Core.Enums.ApplicationStatus status);

        Task<Response<IEnumerable<JobTypeDto>>> GetJobTypesAsync();
        Task<Response<JobTypeDto>> CreateJobTypeAsync(CreateJobTypeDto dto);

        Task<Response<IEnumerable<JobTagDto>>> GetJobTagsAsync(Guid jobId);
        Task<Response<JobTagDto>> AddJobTagAsync(Guid jobId, Guid tagId);
        Task<Response<string>> RemoveJobTagAsync(Guid jobId, Guid tagId);
    }
}
