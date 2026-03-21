using FutureConnection.Core.DTOs;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Utils;
using FutureConnection.SocialService.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.SocialService.Controllers
{
    [ApiController]
    [Route("api/posts")]
    [Authorize]
    public class PostController(ISocialService socialService) : ControllerBase
    {
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetFeed([FromQuery] Guid? userId, [FromQuery] PagedRequest request)
            => Ok(await socialService.GetFeedAsync(userId, request));

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostDto dto, IFormFileCollection? mediaFiles)
        {
            var result = await socialService.CreatePostAsync(User.GetUserId(), dto, mediaFiles);
            return Ok(result);
        }

        [HttpDelete("{postId:guid}")]
        public async Task<IActionResult> DeletePost(Guid postId)
        {
            var result = await socialService.DeletePostAsync(postId, User.GetUserId());
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{postId:guid}/comments")]
        public async Task<IActionResult> Comment(Guid postId, [FromForm] CreateCommentDto dto, IFormFileCollection? mediaFiles)
        {
            var result = await socialService.CommentAsync(User.GetUserId(), postId, dto, mediaFiles);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("{postId:guid}/reactions")]
        public async Task<IActionResult> React(Guid postId, [FromBody] CreateReactionDto dto)
        {
            var result = await socialService.ReactAsync(User.GetUserId(), postId, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("{postId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPost(Guid postId)
        {
            var result = await socialService.GetPostByIdAsync(postId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("{postId:guid}")]
        public async Task<IActionResult> UpdatePost(Guid postId, [FromBody] UpdatePostDto dto)
        {
            var result = await socialService.UpdatePostAsync(postId, User.GetUserId(), dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("{postId:guid}/comments")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostComments(Guid postId)
            => Ok(await socialService.GetPostCommentsAsync(postId));
    }

    [ApiController]
    [Route("api/connections")]
    [Authorize]
    public class ConnectionController(ISocialService socialService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetConnections()
            => Ok(await socialService.GetConnectionsAsync(User.GetUserId()));

        [HttpPost]
        public async Task<IActionResult> RequestConnection([FromQuery] Guid addresseeId)
        {
            var result = await socialService.RequestConnectionAsync(User.GetUserId(), addresseeId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{connectionId:guid}/respond")]
        public async Task<IActionResult> Respond(Guid connectionId, [FromQuery] ConnectionStatus status)
        {
            var result = await socialService.RespondConnectionAsync(connectionId, User.GetUserId(), status);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
            => Ok(await socialService.GetPendingConnectionsAsync(User.GetUserId()));

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteConnection(Guid id)
            => Ok(await socialService.DeleteConnectionAsync(id, User.GetUserId()));
    }
}
