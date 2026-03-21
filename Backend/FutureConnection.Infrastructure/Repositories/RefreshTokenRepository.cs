using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class RefreshTokenRepository(FutureConnectionDbContext context) : GenericRepository<RefreshToken>(context), IRefreshTokenRepository
{
    public async Task<RefreshToken?> GetByTokenAsync(string token) =>
        await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == token);

    public async Task<IEnumerable<RefreshToken>> GetByUserIdAsync(Guid userId) =>
        await _context.RefreshTokens.Where(t => t.UserId == userId).ToListAsync();
}
