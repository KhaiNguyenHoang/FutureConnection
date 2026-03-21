using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class PostTagRepository(FutureConnectionDbContext context) : GenericRepository<PostTag>(context), IPostTagRepository
{
    public async Task<IEnumerable<Tag>> GetTagsByPostIdAsync(Guid postId) =>
        await _context.PostTags
            .Where(pt => pt.PostId == postId)
            .Select(pt => pt.Tag)
            .ToListAsync();
}
