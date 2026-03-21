using FutureConnection.FreelanceService.Application;
using Microsoft.Extensions.DependencyInjection;

namespace FutureConnection.FreelanceService
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddFreelanceServices(this IServiceCollection services)
        {
            services.AddScoped<IContractService, ContractService>();
            services.AddScoped<IAgencyService, AgencyService>();
            return services;
        }
    }
}
