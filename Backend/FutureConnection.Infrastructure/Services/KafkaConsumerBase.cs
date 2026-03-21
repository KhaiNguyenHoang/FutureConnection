using Confluent.Kafka;
using FutureConnection.Core.Interfaces.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace FutureConnection.Infrastructure.Services
{
    /// <summary>
    /// Abstract base class for Kafka consumers that run as IHostedService background services.
    /// Override ProcessMessageAsync to implement your event handling logic.
    /// </summary>
    public abstract class KafkaConsumerBase<TEvent> : BackgroundService, IEventConsumer
    {
        private readonly IConsumer<string, string> _consumer;
        protected readonly ILogger Logger;

        protected abstract string TopicName { get; }
        protected abstract Task ProcessMessageAsync(TEvent @event, CancellationToken cancellationToken);

        protected KafkaConsumerBase(IConfiguration config, ILogger logger, string consumerGroup)
        {
            Logger = logger;

            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = config.GetConnectionString("Kafka") ?? "localhost:9092",
                GroupId = consumerGroup,
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            _consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Task.Yield();
            await StartConsumingAsync(stoppingToken);
        }

        public async Task StartConsumingAsync(CancellationToken cancellationToken)
        {
            _consumer.Subscribe(TopicName);

            try
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        var result = _consumer.Consume(TimeSpan.FromMilliseconds(100));
                        if (result is null) continue;

                        var @event = JsonSerializer.Deserialize<TEvent>(result.Message.Value);
                        if (@event is not null)
                        {
                            await ProcessMessageAsync(@event, cancellationToken);
                        }

                        _consumer.Commit(result);
                    }
                    catch (ConsumeException ex)
                    {
                        Logger.LogError(ex, "Kafka consume error on topic '{Topic}': {Reason}", TopicName, ex.Error.Reason);
                    }
                    catch (JsonException ex)
                    {
                        Logger.LogWarning(ex, "Failed to deserialize Kafka message on topic '{Topic}'", TopicName);
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, "Unexpected error processing message on topic '{Topic}'", TopicName);
                        await Task.Delay(500, cancellationToken);
                    }
                }
            }
            finally
            {
                _consumer.Close();
            }
        }
    }
}
