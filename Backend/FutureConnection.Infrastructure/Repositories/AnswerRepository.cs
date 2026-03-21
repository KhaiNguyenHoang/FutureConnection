using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class AnswerRepository(FutureConnectionDbContext context) : GenericRepository<Answer>(context), IAnswerRepository
{
    public async Task<IEnumerable<Answer>> GetByQuestionIdAsync(Guid questionId) =>
        await _context.Answers.Where(a => a.QuestionId == questionId).ToListAsync();
}
