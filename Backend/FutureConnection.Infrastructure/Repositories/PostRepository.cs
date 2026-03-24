using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class PostRepository(FutureConnectionDbContext context) : GenericRepository<Post>(context), IPostRepository
{
    public async Task<IEnumerable<Post>> GetRecentPostsAsync(int count) =>
        await _context.Posts.OrderByDescending(p => p.CreatedAt).Take(count).ToListAsync();

    public async Task<IEnumerable<Post>> GetPostsByAuthorAsync(Guid authorId) =>
        await _context.Posts.Where(p => p.UserId == authorId).ToListAsync();

    public async Task<IReadOnlyList<Post>> GetPostsWithDetailsAsync(System.Linq.Expressions.Expression<Func<Post, bool>> predicate) =>
        await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Reactions)
            .Include(p => p.Comments)
            .Include(p => p.Media)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .Where(predicate)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task<Post?> GetPostWithDetailsByIdAsync(Guid postId) =>
        await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Reactions)
            .Include(p => p.Comments)
            .Include(p => p.Media)
            .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == postId);
}
