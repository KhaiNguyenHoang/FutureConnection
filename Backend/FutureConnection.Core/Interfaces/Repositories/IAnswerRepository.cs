using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IAnswerRepository : IGenericRepository<Answer>
{
    Task<IEnumerable<Answer>> GetByQuestionIdAsync(Guid questionId);
}
