using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface ICompanyRepository : IGenericRepository<Company>
{
    Task<Company?> GetBySlugAsync(string slug);
}
