using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FutureConnection.ChatService.Hubs
{
    [Authorize]
    public class ChatHub(ICacheService cacheService, IUnitOfWork uow) : Hub
    {
        private readonly ICacheService _cacheService = cacheService;
        private readonly IUnitOfWork _uow = uow;

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                // Map UserId to ConnectionId in Redis to support multiple sessions per user
                await _cacheService.SetAsync($"hub_conn:{userId}:{Context.ConnectionId}", Context.ConnectionId, TimeSpan.FromHours(24));

                // Automatically join SignalR groups for all channels and groups the user belongs to
                if (Guid.TryParse(userId, out var userGuid))
                {
                    var groupMemberships = (await _uow.GroupMembers.GetAllAsync())
                        .Where(gm => gm.UserId == userGuid)
                        .Select(gm => gm.GroupId);

                    foreach (var groupId in groupMemberships)
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, groupId.ToString());
                        
                        // Also join all channels within those groups
                        var channels = (await _uow.Channels.GetAllAsync())
                            .Where(c => c.GroupId == groupId);
                        
                        foreach (var channel in channels)
                        {
                            await Groups.AddToGroupAsync(Context.ConnectionId, channel.Id.ToString());
                        }
                    }
                }
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await _cacheService.RemoveAsync($"hub_conn:{userId}:{Context.ConnectionId}");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinGroupAsync(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }

        public async Task LeaveGroupAsync(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        }
    }
}
