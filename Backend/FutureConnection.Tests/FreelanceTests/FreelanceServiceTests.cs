using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.FreelanceService.Application;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace FutureConnection.Tests.FreelanceTests
{
    public class FreelanceServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IContractRepository> _mockContractRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly ContractService _contractService;

        public FreelanceServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockContractRepo = new Mock<IContractRepository>();
            _mockMapper = new Mock<IMapper>();

            _mockUow.Setup(u => u.Contracts).Returns(_mockContractRepo.Object);
            _contractService = new ContractService(_mockUow.Object, _mockMapper.Object);
        }

        [Fact]
        public async Task CreateContractAsync_ShouldReturnSuccess()
        {
            // Arrange
            var appId = Guid.NewGuid();
            var req = new CreateContractDto { ApplicationId = appId, EmployerId = Guid.NewGuid(), FreelancerId = Guid.NewGuid() };
            var entity = new Contract { Id = Guid.NewGuid() };
            var appEntity = new Application { Id = appId, Status = Core.Enums.ApplicationStatus.Accepted, JobId = Guid.NewGuid(), ApplicantId = req.FreelancerId, CoverLetter = "A" };

            var mockAppRepo = new Mock<IApplicationRepository>();
            mockAppRepo.Setup(r => r.GetByIdAsync(appId)).ReturnsAsync(appEntity);
            _mockUow.Setup(u => u.Applications).Returns(mockAppRepo.Object);

            _mockMapper.Setup(m => m.Map<Contract>(req)).Returns(entity);
            _mockMapper.Setup(m => m.Map<ContractDto>(entity)).Returns(new ContractDto { ApplicationId = appId });

            // Act
            var result = await _contractService.CreateAsync(req.EmployerId, req);

            // Assert
            Assert.True(result.Success);
            _mockContractRepo.Verify(r => r.CreateAsync(entity), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }

        [Fact]
        public async Task GetTransactionsAsync_ShouldReturnEmpty_WhenNoTransactions()
        {
            // Arrange
            var mockTransactionRepo = new Mock<ITransactionRepository>();
            mockTransactionRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Transaction>());
            _mockUow.Setup(u => u.Transactions).Returns(mockTransactionRepo.Object);

            // Act
            var result = await _contractService.GetTransactionsAsync(Guid.NewGuid());

            // Assert
            Assert.True(result.Success);
        }

        [Fact]
        public async Task CompleteMilestoneAsync_ShouldReturnSuccess()
        {
            // Arrange
            var mId = Guid.NewGuid();
            var milestone = new ContractMilestone { Id = mId, Title = "M1", Description = "M1", IsCompleted = false };
            var mockMilestoneRepo = new Mock<IContractMilestoneRepository>();
            mockMilestoneRepo.Setup(r => r.GetByIdAsync(mId)).ReturnsAsync(milestone);
            _mockUow.Setup(u => u.ContractMilestones).Returns(mockMilestoneRepo.Object);

            var requesterId = Guid.NewGuid();
            _mockContractRepo.Setup(r => r.GetByIdAsync(milestone.ContractId)).ReturnsAsync(new Contract { Id = milestone.ContractId, FreelancerId = requesterId });

            // Act
            var result = await _contractService.CompleteMilestoneAsync(mId, requesterId);

            // Assert
            Assert.True(result.Success);
            Assert.True(milestone.IsCompleted);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }

        [Fact]
        public async Task PayMilestoneAsync_ShouldCreateTransaction()
        {
            // Arrange
            var mId = Guid.NewGuid();
            var contractId = Guid.NewGuid();
            var milestone = new ContractMilestone { Id = mId, Title = "M1", ContractId = contractId, Amount = 100, IsCompleted = true, IsPaid = false };
            var mockMilestoneRepo = new Mock<IContractMilestoneRepository>();
            mockMilestoneRepo.Setup(r => r.GetByIdAsync(mId)).ReturnsAsync(milestone);
            _mockUow.Setup(u => u.ContractMilestones).Returns(mockMilestoneRepo.Object);

            var requesterId = Guid.NewGuid();
            _mockContractRepo.Setup(r => r.GetByIdAsync(contractId)).ReturnsAsync(new Contract { Id = contractId, EmployerId = requesterId, FreelancerId = Guid.NewGuid() });
            var mockTransRepo = new Mock<ITransactionRepository>();
            _mockUow.Setup(u => u.Transactions).Returns(mockTransRepo.Object);

            // Act
            var result = await _contractService.PayMilestoneAsync(mId, requesterId);

            // Assert
            Assert.True(result.Success);
            Assert.True(milestone.IsPaid);
            mockTransRepo.Verify(r => r.CreateAsync(It.Is<Transaction>(t => t.Amount == 100)), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_ShouldFail_WhenApplicationNotAccepted()
        {
            // Arrange
            var appId = Guid.NewGuid();
            var req = new CreateContractDto { ApplicationId = appId };
            var appEntity = new Application { Id = appId, Status = Core.Enums.ApplicationStatus.Pending, JobId = Guid.NewGuid(), ApplicantId = Guid.NewGuid(), CoverLetter = "A" };

            var mockAppRepo = new Mock<IApplicationRepository>();
            mockAppRepo.Setup(r => r.GetByIdAsync(appId)).ReturnsAsync(appEntity);
            _mockUow.Setup(u => u.Applications).Returns(mockAppRepo.Object);

            // Act
            var result = await _contractService.CreateAsync(Guid.NewGuid(), req);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("accepted application", result.Message!);
        }

        [Fact]
        public async Task ResolveDisputeAsync_ShouldReturnSuccess()
        {
            // Arrange
            var dId = Guid.NewGuid();
            var dispute = new Dispute { Id = dId, Reason = "Overdue", Status = Core.Enums.DisputeStatus.Open };
            var mockDisputeRepo = new Mock<IDisputeRepository>();
            mockDisputeRepo.Setup(r => r.GetByIdAsync(dId)).ReturnsAsync(dispute);
            _mockUow.Setup(u => u.Disputes).Returns(mockDisputeRepo.Object);

            // Act
            var result = await _contractService.ResolveDisputeAsync(dId, Core.Enums.DisputeStatus.Resolved);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(Core.Enums.DisputeStatus.Resolved, dispute.Status);
        }
    }
}
