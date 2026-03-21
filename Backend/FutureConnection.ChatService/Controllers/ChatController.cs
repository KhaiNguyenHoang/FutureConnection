using FutureConnection.ChatService.Application;
using FutureConnection.Core.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.ChatService.Controllers
{
    [ApiController]
    [Route("api/channels")]
    public class ChatController(IChatService chatService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetChannels([FromQuery] Guid userId)
            => Ok(await chatService.GetChannelsAsync(userId));

        [HttpPost]
        public async Task<IActionResult> CreateChannel([FromBody] CreateChannelDto dto)
        {
            var result = await chatService.CreateChannelAsync(dto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("{channelId:guid}/messages")]
        public async Task<IActionResult> GetMessages(Guid channelId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
            => Ok(await chatService.GetMessagesAsync(channelId, page, pageSize));

        [HttpPost("{channelId:guid}/messages")]
        public async Task<IActionResult> SendMessage(Guid channelId, [FromBody] CreateMessageDto dto)
        {
            var result = await chatService.SendMessageAsync(channelId, dto);
            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}
