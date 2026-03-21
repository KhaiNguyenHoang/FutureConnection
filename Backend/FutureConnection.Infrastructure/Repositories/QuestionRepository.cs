using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class QuestionRepository(FutureConnectionDbContext context) : GenericRepository<Question>(context), IQuestionRepository
{
    public async Task<IEnumerable<Question>> GetRecentQuestionsAsync(int count) =>
        await _context.Questions.OrderByDescending(q => q.CreatedAt).Take(count).ToListAsync();
}
