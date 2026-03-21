using FutureConnection.Core.DTOs;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FutureConnection.JobService.Consumers
{
    /// <summary>
    /// Listens to the "job.events" topic for JobApplicationSubmittedEvents.
    /// When a candidate applies, publishes a chat event so the employer gets notified.
    /// </summary>
    public class JobApplicationSubmittedConsumer(
        IConfiguration config,
        ILogger<JobApplicationSubmittedConsumer> logger,
        IServiceScopeFactory scopeFactory,
        IEventPublisher eventPublisher)
        : KafkaConsumerBase<JobApplicationSubmittedEvent>(config, logger, "job-service-notification-group")
    {
        protected override string TopicName => "job.events";

        protected override async Task ProcessMessageAsync(JobApplicationSubmittedEvent @event, CancellationToken cancellationToken)
        {
            Logger.LogInformation(
                "New application for Job '{JobTitle}' (JobId={JobId}) by UserId={ApplicantId}",
                @event.JobTitle, @event.JobId, @event.ApplicantId);

            // Publish a chat event so the employer receives a real-time notification message
            await eventPublisher.PublishAsync("chat.events", new MessageSentEvent
            {
                MessageId = Guid.NewGuid(),
                SenderId = @event.ApplicantId,
                ReceiverId = @event.EmployerId,
                Timestamp = DateTime.UtcNow
            });

            Logger.LogInformation(
                "Chat notification dispatched to EmployerId={EmployerId} for application on '{JobTitle}'",
                @event.EmployerId, @event.JobTitle);

            await Task.CompletedTask;
        }
    }
}
