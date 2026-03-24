using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class AnswerRepository(FutureConnectionDbContext context) : GenericRepository<Answer>(context), IAnswerRepository
{
    public async Task<IEnumerable<Answer>> GetByQuestionIdAsync(Guid questionId) =>
        await _context.Answers
            .Include(a => a.User).ThenInclude(u => u.Reputations)
            .Include(a => a.Media)
            .Include(a => a.Votes)
            .Where(a => a.QuestionId == questionId)
            .ToListAsync();
}
