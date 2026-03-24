using FutureConnection.Core;
using FutureConnection.IdentityService.Application;
using FutureConnection.IdentityService.Middleware;
using FutureConnection.Infrastructure;
using FutureConnection.Infrastructure.Logging;
using FutureConnection.Infrastructure.Middleware;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.ConfigureFutureConnectionLogging();

builder.Services.AddControllers().AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

// Inject Core (AutoMapper, IPasswordHasher) and Infrastructure (Repos, JWT Auth, Redis, Kafka)
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCore();

// Register Application services (IPasswordHasher is already registered in Core.AddCore - not re-registered here)
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("AllowFrontend");

// Always show Swagger (also available when running in Docker)
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseSerilogRequestLogging();
app.UseCorrelationId();

// BlacklistedToken check must come BEFORE Authentication middleware
app.UseMiddleware<BlacklistedTokenMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FutureConnection.Infrastructure.Data.FutureConnectionDbContext>();
    await context.Database.MigrateAsync();

    // ── Seed test users (dev only) ────────────────────────────────────────────
    var adminRoleId    = new Guid("A78B3F5C-1E9D-4C62-BB74-92A3D1E4F8C1");
    var employerRoleId = new Guid("B2C3D4E5-F6A7-4B8C-9D0E-1F2A3B4C5D6E");
    var freelancerRoleId = new Guid("C3D4E5F6-A7B8-4C9D-0E1F-2A3B4C5D6E7F");

    var testUsers = new[]
    {
        new { Email = "admin@test.com",      FirstName = "Admin",      LastName = "Test", RoleId = adminRoleId },
        new { Email = "employer@test.com",   FirstName = "Employer",   LastName = "Test", RoleId = employerRoleId },
        new { Email = "freelancer@test.com", FirstName = "Freelancer", LastName = "Test", RoleId = freelancerRoleId },
    };

    foreach (var seed in testUsers)
    {
        if (!context.Users.Any(u => u.Email == seed.Email))
        {
            var role = await context.Roles.FindAsync(seed.RoleId);
            if (role == null) continue;

            context.Users.Add(new FutureConnection.Core.Entities.User
            {
                Id             = Guid.NewGuid(),
                FirstName      = seed.FirstName,
                LastName       = seed.LastName,
                Email          = seed.Email,
                HashedPassword = BCrypt.Net.BCrypt.HashPassword("Test@1234"),
                RoleId         = seed.RoleId,
                Role           = role,
                IsEmailVerified = true,
                IsOnboarded    = true,
                CreatedAt      = DateTime.UtcNow,
                UpdatedAt      = DateTime.UtcNow,
            });
        }
    }
    await context.SaveChangesAsync();
    // ─────────────────────────────────────────────────────────────────────────
}

app.MapControllers();
app.MapHealthChecks("/healthz");

app.Run();
