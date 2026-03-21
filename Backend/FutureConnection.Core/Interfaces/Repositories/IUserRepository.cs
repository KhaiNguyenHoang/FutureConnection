using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetUserByEmail(string email);
    Task<User?> GetUserByPhoneNumber(string phoneNumber);
    Task<bool> CheckUserId(Guid userId);
    Task<bool> CheckEmail(string email);
}
