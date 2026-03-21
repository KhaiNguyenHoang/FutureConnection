using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.ChatService.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FutureConnection.ChatService.Application
{
    public class ChatApplicationService(IUnitOfWork uow, IMapper mapper, FutureConnection.Core.Interfaces.Infrastructure.IEventPublisher eventPublisher, IHubContext<ChatHub> hubContext) : IChatService
    {
        public async Task<Response<IEnumerable<ChannelDto>>> GetChannelsAsync(Guid userId)
        {
            var channels = await uow.Channels.GetAllAsync();
            var userGroups = (await uow.GroupMembers.GetAllAsync())
                .Where(gm => gm.UserId == userId)
                .Select(gm => gm.GroupId)
                .ToHashSet();

            var accessible = channels.Where(c => userGroups.Contains(c.GroupId));
            return new Response<IEnumerable<ChannelDto>> { Success = true, Data = mapper.Map<IEnumerable<ChannelDto>>(accessible) };
        }

        public async Task<Response<ChannelDto>> CreateChannelAsync(CreateChannelDto dto)
        {
            var group = await uow.Groups.GetByIdAsync(dto.GroupId);
            if (group == null) return new Response<ChannelDto> { Success = false, Message = "Group not found." };

            var channel = mapper.Map<Channel>(dto);
            await uow.Channels.CreateAsync(channel);
            await uow.CompleteAsync();
            return new Response<ChannelDto> { Success = true, Data = mapper.Map<ChannelDto>(channel), Message = "Channel created." };
        }

        public async Task<Response<IEnumerable<MessageDto>>> GetMessagesAsync(Guid channelId, int page, int pageSize)
        {
            var messages = await uow.Messages.GetAllAsync();
            var channelMessages = messages
                .Where(m => m.ChannelId == channelId)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            return new Response<IEnumerable<MessageDto>> { Success = true, Data = mapper.Map<IEnumerable<MessageDto>>(channelMessages) };
        }

        public async Task<Response<MessageDto>> SendMessageAsync(Guid channelId, CreateMessageDto dto)
        {
            var channel = await uow.Channels.GetByIdAsync(channelId);
            if (channel == null) return new Response<MessageDto> { Success = false, Message = "Channel not found." };

            dto.ChannelId = channelId;
            var message = mapper.Map<Message>(dto);
            await uow.Messages.CreateAsync(message);
            await uow.CompleteAsync();

            await eventPublisher.PublishAsync("chat.events", new
            {
                EventType = "MessageSent",
                MessageId = message.Id,
                SenderId = message.SenderId,
                ChannelId = message.ChannelId,
                GroupId = message.GroupId,
                Timestamp = DateTime.UtcNow
            });

            var messageDto = mapper.Map<MessageDto>(message);
            await hubContext.Clients.Group(channelId.ToString()).SendAsync("ReceiveMessage", messageDto);

            if (message.ReceiverId.HasValue)
            {
                await hubContext.Clients.User(message.ReceiverId.Value.ToString()).SendAsync("ReceiveMessage", messageDto);
                if (message.SenderId != message.ReceiverId.Value)
                {
                    await hubContext.Clients.User(message.SenderId.ToString()).SendAsync("ReceiveMessage", messageDto);
                }
            }

            return new Response<MessageDto> { Success = true, Data = messageDto, Message = "Message sent." };
        }

        public async Task<Response<IEnumerable<GroupDto>>> GetGroupsAsync()
        {
            var groups = await uow.Groups.GetAllAsync();
            return new Response<IEnumerable<GroupDto>> { Success = true, Data = mapper.Map<IEnumerable<GroupDto>>(groups) };
        }

        public async Task<Response<GroupDto>> CreateGroupAsync(CreateGroupDto dto, Guid creatorId)
        {
            var group = mapper.Map<Group>(dto);
            await uow.Groups.CreateAsync(group);

            // Add creator as Admin
            await uow.GroupMembers.CreateAsync(new GroupMember
            {
                GroupId = group.Id,
                UserId = creatorId,
                Role = GroupRole.Admin
            });

            await uow.CompleteAsync();
            return new Response<GroupDto> { Success = true, Data = mapper.Map<GroupDto>(group) };
        }

        public async Task<Response<GroupDto>> GetGroupByIdAsync(Guid groupId)
        {
            var group = await uow.Groups.GetByIdAsync(groupId);
            if (group == null) return new Response<GroupDto> { Success = false, Message = "Group not found." };
            return new Response<GroupDto> { Success = true, Data = mapper.Map<GroupDto>(group) };
        }

        public async Task<Response<string>> DeleteGroupAsync(Guid groupId, Guid requesterId)
        {
            var group = await uow.Groups.GetByIdAsync(groupId);
            if (group == null) return new Response<string> { Success = false, Message = "Group not found." };

            var members = await uow.GroupMembers.GetAllAsync();
            var requesterMember = members.FirstOrDefault(m => m.GroupId == groupId && m.UserId == requesterId);
            if (requesterMember == null || requesterMember.Role != GroupRole.Admin)
                return new Response<string> { Success = false, Message = "Only group admins can delete the group." };

            await uow.Groups.SoftDeleteAsync(groupId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Group deleted." };
        }

        public async Task<Response<IEnumerable<GroupMemberDto>>> GetGroupMembersAsync(Guid groupId)
        {
            var members = await uow.GroupMembers.GetAllAsync();
            return new Response<IEnumerable<GroupMemberDto>> { Success = true, Data = mapper.Map<IEnumerable<GroupMemberDto>>(members.Where(m => m.GroupId == groupId)) };
        }

        public async Task<Response<GroupMemberDto>> AddGroupMemberAsync(Guid groupId, CreateGroupMemberDto dto)
        {
            var group = await uow.Groups.GetByIdAsync(groupId);
            if (group == null) return new Response<GroupMemberDto> { Success = false, Message = "Group not found." };

            var existing = await uow.GroupMembers.GetAllAsync();
            if (existing.Any(m => m.GroupId == groupId && m.UserId == dto.UserId))
                return new Response<GroupMemberDto> { Success = false, Message = "User is already a member of this group." };

            var member = mapper.Map<GroupMember>(dto);
            member.GroupId = groupId;
            await uow.GroupMembers.CreateAsync(member);
            await uow.CompleteAsync();
            return new Response<GroupMemberDto> { Success = true, Data = mapper.Map<GroupMemberDto>(member) };
        }

        public async Task<Response<IEnumerable<ReactionDto>>> GetMessageReactionsAsync(Guid messageId)
        {
            var reactions = await uow.Reactions.GetAllAsync();
            return new Response<IEnumerable<ReactionDto>> { Success = true, Data = mapper.Map<IEnumerable<ReactionDto>>(reactions.Where(r => r.MessageId == messageId)) };
        }

        public async Task<Response<ReactionDto>> AddReactionAsync(Guid messageId, CreateReactionDto dto)
        {
            var message = await uow.Messages.GetByIdAsync(messageId);
            if (message == null) return new Response<ReactionDto> { Success = false, Message = "Message not found." };

            // Toggle: remove if same reaction from same user already exists
            var all = await uow.Reactions.GetAllAsync();
            var existing = all.FirstOrDefault(r => r.MessageId == messageId && r.UserId == dto.UserId && r.Type == dto.Type);
            if (existing != null)
            {
                uow.Reactions.HardDelete(existing);
                await uow.CompleteAsync();
                return new Response<ReactionDto> { Success = true, Message = $"{dto.Type} removed." };
            }

            var reaction = mapper.Map<Reaction>(dto);
            reaction.MessageId = messageId;
            await uow.Reactions.CreateAsync(reaction);
            await uow.CompleteAsync();
            return new Response<ReactionDto> { Success = true, Data = mapper.Map<ReactionDto>(reaction) };
        }

        public async Task<Response<string>> RemoveGroupMemberAsync(Guid groupId, Guid requesterId, Guid memberId)
        {
            var all = await uow.GroupMembers.GetAllAsync();

            // Requester must be Admin or removing themselves
            var requesterMember = all.FirstOrDefault(m => m.GroupId == groupId && m.UserId == requesterId);
            if (requesterMember == null)
                return new Response<string> { Success = false, Message = "You are not a member of this group." };
            if (requesterId != memberId && requesterMember.Role != GroupRole.Admin)
                return new Response<string> { Success = false, Message = "Only group admins can remove other members." };

            var member = all.FirstOrDefault(m => m.GroupId == groupId && m.UserId == memberId);
            if (member != null)
            {
                uow.GroupMembers.HardDelete(member);
                await uow.CompleteAsync();
            }
            return new Response<string> { Success = true, Message = "Member removed from group." };
        }

        public async Task<Response<IEnumerable<MessageDto>>> GetGroupMessagesAsync(Guid groupId, int page, int pageSize)
        {
            var messages = await uow.Messages.GetAllAsync();
            var groupMessages = messages
                .Where(m => m.GroupId == groupId)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            return new Response<IEnumerable<MessageDto>> { Success = true, Data = mapper.Map<IEnumerable<MessageDto>>(groupMessages) };
        }

        public async Task<Response<MessageDto>> SendGroupMessageAsync(Guid groupId, CreateMessageDto dto)
        {
            var group = await uow.Groups.GetByIdAsync(groupId);
            if (group == null) return new Response<MessageDto> { Success = false, Message = "Group not found." };

            // Sender must be a group member
            var members = await uow.GroupMembers.GetAllAsync();
            if (!members.Any(m => m.GroupId == groupId && m.UserId == dto.SenderId))
                return new Response<MessageDto> { Success = false, Message = "You are not a member of this group." };

            var message = mapper.Map<Message>(dto);
            message.GroupId = groupId;
            await uow.Messages.CreateAsync(message);
            await uow.CompleteAsync();

            await eventPublisher.PublishAsync("chat.events", new
            {
                EventType = "MessageSent",
                MessageId = message.Id,
                SenderId = message.SenderId,
                ChannelId = message.ChannelId,
                GroupId = message.GroupId,
                Timestamp = DateTime.UtcNow
            });

            var messageDto = mapper.Map<MessageDto>(message);
            await hubContext.Clients.Group(groupId.ToString()).SendAsync("ReceiveMessage", messageDto);

            return new Response<MessageDto> { Success = true, Data = messageDto, Message = "Message sent." };
        }

        public async Task<Response<MessageDto>> UpdateMessageAsync(Guid messageId, Guid requesterId, UpdateMessageDto dto)
        {
            var msg = await uow.Messages.GetByIdAsync(messageId);
            if (msg == null) return new Response<MessageDto> { Success = false, Message = "Message not found." };
            if (msg.SenderId != requesterId) return new Response<MessageDto> { Success = false, Message = "You can only edit your own messages." };

            if (!string.IsNullOrEmpty(dto.Content)) msg.Content = dto.Content;
            uow.Messages.Update(msg);
            await uow.CompleteAsync();

            return new Response<MessageDto> { Success = true, Data = mapper.Map<MessageDto>(msg) };
        }

        public async Task<Response<string>> DeleteMessageAsync(Guid messageId, Guid requesterId)
        {
            var msg = await uow.Messages.GetByIdAsync(messageId);
            if (msg == null) return new Response<string> { Success = false, Message = "Message not found." };
            if (msg.SenderId != requesterId) return new Response<string> { Success = false, Message = "You can only delete your own messages." };

            await uow.Messages.SoftDeleteAsync(messageId);
            await uow.CompleteAsync();
            return new Response<string> { Success = true, Message = "Message deleted." };
        }
    }
}
