using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class JobRepository(FutureConnectionDbContext context) : GenericRepository<Job>(context), IJobRepository
{
    public async Task<IEnumerable<Job>> GetActiveJobsAsync() =>
        await _context.Jobs.Where(j => j.IsActive).ToListAsync();
}
