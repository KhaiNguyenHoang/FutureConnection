using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories
{
    public class UserFrameworkRepository : GenericRepository<UserFramework>, IUserFrameworkRepository
    {
        public UserFrameworkRepository(FutureConnectionDbContext context) : base(context)
        {
        }
    }
}
