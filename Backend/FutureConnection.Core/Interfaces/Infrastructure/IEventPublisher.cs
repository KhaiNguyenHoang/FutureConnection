namespace FutureConnection.Core.Interfaces.Infrastructure
{
    public interface IEventPublisher
    {
        Task PublishAsync<T>(string topic, T @event);
    }
}
