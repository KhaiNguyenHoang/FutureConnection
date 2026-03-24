using FutureConnection.ChatService.Application;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FutureConnection.ChatService.Controllers
{
    [ApiController]
    [Route("api/groups")]
    [Authorize]
    public class GroupController(IChatService chatService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetGroups()
            => Ok(await chatService.GetGroupsAsync(User.GetUserId()));

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto dto)
        {
            var result = await chatService.CreateGroupAsync(dto, User.GetUserId());
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{groupId:guid}")]
        public async Task<IActionResult> UpdateGroup(Guid groupId, [FromBody] UpdateGroupDto dto)
        {
            var result = await chatService.UpdateGroupAsync(groupId, User.GetUserId(), dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{groupId:guid}/members")]
        public async Task<IActionResult> GetGroupMembers(Guid groupId)
            => Ok(await chatService.GetGroupMembersAsync(groupId));

        [HttpPost("{groupId:guid}/members")]
        public async Task<IActionResult> AddGroupMember(Guid groupId, [FromBody] CreateGroupMemberDto dto)
        {
            var result = await chatService.AddGroupMemberAsync(groupId, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{groupId:guid}/members/{memberId:guid}")]
        public async Task<IActionResult> RemoveGroupMember(Guid groupId, Guid memberId)
            => Ok(await chatService.RemoveGroupMemberAsync(groupId, User.GetUserId(), memberId));

        [HttpGet("{groupId:guid}/messages")]
        public async Task<IActionResult> GetGroupMessages(Guid groupId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
            => Ok(await chatService.GetGroupMessagesAsync(groupId, page, pageSize));

        [HttpPost("{groupId:guid}/messages")]
        public async Task<IActionResult> SendGroupMessage(Guid groupId, [FromBody] CreateMessageDto dto)
        {
            dto.SenderId = User.GetUserId();
            var result = await chatService.SendGroupMessageAsync(groupId, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{groupId:guid}")]
        public async Task<IActionResult> DeleteGroup(Guid groupId)
            => Ok(await chatService.DeleteGroupAsync(groupId, User.GetUserId()));
    }
}
