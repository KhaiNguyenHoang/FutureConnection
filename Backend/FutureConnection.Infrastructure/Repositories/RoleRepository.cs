using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class RoleRepository(FutureConnectionDbContext context) : GenericRepository<Role>(context), IRoleRepository
{
    public async Task<Role?> GetByNameAsync(string name) =>
        await _context.Roles.FirstOrDefaultAsync(r => r.Name == name);
}
