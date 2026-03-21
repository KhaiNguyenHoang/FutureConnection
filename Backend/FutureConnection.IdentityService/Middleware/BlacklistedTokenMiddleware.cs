using FutureConnection.Core.Interfaces.Repositories;

namespace FutureConnection.IdentityService.Middleware
{
    /// <summary>
    /// Middleware that validates incoming JWT tokens against the BlacklistedTokens table.
    /// Logged-out tokens are rejected even if they have not yet expired.
    /// </summary>
    public class BlacklistedTokenMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context, IUnitOfWork uow)
        {
            var authHeader = context.Request.Headers.Authorization.ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader["Bearer ".Length..].Trim();
                var isBlacklisted = await uow.BlacklistedTokens.IsBlacklistedAsync(token);

                if (isBlacklisted)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { Success = false, Message = "Token has been invalidated. Please log in again." });
                    return;
                }
            }

            await next(context);
        }
    }
}
