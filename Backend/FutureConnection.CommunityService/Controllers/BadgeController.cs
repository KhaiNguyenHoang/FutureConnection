using FutureConnection.Core.DTOs;
using FutureConnection.CommunityService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.CommunityService.Controllers
{
    [ApiController]
    [Route("api/badges")]
    [Authorize]
    public class BadgeController(IQuestionService questionService) : ControllerBase
    {
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetBadges()
            => Ok(await questionService.GetBadgesAsync());

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBadge([FromBody] CreateBadgeDto dto)
        {
            var result = await questionService.CreateBadgeAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
