using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class ReputationRepository(FutureConnectionDbContext context) : GenericRepository<Reputation>(context), IReputationRepository
{
    public async Task<Reputation?> GetByUserIdAsync(Guid userId) =>
        await _context.Reputations.FirstOrDefaultAsync(r => r.UserId == userId);
}
