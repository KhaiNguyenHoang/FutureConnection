using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class EndorsementRepository(FutureConnectionDbContext context) : GenericRepository<Endorsement>(context), IEndorsementRepository
{
    public async Task<IEnumerable<Endorsement>> GetReceivedEndorsementsAsync(Guid userId) =>
        await _context.Endorsements.Where(e => e.EndorseeId == userId).ToListAsync();
}
