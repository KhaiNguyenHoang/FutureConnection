using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class ConnectionRepository(FutureConnectionDbContext context) : GenericRepository<Connection>(context), IConnectionRepository
{
    public async Task<IEnumerable<Connection>> GetConnectionsAsync(Guid userId) =>
        await _context.Connections.Where(c => c.RequesterId == userId || c.AddresseeId == userId).ToListAsync();

    public async Task<bool> AreConnectedAsync(Guid user1Id, Guid user2Id) =>
        await _context.Connections.AnyAsync(c =>
            (c.RequesterId == user1Id && c.AddresseeId == user2Id) ||
            (c.RequesterId == user2Id && c.AddresseeId == user1Id));
}
