using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IVoteRepository : IGenericRepository<Vote>
{
    Task<int> GetScoreAsync(Guid entityId);
}
