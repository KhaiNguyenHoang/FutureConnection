using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class ReactionRepository(FutureConnectionDbContext context) : GenericRepository<Reaction>(context), IReactionRepository
{
    public async Task<IEnumerable<Reaction>> GetByPostIdAsync(Guid postId) =>
        await _context.Reactions.Where(r => r.PostId == postId).ToListAsync();

    public async Task<Reaction?> GetUserReactionOnPostAsync(Guid userId, Guid postId) =>
        await _context.Reactions.FirstOrDefaultAsync(r => r.UserId == userId && r.PostId == postId);
}
