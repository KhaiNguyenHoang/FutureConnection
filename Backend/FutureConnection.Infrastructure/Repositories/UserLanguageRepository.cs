using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories
{
    public class UserLanguageRepository : GenericRepository<UserLanguage>, IUserLanguageRepository
    {
        public UserLanguageRepository(FutureConnectionDbContext context) : base(context)
        {
        }
    }
}
