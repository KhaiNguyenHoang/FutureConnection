using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.ChatService.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

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
            var query = uow.Messages.Query()
                .Include(m => m.Sender)
                .Where(m => m.ChannelId == channelId)
                .OrderByDescending(m => m.CreatedAt);

            var channelMessages = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

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

            var messageWithSender = await uow.Messages.Query()
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.Id == message.Id);

            var messageDto = mapper.Map<MessageDto>(messageWithSender);

            if (message.ChannelId.HasValue)
            {
                await hubContext.Clients.Group(message.ChannelId.Value.ToString()).SendAsync("ReceiveMessage", messageDto);
            }
            else if (message.ReceiverId.HasValue)
            {
                await hubContext.Clients.User(message.ReceiverId.Value.ToString()).SendAsync("ReceiveMessage", messageDto);
                if (message.SenderId != message.ReceiverId.Value)
                {
                    await hubContext.Clients.User(message.SenderId.ToString()).SendAsync("ReceiveMessage", messageDto);
                }
            }

            return new Response<MessageDto> { Success = true, Data = messageDto, Message = "Message sent." };
        }

        public async Task<Response<IEnumerable<GroupDto>>> GetGroupsAsync(Guid userId)
        {
            var groups = await uow.Groups.Query()
                .Include(g => g.Members)
                .Where(g => !g.IsPrivate || g.Members.Any(m => m.UserId == userId))
                .ToListAsync();

            return new Response<IEnumerable<GroupDto>> { Success = true, Data = mapper.Map<IEnumerable<GroupDto>>(groups) };
        }

        public async Task<Response<GroupDto>> CreateGroupAsync(CreateGroupDto dto, Guid creatorId)
        {
            var group = mapper.Map<Group>(dto);
            group.IsPrivate = dto.IsPrivate;
            group.OwnerId = creatorId;
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

        public async Task<Response<GroupDto>> UpdateGroupAsync(Guid groupId, Guid requesterId, UpdateGroupDto dto)
        {
            var group = await uow.Groups.GetByIdAsync(groupId);
            if (group == null) return new Response<GroupDto> { Success = false, Message = "Group not found." };

            var members = await uow.GroupMembers.FindAsync(m => m.GroupId == groupId && m.UserId == requesterId);
            var requesterMember = members.FirstOrDefault();
            if (requesterMember == null || requesterMember.Role != GroupRole.Admin)
                return new Response<GroupDto> { Success = false, Message = "Only group admins can update group details." };

            if (!string.IsNullOrEmpty(dto.Name)) group.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Description)) group.Description = dto.Description;
            group.IsPrivate = dto.IsPrivate;

            uow.Groups.Update(group);
            await uow.CompleteAsync();

            return new Response<GroupDto> { Success = true, Data = mapper.Map<GroupDto>(group), Message = "Group updated successfully." };
        }

        public async Task<Response<bool>> DeleteGroupAsync(Guid groupId, Guid userId)
        {
            var group = await uow.Groups.GetByIdAsync(groupId);
            if (group == null) return new Response<bool> { Success = false, Message = "Group not found." };

            var members = await uow.GroupMembers.FindAsync(m => m.GroupId == groupId && m.UserId == userId);
            var member = members.FirstOrDefault();
            
            if (member == null || member.Role != GroupRole.Admin)
                return new Response<bool> { Success = false, Message = "Only admins can delete the group." };

            uow.Groups.HardDelete(group);
            await uow.CompleteAsync();

            return new Response<bool> { Success = true, Data = true };
        }

        public async Task<Response<IEnumerable<GroupMemberDto>>> GetGroupMembersAsync(Guid groupId)
        {
            var members = await uow.GroupMembers.Query()
                .Include(m => m.User)
                .Where(m => m.GroupId == groupId)
                .ToListAsync();
            return new Response<IEnumerable<GroupMemberDto>> { Success = true, Data = mapper.Map<IEnumerable<GroupMemberDto>>(members) };
        }

        public async Task<Response<GroupMemberDto>> AddGroupMemberAsync(Guid groupId, CreateGroupMemberDto dto)
        {
            var group = await uow.Groups.GetByIdAsync(groupId);
            if (group == null) return new Response<GroupMemberDto> { Success = false, Message = "Group not found." };

            Guid userId;
            if (dto.UserId.HasValue)
            {
                userId = dto.UserId.Value;
            }
            else if (!string.IsNullOrEmpty(dto.Email))
            {
                var user = await uow.Users.GetUserByEmail(dto.Email);
                if (user == null) return new Response<GroupMemberDto> { Success = false, Message = "User with this email not found." };
                userId = user.Id;
            }
            else
            {
                return new Response<GroupMemberDto> { Success = false, Message = "User ID or Email is required." };
            }

            var existing = await uow.GroupMembers.FindAsync(m => m.GroupId == groupId && m.UserId == userId);
            if (existing.Any())
                return new Response<GroupMemberDto> { Success = false, Message = "User is already a member of this group." };

            var member = new GroupMember
            {
                GroupId = groupId,
                UserId = userId,
                Role = dto.Role
            };
            
            await uow.GroupMembers.CreateAsync(member);
            await uow.CompleteAsync();

            // Fetch with user details for the response
            var memberWithUser = await uow.GroupMembers.Query()
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.Id == member.Id);

            return new Response<GroupMemberDto> { Success = true, Data = mapper.Map<GroupMemberDto>(memberWithUser) };
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
            var members = await uow.GroupMembers.FindAsync(m => m.GroupId == groupId);
            
            // Requester must be Admin or removing themselves
            var requesterMember = members.FirstOrDefault(m => m.UserId == requesterId);
            if (requesterMember == null)
                return new Response<string> { Success = false, Message = "You are not a member of this group." };
            if (requesterId != memberId && requesterMember.Role != GroupRole.Admin)
                return new Response<string> { Success = false, Message = "Only group admins can remove other members." };

            var member = members.FirstOrDefault(m => m.UserId == memberId);
            if (member != null)
            {
                uow.GroupMembers.HardDelete(member);
                await uow.CompleteAsync();
            }
            return new Response<string> { Success = true, Message = "Member removed from group." };
        }

        public async Task<Response<IEnumerable<MessageDto>>> GetGroupMessagesAsync(Guid groupId, int page, int pageSize)
        {
            var query = uow.Messages.Query()
                .Include(m => m.Sender)
                .Where(m => m.GroupId == groupId)
                .OrderByDescending(m => m.CreatedAt);

            var groupMessages = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

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

            var messageWithSender = await uow.Messages.Query()
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.Id == message.Id);

            var messageDto = mapper.Map<MessageDto>(messageWithSender);
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
