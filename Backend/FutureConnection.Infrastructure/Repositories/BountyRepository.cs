using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class BountyRepository(FutureConnectionDbContext context) : GenericRepository<Bounty>(context), IBountyRepository
{
    public async Task<IEnumerable<Bounty>> GetActiveBountiesAsync() =>
        await _context.Bounties.Where(b => !b.IsAwarded).ToListAsync();
}
