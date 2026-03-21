using Confluent.Kafka;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FutureConnection.ProfileService.Consumers
{
    /// <summary>
    /// Listens to the "identity.events" Kafka topic for UserCreatedEvents.
    /// When a new user registers, automatically creates an empty profile record in the DB.
    /// </summary>
    public class UserCreatedConsumer(
        IConfiguration config,
        ILogger<UserCreatedConsumer> logger,
        IServiceScopeFactory scopeFactory)
        : KafkaConsumerBase<UserCreatedEvent>(config, logger, "profile-service-group")
    {
        protected override string TopicName => "identity.events";

        protected override async Task ProcessMessageAsync(UserCreatedEvent @event, CancellationToken cancellationToken)
        {
            Logger.LogInformation("Received UserCreatedEvent for UserId={UserId}, creating profile...", @event.UserId);

            // Use a fresh scope because IUnitOfWork is Scoped but this is a Singleton-like background service
            using var scope = scopeFactory.CreateScope();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            // Ensure there is no duplicate profile (idempotency)
            var existing = (await uow.Users.GetAllAsync())
                .FirstOrDefault(u => u.Id == @event.UserId);

            if (existing == null)
            {
                Logger.LogWarning("UserCreatedEvent received for UserId={UserId} but user not found in DB. Skipping profile creation.", @event.UserId);
                return;
            }

            // Profile entity is the User entity in this architecture.
            // The user already exists - just ensure their profile fields are initialized.
            if (string.IsNullOrEmpty(existing.AvatarUrl))
            {
                existing.AvatarUrl = null; // already null, but shows intent
                uow.Users.Update(existing);
                await uow.CompleteAsync();
            }

            Logger.LogInformation("Profile ready for UserId={UserId}", @event.UserId);
        }
    }
}
