using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace FutureConnection.Infrastructure.Repositories;

public class GenericRepository<T>(FutureConnectionDbContext context) : IGenericRepository<T> where T : BaseEntity
{
    protected readonly FutureConnectionDbContext _context = context;

    public virtual async Task<T?> GetByIdAsync(Guid id, bool includeDeleted = false)
    {
        var entity = await _context.Set<T>().FindAsync(id);
        if (entity == null || (entity.IsDeleted && !includeDeleted))
            return null;
        return entity;
    }

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(bool includeDeleted = false)
    {
        return includeDeleted
            ? await _context.Set<T>().ToListAsync()
            : await _context.Set<T>().Where(e => !e.IsDeleted).ToListAsync();
    }

    public virtual async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, bool includeDeleted = false)
    {
        var query = _context.Set<T>().Where(predicate);
        if (!includeDeleted)
            query = query.Where(e => !e.IsDeleted);
        return await query.ToListAsync();
    }

    public virtual IQueryable<T> Query(bool includeDeleted = false)
    {
        var query = _context.Set<T>().AsQueryable();
        if (!includeDeleted)
            query = query.Where(e => !e.IsDeleted);
        return query;
    }

    public virtual async Task<T> CreateAsync(T entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.Set<T>().AddAsync(entity);
        return entity;
    }

    public virtual async Task CreateRangeAsync(IEnumerable<T> entities)
    {
        foreach (var entity in entities)
        {
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
        }
        await _context.Set<T>().AddRangeAsync(entities);
    }

    public virtual void Update(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Set<T>().Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
    }

    public virtual void UpdateRange(IEnumerable<T> entities)
    {
        foreach (var entity in entities)
            entity.UpdatedAt = DateTime.UtcNow;
        _context.Set<T>().UpdateRange(entities);
    }

    public virtual async Task SoftDeleteAsync(Guid id)
    {
        var entity = await _context.Set<T>().FindAsync(id);
        if (entity != null)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            Update(entity);
        }
    }

    public virtual async Task SoftDeleteRangeAsync(IEnumerable<Guid> ids)
    {
        var entities = await _context.Set<T>().Where(e => ids.Contains(e.Id)).ToListAsync();
        foreach (var entity in entities)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
        }
        _context.Set<T>().UpdateRange(entities);
    }

    public virtual void HardDelete(T entity) => _context.Set<T>().Remove(entity);

    public virtual void HardDeleteRange(IEnumerable<T> entities) => _context.Set<T>().RemoveRange(entities);

    public virtual async Task<bool> ExistsAsync(Guid id) =>
        await _context.Set<T>().AnyAsync(e => e.Id == id && !e.IsDeleted);

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, bool includeDeleted = false)
    {
        var query = _context.Set<T>().AsQueryable();
        if (!includeDeleted)
            query = query.Where(e => !e.IsDeleted);
        if (predicate != null)
            query = query.Where(predicate);
        return await query.CountAsync();
    }
}
