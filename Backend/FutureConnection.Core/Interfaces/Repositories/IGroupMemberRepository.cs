using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IGroupMemberRepository : IGenericRepository<GroupMember>
{
    Task<IEnumerable<User>> GetMembersAsync(Guid groupId);
}
