using FutureConnection.Core.Interfaces.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace FutureConnection.Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly ILogger<RedisCacheService> _logger;
        private readonly Lazy<IDatabase> _db;

        public RedisCacheService(IConfiguration config, ILogger<RedisCacheService> logger)
        {
            _logger = logger;
            var connectionString = (config.GetConnectionString("Redis") ?? "localhost:6379") + ",abortConnect=false,connectTimeout=2000,syncTimeout=2000";
            _db = new Lazy<IDatabase>(() =>
            {
                var redis = ConnectionMultiplexer.Connect(connectionString);
                return redis.GetDatabase();
            });
        }

        private IDatabase? GetDb()
        {
            try { return _db.Value; }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis is unavailable. Cache operations will be skipped.");
                return null;
            }
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var db = GetDb();
                if (db == null) return default;
                var value = await db.StringGetAsync(key);
                if (value.IsNullOrEmpty) return default;
                return JsonSerializer.Deserialize<T>(value.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis GET failed for key '{Key}'", key);
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            try
            {
                var db = GetDb();
                if (db == null) return;
                var json = JsonSerializer.Serialize(value);
                if (expiration.HasValue)
                    await db.StringSetAsync(key, json, expiration.Value);
                else
                    await db.StringSetAsync(key, json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis SET failed for key '{Key}'", key);
            }
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                var db = GetDb();
                if (db == null) return;
                await db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis REMOVE failed for key '{Key}'", key);
            }
        }
    }
}
