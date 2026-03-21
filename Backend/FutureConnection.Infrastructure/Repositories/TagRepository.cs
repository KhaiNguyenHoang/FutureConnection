using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class TagRepository(FutureConnectionDbContext context) : GenericRepository<Tag>(context), ITagRepository
{
    public async Task<Tag?> GetByNameAsync(string name) =>
        await _context.Tags.FirstOrDefaultAsync(t => t.Name == name);
}
