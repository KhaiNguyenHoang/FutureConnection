using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class CompanyFollowerRepository(FutureConnectionDbContext context) : GenericRepository<CompanyFollower>(context), ICompanyFollowerRepository
{
    public async Task<IEnumerable<Company>> GetFollowedCompaniesAsync(Guid userId) =>
        await _context.CompanyFollowers
            .Where(cf => cf.UserId == userId)
            .Select(cf => cf.Company)
            .ToListAsync();

    public async Task<bool> IsFollowingAsync(Guid userId, Guid companyId) =>
        await _context.CompanyFollowers.AnyAsync(cf => cf.UserId == userId && cf.CompanyId == companyId);
}
