using FutureConnection.Core.DTOs;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Utils;
using FutureConnection.JobService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.JobService.Controllers
{
    [ApiController]
    [Route("api/jobs")]
    [Authorize]
    public class JobController(IJobService jobService) : ControllerBase
    {
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetJobs(
            [FromQuery] PagedRequest request, [FromQuery] string? locationType,
            [FromQuery] string? seniority, [FromQuery] decimal? minSalary, [FromQuery] decimal? maxSalary)
            => Ok(await jobService.GetJobsAsync(request, locationType, seniority, minSalary, maxSalary));

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetJob(Guid id)
        {
            var result = await jobService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> CreateJob([FromBody] CreateJobDto dto)
            => Ok(await jobService.CreateAsync(User.GetUserId(), dto));

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> UpdateJob(Guid id, [FromBody] UpdateJobDto dto)
        {
            var result = await jobService.UpdateAsync(id, User.GetUserId(), User.IsInRole("Admin"), dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> DeleteJob(Guid id)
            => Ok(await jobService.DeleteAsync(id, User.GetUserId(), User.IsInRole("Admin")));

        [HttpGet("my-applications")]
        [Authorize(Roles = "Freelancer,Admin")]
        public async Task<IActionResult> GetMyApplications()
            => Ok(await jobService.GetMyApplicationsAsync(User.GetUserId()));

        [HttpGet("{id:guid}/applications")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> GetApplications(Guid id)
            => Ok(await jobService.GetApplicationsAsync(id, User.GetUserId(), User.IsInRole("Admin")));

        [HttpPost("{id:guid}/apply")]
        [Authorize(Roles = "Freelancer,Admin")]
        public async Task<IActionResult> Apply(Guid id, [FromBody] CreateApplicationDto dto)
        {
            var result = await jobService.ApplyAsync(id, User.GetUserId(), dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("applications/{applicationId:guid}/status")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> UpdateApplicationStatus(Guid applicationId, [FromQuery] ApplicationStatus status)
        {
            var result = await jobService.UpdateApplicationStatusAsync(applicationId, User.GetUserId(), User.IsInRole("Admin"), status);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("/api/job-types")]
        [AllowAnonymous]
        public async Task<IActionResult> GetJobTypes()
            => Ok(await jobService.GetJobTypesAsync());

        [HttpPost("/api/job-types")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateJobType([FromBody] CreateJobTypeDto dto)
            => Ok(await jobService.CreateJobTypeAsync(dto));

        [HttpGet("{id:guid}/job-tags")]
        [AllowAnonymous]
        public async Task<IActionResult> GetJobTags(Guid id)
            => Ok(await jobService.GetJobTagsAsync(id));

        [HttpPost("{id:guid}/job-tags")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddJobTag(Guid id, [FromQuery] Guid tagId)
        {
            var result = await jobService.AddJobTagAsync(id, tagId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id:guid}/job-tags/{tagId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveJobTag(Guid id, Guid tagId)
            => Ok(await jobService.RemoveJobTagAsync(id, tagId));
    }
}
