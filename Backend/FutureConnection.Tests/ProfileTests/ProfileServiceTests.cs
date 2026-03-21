using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.ProfileService.Application;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FutureConnection.Tests.ProfileTests
{
    public class ProfileServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<ICVRepository> _mockCvRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ICacheService> _mockCache;
        private readonly ProfileApplicationService _profileService;

        public ProfileServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockCvRepo = new Mock<ICVRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockCache = new Mock<ICacheService>();

            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
            _mockUow.Setup(u => u.CVs).Returns(_mockCvRepo.Object);

            _profileService = new ProfileApplicationService(_mockUow.Object, _mockMapper.Object, _mockCache.Object);
        }

        [Fact]
        public async Task GetProfileAsync_ShouldReturnFromCache_WhenCacheExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var cachedUser = new UserDto { Id = userId, FirstName = "Cached", LastName = "User", Email = "c@test.com" };
            _mockCache.Setup(c => c.GetAsync<UserDto>($"profile-{userId}")).ReturnsAsync(cachedUser);

            // Act
            var result = await _profileService.GetProfileAsync(userId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Cached", result.Data!.FirstName);
            _mockUserRepo.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task GetProfileAsync_ShouldReturnFromDb_AndCache_WhenNotCached()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, FirstName = "DBUser", LastName = "Last", Email = "a@a", HashedPassword = "B", Role = null! };
            var mappedUser = new UserDto { Id = userId, FirstName = "DBUser", LastName = "Last", Email = "a@a" };

            _mockCache.Setup(c => c.GetAsync<UserDto>(It.IsAny<string>())).ReturnsAsync((UserDto?)null);
            _mockUserRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
            _mockMapper.Setup(m => m.Map<UserDto>(user)).Returns(mappedUser);

            // Act
            var result = await _profileService.GetProfileAsync(userId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("DBUser", result.Data!.FirstName);
            _mockCache.Verify(c => c.SetAsync($"profile-{userId}", mappedUser, It.IsAny<TimeSpan?>()), Times.Once);
        }

        [Fact]
        public async Task GetCvsAsync_ShouldReturnUserCVs()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var cvs = new List<CV>
            {
                new CV { Id = Guid.NewGuid(), UserId = userId, University = "MIT" },
                new CV { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), University = "Stanford" }
            };
            var mappedCvs = new List<CVDto> { new CVDto { University = "MIT" } };

            _mockCvRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(cvs);
            _mockMapper.Setup(m => m.Map<IEnumerable<CVDto>>(It.IsAny<IEnumerable<CV>>())).Returns(mappedCvs);

            // Act
            var result = await _profileService.GetCvsAsync(userId);

            // Assert
            Assert.True(result.Success);
            Assert.Single(result.Data!);
        }

        [Fact]
        public async Task UpdateProfileAsync_ShouldReturnSuccess_AndInvalidateCache()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, FirstName = "Old", LastName = "Name", Email = "a@a", HashedPassword = "1", Role = null! };
            var dto = new UpdateUserDto { FirstName = "New" };
            _mockUserRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

            // Act
            var result = await _profileService.UpdateProfileAsync(userId, dto);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("New", user.FirstName);
            _mockCache.Verify(c => c.RemoveAsync($"profile-{userId}"), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }

        [Fact]
        public async Task AddProjectAsync_ShouldReturnSuccess()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var req = new CreatePersonalProjectDto { Name = "P1", Description = "D1", RepositoryUrl = "URL", StartAt = DateTime.UtcNow };
            var projRepo = new Mock<IPersonalProjectRepository>();
            _mockUow.Setup(u => u.PersonalProjects).Returns(projRepo.Object);

            // Act
            var result = await _profileService.AddProjectAsync(userId, req);

            // Assert
            Assert.True(result.Success);
            projRepo.Verify(r => r.CreateAsync(It.IsAny<PersonalProject>()), Times.Once);
        }

        [Fact]
        public async Task AddEndorsementAsync_ShouldFail_WhenSelfEndorsing()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var req = new CreateEndorsementDto { EndorserId = userId, EndorseeId = userId, SkillTagId = Guid.NewGuid() };

            // Act
            var result = await _profileService.AddEndorsementAsync(userId, req);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("cannot endorse yourself", result.Message!);
        }
    }
}
