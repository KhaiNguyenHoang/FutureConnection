using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IPostTagRepository : IGenericRepository<PostTag>
{
    Task<IEnumerable<Tag>> GetTagsByPostIdAsync(Guid postId);
}
