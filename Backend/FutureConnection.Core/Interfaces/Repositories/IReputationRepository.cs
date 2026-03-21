using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IReputationRepository : IGenericRepository<Reputation>
{
    Task<Reputation?> GetByUserIdAsync(Guid userId);
}
