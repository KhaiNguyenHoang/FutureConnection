using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class CommentRepository(FutureConnectionDbContext context) : GenericRepository<Comment>(context), ICommentRepository
{
    public async Task<IEnumerable<Comment>> GetByPostIdAsync(Guid postId) =>
        await _context.Comments.Where(c => c.PostId == postId).ToListAsync();
}
