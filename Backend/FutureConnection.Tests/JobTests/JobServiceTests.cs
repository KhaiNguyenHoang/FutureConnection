using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.JobService.Application;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FutureConnection.Tests.JobTests
{
    public class JobServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IJobRepository> _mockJobRepo;
        private readonly Mock<IApplicationRepository> _mockAppRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ICacheService> _mockCache;
        private readonly JobApplicationService _jobService;

        public JobServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockJobRepo = new Mock<IJobRepository>();
            _mockAppRepo = new Mock<IApplicationRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockCache = new Mock<ICacheService>();

            _mockUow.Setup(u => u.Jobs).Returns(_mockJobRepo.Object);
            _mockUow.Setup(u => u.Applications).Returns(_mockAppRepo.Object);

            _jobService = new JobApplicationService(_mockUow.Object, _mockMapper.Object, _mockCache.Object);
        }

        [Fact]
        public async Task GetJobsAsync_ShouldReturnFromCache_WhenCacheHit()
        {
            // Arrange
            var pagedRequest = new PagedRequest { Page = 1, PageSize = 10 };
            var cachedResult = new PagedResponse<JobDto> { Data = new List<JobDto> { new JobDto { Title = "Software Engineer", Description = "Desc" } }, TotalCount = 1, Page = 1, PageSize = 10 };
            _mockCache.Setup(c => c.GetAsync<PagedResponse<JobDto>>(It.IsAny<string>())).ReturnsAsync(cachedResult);

            // Act
            var result = await _jobService.GetJobsAsync(pagedRequest, null, null, null, null);

            // Assert
            Assert.True(result.Success);
            Assert.Single(result.Data!);
            _mockJobRepo.Verify(r => r.GetAllAsync(false), Times.Never);
        }

        [Fact]
        public async Task ApplyAsync_ShouldFail_WhenJobIsClosed()
        {
            // Arrange
            var jobId = Guid.NewGuid();
            var job = new Job { Id = jobId, Status = JobStatus.Closed, Title = "T", Description = "D" };
            _mockJobRepo.Setup(r => r.GetByIdAsync(jobId, false)).ReturnsAsync(job);

            var req = new CreateApplicationDto { ApplicantId = Guid.NewGuid(), CoverLetter = "Hire me" };

            // Act
            var result = await _jobService.ApplyAsync(jobId, req.ApplicantId, req);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("closed", result.Message!);
            _mockAppRepo.Verify(r => r.CreateAsync(It.IsAny<Application>()), Times.Never);
        }

        [Fact]
        public async Task ApplyAsync_ShouldSucceed_WhenValid()
        {
            // Arrange
            var jobId = Guid.NewGuid();
            var job = new Job { Id = jobId, Status = JobStatus.Open, Title = "Job", Description = "Desc" };
            _mockJobRepo.Setup(r => r.GetByIdAsync(jobId, false)).ReturnsAsync(job);

            _mockAppRepo.Setup(r => r.GetAllAsync(false)).ReturnsAsync(new List<Application>());
            
            var req = new CreateApplicationDto { ApplicantId = Guid.NewGuid(), CoverLetter = "Hire me" };
            var appEntity = new Application { JobId = jobId, ApplicantId = req.ApplicantId, CoverLetter = "Hire me" };
            _mockMapper.Setup(m => m.Map<Application>(req)).Returns(appEntity);
            var appDto = new ApplicationDto { JobId = jobId, CoverLetter = "Hire me" };
            _mockMapper.Setup(m => m.Map<ApplicationDto>(appEntity)).Returns(appDto);

            // Act
            var result = await _jobService.ApplyAsync(jobId, req.ApplicantId, req);

            // Assert
            Assert.True(result.Success);
            _mockAppRepo.Verify(r => r.CreateAsync(appEntity), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }

        [Fact]
        public async Task ApplyAsync_ShouldFail_WhenAlreadyApplied()
        {
            // Arrange
            var jobId = Guid.NewGuid();
            var applicantId = Guid.NewGuid();
            var job = new Job { Id = jobId, Status = JobStatus.Open, Title = "T", Description = "D" };
            _mockJobRepo.Setup(r => r.GetByIdAsync(jobId, false)).ReturnsAsync(job);

            var existingApps = new List<Application> { new Application { JobId = jobId, ApplicantId = applicantId, CoverLetter = "a" } };
            _mockAppRepo.Setup(r => r.GetAllAsync(false)).ReturnsAsync(existingApps);

            var req = new CreateApplicationDto { ApplicantId = applicantId, CoverLetter = "Duplicate" };

            // Act
            var result = await _jobService.ApplyAsync(jobId, req.ApplicantId, req);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("already applied", result.Message!);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNotFound_WhenJobDoesNotExist()
        {
            // Arrange
            _mockJobRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), false)).ReturnsAsync((Job?)null);

            // Act
            var result = await _jobService.GetByIdAsync(Guid.NewGuid());

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Job not found.", result.Message);
        }

        [Fact]
        public async Task CreateJobAsync_ShouldReturnSuccess()
        {
            // Arrange
            var req = new CreateJobDto { Title = "New Job", Description = "D", EmployerId = Guid.NewGuid() };
            var entity = new Job { Id = Guid.NewGuid(), Title = "New Job", Description = "D" };
            _mockMapper.Setup(m => m.Map<Job>(req)).Returns(entity);

            // Act
            var result = await _jobService.CreateAsync(req.EmployerId, req);

            // Assert
            Assert.True(result.Success);
            _mockJobRepo.Verify(r => r.CreateAsync(entity), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }
    }
}
