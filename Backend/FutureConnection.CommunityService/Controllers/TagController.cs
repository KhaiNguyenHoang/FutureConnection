using FutureConnection.Core.DTOs;
using FutureConnection.CommunityService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.CommunityService.Controllers
{
    [ApiController]
    [Route("api/tags")]
    [Authorize]
    public class TagController(IQuestionService questionService) : ControllerBase
    {
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetTags()
            => Ok(await questionService.GetTagsAsync());

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTag([FromBody] CreateTagDto dto)
        {
            var result = await questionService.CreateTagAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
