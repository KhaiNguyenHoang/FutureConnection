using System.Linq.Expressions;
using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IGenericRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, bool includeDeleted = false);
    Task<IReadOnlyList<T>> GetAllAsync(bool includeDeleted = false);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, bool includeDeleted = false);

    Task<T> CreateAsync(T entity);
    Task CreateRangeAsync(IEnumerable<T> entities);

    void Update(T entity);
    void UpdateRange(IEnumerable<T> entities);

    Task SoftDeleteAsync(Guid id);
    Task SoftDeleteRangeAsync(IEnumerable<Guid> ids);

    void HardDelete(T entity);
    void HardDeleteRange(IEnumerable<T> entities);

    Task<bool> ExistsAsync(Guid id);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, bool includeDeleted = false);
}
