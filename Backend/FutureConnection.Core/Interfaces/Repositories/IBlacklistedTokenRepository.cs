using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IBlacklistedTokenRepository : IGenericRepository<BlacklistedToken>
{
    Task<bool> IsBlacklistedAsync(string token);
}
