using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Utils;
using FutureConnection.IdentityService.Application;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace FutureConnection.Tests.IdentityTests
{
    public class UserServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IPasswordHasher> _mockHasher;
        private readonly Mock<IMediaService> _mockMediaService;
        private readonly Mock<IEventPublisher> _mockEventPublisher;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockHasher = new Mock<IPasswordHasher>();
            _mockMediaService = new Mock<IMediaService>();
            _mockEventPublisher = new Mock<IEventPublisher>();

            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
            _userService = new UserService(_mockUow.Object, _mockMapper.Object, _mockHasher.Object, _mockMediaService.Object, _mockEventPublisher.Object);
        }

        [Fact]
        public async Task CheckEmail_ShouldReturnTrue_WhenExists()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.CheckEmail("test@test.com")).ReturnsAsync(true);

            // Act
            var result = await _userService.CheckEmail("test@test.com");

            // Assert
            Assert.True(result.Success);
            Assert.True(result.Data);
        }

        [Fact]
        public async Task ChangePassword_ShouldReturnSuccess_WhenCredentialsValid()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Email = "a@a", HashedPassword = "old_hashed", FirstName = "A", LastName = "B", Role = null! };
            _mockUserRepo.Setup(r => r.GetByIdAsync(userId, It.IsAny<bool>())).ReturnsAsync(user);
            _mockHasher.Setup(h => h.VerifyPassword("current", It.IsAny<string>())).Returns(true);
            _mockHasher.Setup(h => h.HashPassword("StrongPass123!")).Returns("new_hashed");

            // Act
            var result = await _userService.ChangePasswordAsync(userId, "current", "StrongPass123!");

            // Assert
            Assert.True(result.Success);
            Assert.Equal("new_hashed", user.HashedPassword);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }

        [Fact]
        public async Task ChangePassword_ShouldFail_WhenPasswordIncorrect()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Email = "a@a", HashedPassword = "old_hashed", FirstName = "A", LastName = "B", Role = null! };
            _mockUserRepo.Setup(r => r.GetByIdAsync(userId, It.IsAny<bool>())).ReturnsAsync(user);
            _mockHasher.Setup(h => h.VerifyPassword("wrong", "old_hashed")).Returns(false);

            // Act
            var result = await _userService.ChangePasswordAsync(userId, "wrong", "new");

            // Assert
            Assert.False(result.Success);
            Assert.Contains("Incorrect", result.Message!);
        }

        [Fact]
        public async Task Logout_ShouldAddTokenToBlacklist()
        {
            // Arrange
            var mockBlacklist = new Mock<IBlacklistedTokenRepository>();
            var mockRefresh = new Mock<IRefreshTokenRepository>();
            mockRefresh.Setup(r => r.GetAllAsync(false)).ReturnsAsync(new List<RefreshToken>());
            _mockUow.Setup(u => u.BlacklistedTokens).Returns(mockBlacklist.Object);
            _mockUow.Setup(u => u.RefreshTokens).Returns(mockRefresh.Object);

            // Act
            var result = await _userService.LogoutAsync(Guid.NewGuid(), "some-token");

            // Assert
            Assert.True(result.Success);
            mockBlacklist.Verify(r => r.CreateAsync(It.Is<BlacklistedToken>(t => t.Token == "some-token")), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }
    }
}
