using FutureConnection.ChatService.Application;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.ChatService.Controllers
{
    [ApiController]
    [Route("api/messages")]
    [Authorize]
    public class MessageController(IChatService chatService) : ControllerBase
    {
        [HttpGet("{id:guid}/reactions")]
        public async Task<IActionResult> GetReactions(Guid id)
            => Ok(await chatService.GetMessageReactionsAsync(id));

        [HttpPost("{id:guid}/reactions")]
        public async Task<IActionResult> AddReaction(Guid id, [FromBody] CreateReactionDto dto)
        {
            dto.UserId = User.GetUserId();
            var result = await chatService.AddReactionAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateMessage(Guid id, [FromBody] UpdateMessageDto dto)
        {
            var result = await chatService.UpdateMessageAsync(id, User.GetUserId(), dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteMessage(Guid id)
            => Ok(await chatService.DeleteMessageAsync(id, User.GetUserId()));
    }
}
