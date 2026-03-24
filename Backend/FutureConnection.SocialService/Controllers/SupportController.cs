using FutureConnection.Core.DTOs;
using FutureConnection.Core.Utils;
using FutureConnection.SocialService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.SocialService.Controllers
{
    [ApiController]
    [Route("api/support")]
    [Authorize]
    public class SupportController(ISocialService socialService) : ControllerBase
    {
        [HttpPost("tickets")]
        public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto dto)
        {
            var result = await socialService.CreateTicketAsync(User.GetUserId(), dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("policies")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPolicies()
        {
            var result = await socialService.GetPoliciesAsync();
            return Ok(result);
        }

        [HttpGet("faqs")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFAQs()
        {
            var result = await socialService.GetFAQsAsync();
            return Ok(result);
        }

        [HttpGet("tickets/my")]
        public async Task<IActionResult> GetMyTickets()
        {
            var result = await socialService.GetMyTicketsAsync(User.GetUserId());
            return Ok(result);
        }

        [HttpGet("tickets/{id}")]
        public async Task<IActionResult> GetTicketById(Guid id)
        {
            var result = await socialService.GetTicketByIdAsync(User.GetUserId(), id);
            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}
