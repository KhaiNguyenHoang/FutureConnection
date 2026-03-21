namespace FutureConnection.Core.Interfaces.Infrastructure
{
    /// <summary>
    /// Marker interface for Kafka consumer background services.
    /// Implement this alongside IHostedService for event-driven consumers.
    /// </summary>
    public interface IEventConsumer
    {
        Task StartConsumingAsync(CancellationToken cancellationToken);
    }
}
