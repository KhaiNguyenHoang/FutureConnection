using FutureConnection.CommunityService.Application;
using Microsoft.Extensions.DependencyInjection;

namespace FutureConnection.CommunityService
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddCommunityServices(this IServiceCollection services)
        {
            services.AddScoped<IQuestionService, QuestionService>();
            return services;
        }
    }
}
