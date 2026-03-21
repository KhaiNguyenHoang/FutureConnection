using Confluent.Kafka;
using FutureConnection.Core.Interfaces.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace FutureConnection.Infrastructure.Services
{
    public class KafkaEventPublisher : IEventPublisher
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<KafkaEventPublisher> _logger;

        public KafkaEventPublisher(IConfiguration config, ILogger<KafkaEventPublisher> logger)
        {
            _logger = logger;
            var producerConfig = new ProducerConfig
            {
                BootstrapServers = config.GetConnectionString("Kafka") ?? "localhost:9092",
                MessageSendMaxRetries = 3,
                RetryBackoffMs = 1000,
                Acks = Acks.Leader
            };
            _producer = new ProducerBuilder<string, string>(producerConfig).Build();
        }

        public async Task PublishAsync<T>(string topic, T @event)
        {
            try
            {
                var json = JsonSerializer.Serialize(@event);
                await _producer.ProduceAsync(topic, new Message<string, string>
                {
                    Key = Guid.NewGuid().ToString(),
                    Value = json
                });
            }
            catch (ProduceException<string, string> ex)
            {
                _logger.LogError(ex, "Failed to publish event to topic '{Topic}'. Error: {Error}", topic, ex.Error.Reason);
                // Fire-and-forget: do not rethrow — business logic should not fail due to Kafka unavailability
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error publishing event to topic '{Topic}'", topic);
            }
        }
    }
}
