using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class GroupRepository(FutureConnectionDbContext context) : GenericRepository<Group>(context), IGroupRepository
{
    public async Task<IEnumerable<Group>> GetUserGroupsAsync(Guid userId) =>
        await _context.GroupMembers
            .Where(gm => gm.UserId == userId)
            .Select(gm => gm.Group)
            .ToListAsync();
}
