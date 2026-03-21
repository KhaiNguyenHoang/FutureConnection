using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.SocialService.Application;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FutureConnection.Tests.SocialTests
{
    public class SocialServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IPostRepository> _mockPostRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IMediaService> _mockMediaService;
        private readonly SocialApplicationService _socialService;

        public SocialServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockPostRepo = new Mock<IPostRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockMediaService = new Mock<IMediaService>();

            _mockUow.Setup(u => u.Posts).Returns(_mockPostRepo.Object);

            _socialService = new SocialApplicationService(_mockUow.Object, _mockMapper.Object, _mockMediaService.Object);
        }

        [Fact]
        public async Task CreatePostAsync_ShouldReturnSuccess_WhenValid()
        {
            // Arrange
            var req = new CreatePostDto { UserId = Guid.NewGuid(), Title = "Title", Content = "Hello" };
            var postEntity = new Post { Id = Guid.NewGuid(), Title = "Title", Content = "Hello" };
            
            _mockMapper.Setup(m => m.Map<Post>(req)).Returns(postEntity);
            _mockMapper.Setup(m => m.Map<PostDto>(postEntity)).Returns(new PostDto { Title = "Title", Content = "Hello" });

            // Act
            var result = await _socialService.CreatePostAsync(req.UserId, req, null);

            // Assert
            Assert.True(result.Success);
            _mockPostRepo.Verify(r => r.CreateAsync(postEntity), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }

        [Fact]
        public async Task GetFeedAsync_ShouldReturnPosts_ForUserAndConnections()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var posts = new List<Post> { new Post { UserId = userId, Title = "A", Content = "B" } };

            _mockPostRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(posts);
            _mockMapper.Setup(m => m.Map<IEnumerable<PostDto>>(It.IsAny<IEnumerable<Post>>()))
                       .Returns(new List<PostDto> { new PostDto { Title = "A", Content = "B" } });
            
            // Note: SocialService.GetFeedAsync actually pulls connections as well. 
            // Mocking IConnectionRepository to empty just returns the user's posts.
            var mockConnRepo = new Mock<IConnectionRepository>();
            mockConnRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Connection>());
            _mockUow.Setup(u => u.Connections).Returns(mockConnRepo.Object);

            // Act
            var result = await _socialService.GetFeedAsync(userId, new PagedRequest());

            // Assert
            Assert.True(result.Success);
            Assert.Single(result.Data!);
        }
        [Fact]
        public async Task CommentAsync_ShouldReturnSuccess_WhenPostExists()
        {
            // Arrange
            var postId = Guid.NewGuid();
            _mockPostRepo.Setup(r => r.GetByIdAsync(postId)).ReturnsAsync(new Post { Id = postId, Title = "T", Content = "C" });
            
            var commRepo = new Mock<ICommentRepository>();
            _mockUow.Setup(u => u.Comments).Returns(commRepo.Object);

            var req = new CreateCommentDto { UserId = Guid.NewGuid(), Content = "Nice!" };
            var commentEntity = new Comment { Content = "Nice!" };
            _mockMapper.Setup(m => m.Map<Comment>(It.IsAny<CreateCommentDto>())).Returns(commentEntity);
            _mockMapper.Setup(m => m.Map<CommentDto>(It.IsAny<Comment>())).Returns(new CommentDto { Content = "Nice!" });

            // Act
            var result = await _socialService.CommentAsync(req.UserId, postId, req, null);

            // Assert
            Assert.True(result.Success);
            commRepo.Verify(r => r.CreateAsync(It.IsAny<Comment>()), Times.Once);
        }

        [Fact]
        public async Task ReactAsync_ShouldToggleReaction()
        {
            // Arrange
            var postId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            _mockPostRepo.Setup(r => r.GetByIdAsync(postId)).ReturnsAsync(new Post { Id = postId, Title = "T", Content = "C" });

            var reactRepo = new Mock<IReactionRepository>();
            var existingReaction = new Reaction { PostId = postId, UserId = userId, Type = ReactionType.Like };
            reactRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Reaction> { existingReaction });
            _mockUow.Setup(u => u.Reactions).Returns(reactRepo.Object);

            var req = new CreateReactionDto { UserId = userId, Type = ReactionType.Like };

            // Act - Reacting again should toggle (remove)
            var result = await _socialService.ReactAsync(req.UserId, postId, req);

            // Assert
            Assert.True(result.Success);
            Assert.Contains("removed", result.Message!);
            reactRepo.Verify(r => r.HardDelete(existingReaction), Times.Once);
        }

        [Fact]
        public async Task RequestConnectionAsync_ShouldFail_WhenSelfConnecting()
        {
            // Arrange
            var userId = Guid.NewGuid();

            // Act
            var result = await _socialService.RequestConnectionAsync(userId, userId);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("cannot connect with yourself", result.Message!);
        }
    }
}
