using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.CommunityService.Application;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FutureConnection.Tests.CommunityTests
{
    public class CommunityServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IQuestionRepository> _mockQuestionRepo;
        private readonly Mock<IVoteRepository> _mockVoteRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IMediaService> _mockMediaService;
        private readonly QuestionService _questionService;

        public CommunityServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockQuestionRepo = new Mock<IQuestionRepository>();
            _mockVoteRepo = new Mock<IVoteRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockMediaService = new Mock<IMediaService>();

            _mockUow.Setup(u => u.Questions).Returns(_mockQuestionRepo.Object);
            _mockUow.Setup(u => u.Votes).Returns(_mockVoteRepo.Object);

            _questionService = new QuestionService(_mockUow.Object, _mockMapper.Object, _mockMediaService.Object);
        }

        [Fact]
        public async Task AskQuestionAsync_ShouldReturnSuccess()
        {
            // Arrange
            var req = new CreateQuestionDto { UserId = Guid.NewGuid(), Title = "Help", Content = "Need help" };
            var entity = new Question { Id = Guid.NewGuid(), Title = "Help", Content = "Need help" };

            _mockMapper.Setup(m => m.Map<Question>(req)).Returns(entity);
            _mockMapper.Setup(m => m.Map<QuestionDto>(entity)).Returns(new QuestionDto { Title = "Help", Content = "Need help" });

            // Act
            var result = await _questionService.CreateAsync(req);

            // Assert
            Assert.True(result.Success);
            _mockQuestionRepo.Verify(r => r.CreateAsync(entity), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.AtLeastOnce);
        }

        [Fact]
        public async Task VoteQuestionAsync_ShouldFail_WhenVotingOnOwnQuestion()
        {
            // Arrange
            var authorId = Guid.NewGuid();
            var qId = Guid.NewGuid();
            var q = new Question { Id = qId, UserId = authorId, Title = "Help", Content = "Need help" };

            _mockQuestionRepo.Setup(r => r.GetByIdAsync(qId, false)).ReturnsAsync(q);
            var req = new CreateVoteDto { UserId = authorId, Type = FutureConnection.Core.Enums.VoteType.Upvote };

            // Act
            var result = await _questionService.VoteQuestionAsync(qId, req);

            // Assert
            Assert.Contains("cannot vote on your own", result.Message!);
        }

        [Fact]
        public async Task VoteQuestionAsync_ShouldSucceed_AndAwardReputation()
        {
            // Arrange
            var authorId = Guid.NewGuid();
            var voterId = Guid.NewGuid();
            var qId = Guid.NewGuid();
            var q = new Question { Id = qId, UserId = authorId, Title = "H", Content = "C" };

            _mockQuestionRepo.Setup(r => r.GetByIdAsync(qId, false)).ReturnsAsync(q);
            _mockVoteRepo.Setup(r => r.GetAllAsync(false)).ReturnsAsync(new List<Vote>());
            
            var repRepo = new Mock<IReputationRepository>();
            _mockUow.Setup(u => u.Reputations).Returns(repRepo.Object);

            var req = new CreateVoteDto { UserId = voterId, Type = VoteType.Upvote };
            _mockMapper.Setup(m => m.Map<Vote>(req)).Returns(new Vote());

            // Act
            var result = await _questionService.VoteQuestionAsync(qId, req);

            // Assert
            Assert.True(result.Success);
            _mockVoteRepo.Verify(r => r.CreateAsync(It.IsAny<Vote>()), Times.Once);
            repRepo.Verify(r => r.CreateAsync(It.Is<Reputation>(rep => rep.UserId == authorId && rep.Points == 10)), Times.Once);
        }

        [Fact]
        public async Task VoteQuestionAsync_ShouldFail_WhenAlreadyVoted()
        {
            // Arrange
            var voterId = Guid.NewGuid();
            var qId = Guid.NewGuid();
            _mockQuestionRepo.Setup(r => r.GetByIdAsync(qId, false)).ReturnsAsync(new Question { Id = qId, UserId = Guid.NewGuid(), Title = "T", Content = "C" });
            _mockVoteRepo.Setup(r => r.GetAllAsync(false)).ReturnsAsync(new List<Vote> { new Vote { QuestionId = qId, UserId = voterId, Type = VoteType.Upvote } });

            var repRepo = new Mock<IReputationRepository>();
            _mockUow.Setup(u => u.Reputations).Returns(repRepo.Object);

            var req = new CreateVoteDto { UserId = voterId, Type = VoteType.Upvote };

            // Act
            var result = await _questionService.VoteQuestionAsync(qId, req);

            // Assert
            Assert.True(result.Success);
            Assert.Contains("removed", result.Message!);
        }

        [Fact]
        public async Task PostAnswerAsync_ShouldReturnSuccess_WhenQuestionExists()
        {
            // Arrange
            var qId = Guid.NewGuid();
            _mockQuestionRepo.Setup(r => r.GetByIdAsync(qId, false)).ReturnsAsync(new Question { Id = qId, Title = "T", Content = "C" });
            
            var ansRepo = new Mock<IAnswerRepository>();
            _mockUow.Setup(u => u.Answers).Returns(ansRepo.Object);

            var req = new CreateAnswerDto { Content = "I know!" };
            var ansEntity = new Answer { Id = Guid.NewGuid(), QuestionId = qId, Content = "I know!" };
            _mockMapper.Setup(m => m.Map<Answer>(req)).Returns(ansEntity);

            // Act
            var result = await _questionService.PostAnswerAsync(qId, req);

            // Assert
            Assert.True(result.Success);
            ansRepo.Verify(r => r.CreateAsync(ansEntity), Times.Once);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNotFound_WhenQuestionDoesNotExist()
        {
            // Arrange
            _mockQuestionRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), false)).ReturnsAsync((Question?)null);

            // Act
            var result = await _questionService.GetByIdAsync(Guid.NewGuid());

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Question not found.", result.Message);
        }
    }
}
