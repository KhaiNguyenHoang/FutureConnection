using FutureConnection.SocialService.Application;
using Microsoft.Extensions.DependencyInjection;

namespace FutureConnection.SocialService
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddSocialServices(this IServiceCollection services)
        {
            services.AddScoped<ISocialService, SocialApplicationService>();
            return services;
        }
    }
}
