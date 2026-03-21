using FutureConnection.ChatService.Application;
using Microsoft.Extensions.DependencyInjection;

namespace FutureConnection.ChatService
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddChatServices(this IServiceCollection services)
        {
            services.AddSignalR();
            services.AddScoped<IChatService, ChatApplicationService>();
            return services;
        }
    }
}
