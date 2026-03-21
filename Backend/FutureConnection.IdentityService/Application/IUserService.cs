using FutureConnection.Core.DTOs;
using Microsoft.AspNetCore.Http;

namespace FutureConnection.IdentityService.Application
{
    public interface IUserService
    {
        Task<Response<UserDto>> Login(LoginUserDto loginDto);
        Task<Response<UserDto>> Register(CreateUserDto registerDto);
        Task<Response<UserDto>> AddExtraUserInfo(UpdateUserDto updateUserDto);
        Task<Response<UserDto>> UpdateUser(UpdateUserDto updateUserDto);
        Task<Response<string>> UpdateAvatarAsync(Guid userId, IFormFile file);
        Task<Response<UserDto>> GetUser(Guid userId);
        Task<Response<IEnumerable<UserDto>>> GetAllUsers();
        Task<Response<UserDto>> GetUserByEmail(string email);
        Task<Response<UserDto>> GetUserByPhoneNumber(string phoneNumber);
        Task<Response<bool>> CheckUserId(Guid userId);
        Task<Response<bool>> CheckEmail(string email);
        Task<Response<bool>> DeleteUser(Guid userId);

        // Auth flow
        Task<Response<string>> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
        Task<Response<bool>> LogoutAsync(Guid userId, string token);

        // Account verification state
        Task<Response<bool>> MarkEmailVerifiedAsync(Guid userId);
    }
}
