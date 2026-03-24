using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IPostRepository : IGenericRepository<Post>
{
    Task<IEnumerable<Post>> GetRecentPostsAsync(int count);
    Task<IEnumerable<Post>> GetPostsByAuthorAsync(Guid authorId);
    Task<IReadOnlyList<Post>> GetPostsWithDetailsAsync(System.Linq.Expressions.Expression<Func<Post, bool>> predicate);
    Task<Post?> GetPostWithDetailsByIdAsync(Guid postId);
}
