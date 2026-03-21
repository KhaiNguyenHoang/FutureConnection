using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IConnectionRepository : IGenericRepository<Connection>
{
    Task<IEnumerable<Connection>> GetConnectionsAsync(Guid userId);
    Task<bool> AreConnectedAsync(Guid user1Id, Guid user2Id);
}
