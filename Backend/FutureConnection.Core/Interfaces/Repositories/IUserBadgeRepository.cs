using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IUserBadgeRepository : IGenericRepository<UserBadge>
{
    Task<IEnumerable<Badge>> GetUserBadgesAsync(Guid userId);
}
