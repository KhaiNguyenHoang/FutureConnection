using FutureConnection.ProfileService.Application;
using FutureConnection.ProfileService.Consumers;
using Microsoft.Extensions.DependencyInjection;

namespace FutureConnection.ProfileService
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddProfileServices(this IServiceCollection services)
        {
            services.AddScoped<IProfileService, ProfileApplicationService>();
            // Kafka Consumer: automatically starts when the app boots
            services.AddHostedService<UserCreatedConsumer>();
            return services;
        }
    }
}
