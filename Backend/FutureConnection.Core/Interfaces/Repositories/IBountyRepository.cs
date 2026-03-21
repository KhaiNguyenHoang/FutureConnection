using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IBountyRepository : IGenericRepository<Bounty>
{
    Task<IEnumerable<Bounty>> GetActiveBountiesAsync();
}
