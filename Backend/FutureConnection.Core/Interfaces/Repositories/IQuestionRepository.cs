using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IQuestionRepository : IGenericRepository<Question>
{
    Task<IEnumerable<Question>> GetRecentQuestionsAsync(int count);
    Task<IReadOnlyList<Question>> GetQuestionsWithDetailsAsync(System.Linq.Expressions.Expression<Func<Question, bool>> predicate);
    Task<Question?> GetQuestionWithDetailsByIdAsync(Guid id);
}
