using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Infrastructure;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.ChatService.Application;
using FutureConnection.ChatService.Hubs;
using Microsoft.AspNetCore.SignalR;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FutureConnection.Tests.ChatTests
{
    public class ChatServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IChannelRepository> _mockChannelRepo;
        private readonly Mock<IMessageRepository> _mockMessageRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IEventPublisher> _mockEventPublisher;
        private readonly Mock<IHubContext<ChatHub>> _mockHubContext;
        private readonly Mock<IHubClients> _mockClients;
        private readonly Mock<IClientProxy> _mockClientProxy;
        private readonly ChatApplicationService _chatService;

        public ChatServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockChannelRepo = new Mock<IChannelRepository>();
            _mockMessageRepo = new Mock<IMessageRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockEventPublisher = new Mock<IEventPublisher>();
            _mockHubContext = new Mock<IHubContext<ChatHub>>();
            _mockClients = new Mock<IHubClients>();
            _mockClientProxy = new Mock<IClientProxy>();

            _mockClients.Setup(c => c.Group(It.IsAny<string>())).Returns(_mockClientProxy.Object);
            _mockClients.Setup(c => c.User(It.IsAny<string>())).Returns(_mockClientProxy.Object);
            _mockHubContext.Setup(h => h.Clients).Returns(_mockClients.Object);

            _mockUow.Setup(u => u.Channels).Returns(_mockChannelRepo.Object);
            _mockUow.Setup(u => u.Messages).Returns(_mockMessageRepo.Object);

            _chatService = new ChatApplicationService(_mockUow.Object, _mockMapper.Object, _mockEventPublisher.Object, _mockHubContext.Object);
        }

        [Fact]
        public async Task SendMessageAsync_ShouldFail_WhenChannelNotFound()
        {
            // Arrange
            _mockChannelRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), false)).ReturnsAsync((Channel?)null);
            var req = new CreateMessageDto { Content = "Hello" };

            // Act
            var result = await _chatService.SendMessageAsync(Guid.NewGuid(), req);

            // Assert
            Assert.False(result.Success);
            _mockMessageRepo.Verify(r => r.CreateAsync(It.IsAny<Message>()), Times.Never);
        }

        [Fact]
        public async Task SendMessageAsync_ShouldSucceed_AndPublishEvent_WhenValid()
        {
            // Arrange
            var channelId = Guid.NewGuid();
            _mockChannelRepo.Setup(r => r.GetByIdAsync(channelId, false)).ReturnsAsync(new Channel { Id = channelId, Name = "Chan" });

            var req = new CreateMessageDto { Content = "Hello" };
            var msgEntity = new Message { Id = Guid.NewGuid(), ChannelId = channelId, Content = "Hello" };
            
            _mockMapper.Setup(m => m.Map<Message>(req)).Returns(msgEntity);
            _mockMapper.Setup(m => m.Map<MessageDto>(msgEntity)).Returns(new MessageDto { Content = "Hello" });

            // Act
            var result = await _chatService.SendMessageAsync(channelId, req);

            // Assert
            Assert.True(result.Success);
            _mockMessageRepo.Verify(r => r.CreateAsync(msgEntity), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);

            // Verify Kafka Event Output
            _mockEventPublisher.Verify(p => p.PublishAsync("chat.events", It.IsNotNull<object>()), Times.Once);

            // Verify SignalR Broadcast
            _mockClientProxy.Verify(c => c.SendCoreAsync("ReceiveMessage", It.IsNotNull<object[]>(), default), Times.AtLeastOnce);
        }
        [Fact]
        public async Task GetMessagesAsync_ShouldReturnList()
        {
            // Arrange
            var channelId = Guid.NewGuid();
            var messages = new List<Message> { new Message { ChannelId = channelId, Content = "M1" } };
            _mockMessageRepo.Setup(r => r.GetAllAsync(false)).ReturnsAsync(messages);
            _mockMapper.Setup(m => m.Map<IEnumerable<MessageDto>>(It.IsAny<IEnumerable<Message>>())).Returns(new List<MessageDto> { new MessageDto { Content = "M1" } });

            // Act
            var result = await _chatService.GetMessagesAsync(channelId, 1, 10);

            // Assert
            Assert.True(result.Success);
            Assert.Single(result.Data!);
        }

        [Fact]
        public async Task CreateGroupAsync_ShouldReturnSuccess()
        {
            // Arrange
            var req = new CreateGroupDto { Name = "G1", Description = "D1" };
            var groupRepo = new Mock<IGroupRepository>();
            _mockUow.Setup(u => u.Groups).Returns(groupRepo.Object);
            _mockMapper.Setup(m => m.Map<Group>(req)).Returns(new Group { Id = Guid.NewGuid(), Name = "G1" });
            _mockMapper.Setup(m => m.Map<GroupDto>(It.IsAny<Group>())).Returns(new GroupDto { Name = "G1" });

            var groupMemberRepo = new Mock<IGroupMemberRepository>();
            groupMemberRepo.Setup(r => r.CreateAsync(It.IsAny<GroupMember>())).ReturnsAsync(new GroupMember());
            _mockUow.Setup(u => u.GroupMembers).Returns(groupMemberRepo.Object);
            var creatorId = Guid.NewGuid();

            // Act
            var result = await _chatService.CreateGroupAsync(req, creatorId);

            // Assert
            Assert.True(result.Success);
            groupRepo.Verify(r => r.CreateAsync(It.IsAny<Group>()), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.AtLeastOnce);
        }

        [Fact]
        public async Task DeleteMessageAsync_ShouldReturnSuccess()
        {
            // Arrange
            var requesterId = Guid.NewGuid();
            var messageId = Guid.NewGuid();
            var message = new Message { Id = messageId, Content = "hi", SenderId = requesterId };
            _mockMessageRepo.Setup(r => r.GetByIdAsync(messageId, false)).ReturnsAsync(message);
            _mockMessageRepo.Setup(r => r.SoftDeleteAsync(messageId)).Returns(Task.CompletedTask);

            // Act
            var result = await _chatService.DeleteMessageAsync(messageId, requesterId);

            // Assert
            Assert.True(result.Success);
            _mockMessageRepo.Verify(r => r.SoftDeleteAsync(messageId), Times.Once);
            _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
        }
    }
}
