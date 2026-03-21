using FutureConnection.JobService.Application;
using FutureConnection.JobService.Consumers;
using Microsoft.Extensions.DependencyInjection;

namespace FutureConnection.JobService
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddJobServices(this IServiceCollection services)
        {
            services.AddScoped<ICompanyService, CompanyService>();
            services.AddScoped<IJobService, JobApplicationService>();
            // Kafka Consumer: notifies employers when a candidate applies
            services.AddHostedService<JobApplicationSubmittedConsumer>();
            return services;
        }
    }
}
