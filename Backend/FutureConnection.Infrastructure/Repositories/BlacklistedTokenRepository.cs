using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class BlacklistedTokenRepository(FutureConnectionDbContext context) : GenericRepository<BlacklistedToken>(context), IBlacklistedTokenRepository
{
    public async Task<bool> IsBlacklistedAsync(string token) =>
        await _context.BlacklistedTokens.AnyAsync(t => t.Token == token);
}
