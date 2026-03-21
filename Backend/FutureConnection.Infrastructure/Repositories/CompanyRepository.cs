using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class CompanyRepository(FutureConnectionDbContext context) : GenericRepository<Company>(context), ICompanyRepository
{
    public async Task<Company?> GetBySlugAsync(string slug) =>
        await _context.Companies.FirstOrDefaultAsync(c => c.Name.ToLower().Replace(" ", "-") == slug);
}
