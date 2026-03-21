using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IRoleRepository : IGenericRepository<Role>
{
    Task<Role?> GetByNameAsync(string name);
}
