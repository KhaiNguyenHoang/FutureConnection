using FutureConnection.Core.Interfaces.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FutureConnection.ChatService.Hubs
{
    [Authorize]
    public class ChatHub(ICacheService cacheService) : Hub
    {
        private readonly ICacheService _cacheService = cacheService;

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                // Map UserId to ConnectionId in Redis to support multiple sessions per user
                await _cacheService.SetAsync($"hub_conn:{userId}:{Context.ConnectionId}", Context.ConnectionId, TimeSpan.FromHours(24));
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
