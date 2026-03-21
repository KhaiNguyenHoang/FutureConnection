using FutureConnection.Core.DTOs;
using FutureConnection.JobService.Application;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.JobService.Controllers
{
    [ApiController]
    [Route("api/companies")]
    public class CompanyController(ICompanyService companyService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetCompanies()
            => Ok(await companyService.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCompany(Guid id)
        {
            var result = await companyService.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyDto dto)
            => Ok(await companyService.CreateAsync(dto));

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateCompany(Guid id, [FromBody] UpdateCompanyDto dto)
        {
            var result = await companyService.UpdateAsync(id, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCompany(Guid id)
            => Ok(await companyService.DeleteAsync(id));

        [HttpPost("{id:guid}/follow")]
        public async Task<IActionResult> FollowCompany(Guid id, [FromQuery] Guid userId)
        {
            var result = await companyService.FollowAsync(id, userId);
            return result.Success ? Ok(result) : Conflict(result);
        }

        [HttpDelete("{id:guid}/follow")]
        public async Task<IActionResult> UnfollowCompany(Guid id, [FromQuery] Guid userId)
        {
            var result = await companyService.UnfollowAsync(id, userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("{id:guid}/jobs")]
        public async Task<IActionResult> GetCompanyJobs(Guid id)
            => Ok(await companyService.GetCompanyJobsAsync(id));

        [HttpGet("{id:guid}/followers")]
        public async Task<IActionResult> GetCompanyFollowers(Guid id)
            => Ok(await companyService.GetCompanyFollowersAsync(id));
    }
}
