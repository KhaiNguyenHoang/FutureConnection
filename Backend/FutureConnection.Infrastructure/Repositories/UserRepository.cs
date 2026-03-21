using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class UserRepository(FutureConnectionDbContext context) : GenericRepository<User>(context), IUserRepository
{
    public async Task<User?> GetUserByEmail(string email) =>
        await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User?> GetUserByPhoneNumber(string phoneNumber) =>
        await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);

    public async Task<bool> CheckUserId(Guid userId) =>
        await _context.Users.AnyAsync(u => u.Id == userId && !u.IsDeleted);

    public async Task<bool> CheckEmail(string email) =>
        await _context.Users.AnyAsync(u => u.Email == email && !u.IsDeleted);

    public override async Task<User?> GetByIdAsync(Guid id, bool includeDeleted = false)
    {
        var query = _context.Users.AsQueryable();
        if (!includeDeleted)
            query = query.Where(static u => !u.IsDeleted);

        return await query
            .Include(static u => u.Role)
            .Include(static u => u.CVs)
            .FirstOrDefaultAsync(u => u.Id == id);
    }
}
