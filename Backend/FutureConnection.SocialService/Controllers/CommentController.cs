using FutureConnection.Core.DTOs;
using FutureConnection.Core.Utils;
using FutureConnection.SocialService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.SocialService.Controllers
{
    [ApiController]
    [Route("api/comments")]
    [Authorize]
    public class CommentController(ISocialService socialService) : ControllerBase
    {
        [HttpPut("{commentId:guid}")]
        public async Task<IActionResult> UpdateComment(Guid commentId, [FromBody] UpdateCommentDto dto)
        {
            var result = await socialService.UpdateCommentAsync(commentId, User.GetUserId(), dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{commentId:guid}")]
        public async Task<IActionResult> DeleteComment(Guid commentId)
            => Ok(await socialService.DeleteCommentAsync(commentId, User.GetUserId()));

        [HttpGet("{commentId:guid}/reactions")]
        public async Task<IActionResult> GetReactions(Guid commentId)
            => Ok(await socialService.GetCommentReactionsAsync(commentId));

        [HttpPost("{commentId:guid}/reactions")]
        public async Task<IActionResult> React(Guid commentId, [FromBody] CreateReactionDto dto)
        {
            var result = await socialService.ReactToCommentAsync(commentId, User.GetUserId(), dto);
            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}
