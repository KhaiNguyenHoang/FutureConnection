using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface ICompanyFollowerRepository : IGenericRepository<CompanyFollower>
{
    Task<IEnumerable<Company>> GetFollowedCompaniesAsync(Guid userId);
    Task<bool> IsFollowingAsync(Guid userId, Guid companyId);
}
