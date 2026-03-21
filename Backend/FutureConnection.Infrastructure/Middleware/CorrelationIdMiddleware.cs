using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace FutureConnection.Infrastructure.Middleware
{
    /// <summary>
    /// Ensures every request has a correlation ID for end-to-end tracing across microservices.
    /// The correlation ID is read from the incoming X-Correlation-Id header (allowing propagation
    /// from the API Gateway) or generated fresh when not present.
    /// The ID is then written back to the response headers and stored in HttpContext.Items.
    /// </summary>
    public class CorrelationIdMiddleware(RequestDelegate next)
    {
        private const string CorrelationIdHeader = "X-Correlation-Id";

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
                ?? Guid.NewGuid().ToString("N");

            context.Items[CorrelationIdHeader] = correlationId;
            context.Response.OnStarting(() =>
            {
                context.Response.Headers[CorrelationIdHeader] = correlationId;
                return Task.CompletedTask;
            });

            // Enrich Serilog's LogContext so every log line in this request carries the correlation ID
            using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
            {
                await next(context);
            }
        }
    }

    public static class CorrelationIdMiddlewareExtensions
    {
        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
            => app.UseMiddleware<CorrelationIdMiddleware>();
    }
}
