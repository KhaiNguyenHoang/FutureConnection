using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IJobRepository : IGenericRepository<Job>
{
    Task<IEnumerable<Job>> GetActiveJobsAsync();
}
