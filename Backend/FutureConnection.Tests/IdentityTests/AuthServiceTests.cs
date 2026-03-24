using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Core.Utils;
using FutureConnection.IdentityService.Application;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Security.Claims;

namespace FutureConnection.Tests.IdentityTests
{
    public class AuthServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<IRefreshTokenRepository> _mockTokenRepo;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<IEventPublisher> _mockEventPublisher;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IMapper> _mockMapper;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockTokenRepo = new Mock<IRefreshTokenRepository>();
            _mockConfig = new Mock<IConfiguration>();
            _mockEventPublisher = new Mock<IEventPublisher>();
            _mockEmailService = new Mock<IEmailService>();
            _mockMapper = new Mock<IMapper>();
            var mockLogger = new Mock<Microsoft.Extensions.Logging.ILogger<AuthService>>();

            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
            _mockUow.Setup(u => u.RefreshTokens).Returns(_mockTokenRepo.Object);
            _mockConfig.Setup(c => c["Jwt:Key"]).Returns("FutureConnectionSecretKeyMustBe32BytesOrLongerForTesting");
            _mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("FutureConnection.IdentityService");
            _mockConfig.Setup(c => c["Jwt:Audience"]).Returns("FutureConnection.Clients");

            var mockHasher = new Mock<IPasswordHasher>();
            _authService = new AuthService(_mockUow.Object, _mockConfig.Object, _mockEventPublisher.Object, _mockEmailService.Object, _mockMapper.Object, mockHasher.Object, mockLogger.Object);
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnFalse_WhenEmailExists()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.CheckEmail(It.IsAny<string>())).ReturnsAsync(true);
            var req = new RegisterRequest("A", "B", "test@test.com", "123");

            // Act
            var result = await _authService.RegisterAsync(req);

            // Assert
            Assert.False(result);
            _mockUserRepo.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
            _mockEventPublisher.Verify(p => p.PublishAsync(It.IsAny<string>(), It.IsAny<object>()), Times.Never);
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnTrue_CreateUser_AndPublishEvent_WhenValid()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.CheckEmail(It.IsAny<string>())).ReturnsAsync(false);
            
            var freelancerRole = new Role { Id = Guid.NewGuid(), Name = "Freelancer" };
            _mockUow.Setup(u => u.Roles.GetAllAsync(false)).ReturnsAsync(new List<Role> { freelancerRole });

            var req = new RegisterRequest("John", "Doe", "new@test.com", "Password123");
            User? createdUser = null;
            _mockUserRepo.Setup(r => r.CreateAsync(It.IsAny<User>())).Callback<User>(u => createdUser = u).ReturnsAsync(new User { Id = Guid.NewGuid(), Email = "", HashedPassword = "", FirstName = "", LastName = "", Role = null! });

            // Act
            var result = await _authService.RegisterAsync(req);

            // Assert
            Assert.True(result);
            Assert.NotNull(createdUser);
            Assert.Equal("new@test.com", createdUser.Email);
            Assert.True(BCrypt.Net.BCrypt.Verify("Password123", createdUser.HashedPassword));
            
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
            _mockEventPublisher.Verify(p => p.PublishAsync("user.events", It.IsNotNull<object>()), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnNull_WhenUserNotFound()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.GetUserByEmail(It.IsAny<string>())).ReturnsAsync((User?)null);
            var req = new LoginRequest("nonexistent@test.com", "123");

            // Act
            var result = await _authService.LoginAsync(req);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnTokenResponse_WhenValidCredentials()
        {
            // Arrange
            var user = new User { Id = Guid.NewGuid(), Email = "user@test.com", HashedPassword = BCrypt.Net.BCrypt.HashPassword("validpass"), FirstName = "A", LastName = "B", Role = null! };
            _mockUserRepo.Setup(r => r.GetUserByEmail("user@test.com")).ReturnsAsync(user);
            var req = new LoginRequest("user@test.com", "validpass");

            // Act
            var result = await _authService.LoginAsync(req);

            // Assert
            Assert.NotNull(result);
            Assert.False(string.IsNullOrEmpty(result.AccessToken));
            Assert.False(string.IsNullOrEmpty(result.RefreshToken));
            _mockTokenRepo.Verify(r => r.CreateAsync(It.IsAny<RefreshToken>()), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }
        [Fact]
        public async Task LoginAsync_ShouldEmitEvent_WhenIpMismatchDetected()
        {
            // Arrange: user has a known stored IP; login comes from a different IP
            var user = new User { Id = Guid.NewGuid(), Email = "ip@test.com", HashedPassword = BCrypt.Net.BCrypt.HashPassword("valid"), FirstName = "A", LastName = "B", LastLoginIp = "192.168.1.1", Role = null! };
            _mockUserRepo.Setup(r => r.GetUserByEmail("ip@test.com")).ReturnsAsync(user);
            _mockTokenRepo.Setup(r => r.CreateAsync(It.IsAny<RefreshToken>())).ReturnsAsync(new RefreshToken { Token = "t", CreatedByIp = "0.0.0.0" });
            var req = new LoginRequest("ip@test.com", "valid", IpAddress: "10.0.0.1"); // different IP

            // Act
            await _authService.LoginAsync(req);

            // Assert
            _mockEventPublisher.Verify(p => p.PublishAsync("auth.events", It.Is<object>(o => o.ToString()!.Contains("LoginAttemptIPMismatch"))), Times.Once);
        }

        [Fact]
        public async Task RefreshTokenAsync_ShouldReturnNewTokens_WhenValid()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var oldToken = "VALID_TOKEN";
            var tokenEntity = new RefreshToken 
            { 
                Token = oldToken, 
                UserId = userId, 
                ExpiryDate = DateTime.UtcNow.AddMinutes(10), 
                CreatedByIp = "127.0.0.1", 
                IsRevoked = false 
            };
            
            _mockTokenRepo.Setup(r => r.GetByTokenAsync(oldToken)).ReturnsAsync(tokenEntity);
            _mockUserRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<bool>())).ReturnsAsync(new User 
            { 
                Id = userId, 
                Email = "test@test.com", 
                HashedPassword = "hashed", 
                FirstName = "Test", 
                LastName = "User", 
                Role = new Role { Name = "User" },
                IsEmailVerified = true,
                IsOnboarded = true
            });
            _mockMapper.Setup(m => m.Map<IEnumerable<Claim>>(It.IsAny<User>())).Returns(new List<Claim>());

            // Act
            var result = await _authService.RefreshTokenAsync(oldToken);

            // Assert
            Assert.NotNull(result);
            Assert.True(tokenEntity.IsRevoked);
            _mockTokenRepo.Verify(r => r.CreateAsync(It.IsAny<RefreshToken>()), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.AtLeastOnce);
        }

        [Fact]
        public async Task RefreshTokenAsync_ShouldReturnNull_WhenTokenInvalid()
        {
            // Arrange
            _mockTokenRepo.Setup(r => r.GetAllAsync(false)).ReturnsAsync(new List<RefreshToken>());

            // Act
            var result = await _authService.RefreshTokenAsync("invalid");

            // Assert
            Assert.Null(result);
        }
    }
}
