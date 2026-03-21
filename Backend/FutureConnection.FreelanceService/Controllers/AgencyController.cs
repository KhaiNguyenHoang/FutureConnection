using FutureConnection.Core.DTOs;
using FutureConnection.Core.Utils;
using FutureConnection.FreelanceService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FutureConnection.FreelanceService.Controllers
{
    [ApiController]
    [Route("api/agencies")]
    [Authorize]
    public class AgencyController(IAgencyService agencyService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAgencies()
            => Ok(await agencyService.GetAgenciesAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetAgency(Guid id)
        {
            var result = await agencyService.GetByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAgency([FromBody] CreateAgencyDto dto)
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var result = await agencyService.CreateAsync(userId, dto);
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateAgency(Guid id, [FromBody] UpdateAgencyDto dto)
        {
            var userId = User.GetUserId();
            var result = await agencyService.UpdateAsync(id, userId, dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAgency(Guid id)
        {
            var userId = User.GetUserId();
            var result = await agencyService.DeleteAsync(id, userId);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("{id:guid}/members")]
        public async Task<IActionResult> AddMember(Guid id, [FromBody] CreateAgencyMemberDto dto)
        {
            var userId = User.GetUserId();
            var result = await agencyService.AddMemberAsync(id, userId, dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id:guid}/members/{memberId:guid}")]
        public async Task<IActionResult> RemoveMember(Guid id, Guid memberId)
        {
            var userId = User.GetUserId();
            var result = await agencyService.RemoveMemberAsync(id, userId, memberId);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
