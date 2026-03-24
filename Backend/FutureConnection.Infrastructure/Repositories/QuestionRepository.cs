using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class QuestionRepository(FutureConnectionDbContext context) : GenericRepository<Question>(context), IQuestionRepository
{
    public async Task<IEnumerable<Question>> GetRecentQuestionsAsync(int count) =>
        await _context.Questions.OrderByDescending(q => q.CreatedAt).Take(count).ToListAsync();

    public async Task<IReadOnlyList<Question>> GetQuestionsWithDetailsAsync(System.Linq.Expressions.Expression<Func<Question, bool>> predicate) =>
        await _context.Questions
            .Include(q => q.User).ThenInclude(u => u.Reputations)
            .Include(q => q.Answers)
            .Include(q => q.Votes)
            .Include(q => q.Media)
            .Include(q => q.QuestionTags).ThenInclude(qt => qt.Tag)
            .Where(predicate)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

    public async Task<Question?> GetQuestionWithDetailsByIdAsync(Guid id) =>
        await _context.Questions
            .Include(q => q.User).ThenInclude(u => u.Reputations)
            .Include(q => q.Answers)
            .Include(q => q.Votes)
            .Include(q => q.Media)
            .Include(q => q.QuestionTags).ThenInclude(qt => qt.Tag)
            .FirstOrDefaultAsync(q => q.Id == id);
}
