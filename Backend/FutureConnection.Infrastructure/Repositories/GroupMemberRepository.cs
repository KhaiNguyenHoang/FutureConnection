using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class GroupMemberRepository(FutureConnectionDbContext context) : GenericRepository<GroupMember>(context), IGroupMemberRepository
{
    public async Task<IEnumerable<User>> GetMembersAsync(Guid groupId) =>
        await _context.GroupMembers
            .Where(gm => gm.GroupId == groupId)
            .Select(gm => gm.User)
            .ToListAsync();
}
