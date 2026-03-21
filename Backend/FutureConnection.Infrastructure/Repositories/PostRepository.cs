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
}
