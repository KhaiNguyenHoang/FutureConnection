using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IGroupRepository : IGenericRepository<Group>
{
    Task<IEnumerable<Group>> GetUserGroupsAsync(Guid userId);
}
