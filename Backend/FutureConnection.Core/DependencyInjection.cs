using FutureConnection.Core.Mappers;
using FutureConnection.Core.Utils;
using Microsoft.Extensions.DependencyInjection;

namespace FutureConnection.Core
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddCore(this IServiceCollection services)
        {
            services.AddAutoMapper(static cfg => cfg.AddProfile<AppProfile>());
            services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
            return services;
        }
    }
}
