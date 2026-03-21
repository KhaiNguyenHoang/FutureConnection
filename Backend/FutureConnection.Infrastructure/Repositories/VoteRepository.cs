using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class VoteRepository(FutureConnectionDbContext context) : GenericRepository<Vote>(context), IVoteRepository
{
    public async Task<int> GetScoreAsync(Guid entityId) =>
        await _context.Votes.Where(v => v.QuestionId == entityId || v.AnswerId == entityId).SumAsync(v => (int)v.Type);
}
