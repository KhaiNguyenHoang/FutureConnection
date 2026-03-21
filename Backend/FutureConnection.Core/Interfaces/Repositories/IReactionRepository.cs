using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IReactionRepository : IGenericRepository<Reaction>
{
    Task<IEnumerable<Reaction>> GetByPostIdAsync(Guid postId);
    Task<Reaction?> GetUserReactionOnPostAsync(Guid userId, Guid postId);
}
