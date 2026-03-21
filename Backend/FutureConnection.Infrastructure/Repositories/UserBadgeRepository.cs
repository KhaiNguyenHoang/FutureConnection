using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class UserBadgeRepository(FutureConnectionDbContext context) : GenericRepository<UserBadge>(context), IUserBadgeRepository
{
    public async Task<IEnumerable<Badge>> GetUserBadgesAsync(Guid userId) =>
        await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.Badge)
            .ToListAsync();
}
