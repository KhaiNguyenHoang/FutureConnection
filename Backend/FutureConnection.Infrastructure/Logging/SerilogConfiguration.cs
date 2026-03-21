using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

namespace FutureConnection.Infrastructure.Logging
{
    /// <summary>
    /// Central Serilog configuration shared by all microservices.
    /// Logs to Console (structured JSON in production, readable in dev) and to a rolling file.
    /// </summary>
    public static class SerilogConfiguration
    {
        public static IHostBuilder ConfigureFutureConnectionLogging(this IHostBuilder builder)
        {
            return builder.UseSerilog((context, services, loggerConfig) =>
            {
                loggerConfig
                    .ReadFrom.Configuration(context.Configuration)
                    .ReadFrom.Services(services)
                    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
                    .WriteTo.Console(
                        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
                    .WriteTo.File(
                        path: $"logs/{context.HostingEnvironment.ApplicationName}-.log",
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 7,
                        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}");
            });
        }
    }
}
