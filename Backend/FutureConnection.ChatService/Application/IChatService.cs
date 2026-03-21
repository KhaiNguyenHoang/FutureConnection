using FutureConnection.Core.DTOs;

namespace FutureConnection.ChatService.Application
{
    public interface IChatService
    {
        Task<Response<IEnumerable<ChannelDto>>> GetChannelsAsync(Guid userId);
        Task<Response<ChannelDto>> CreateChannelAsync(CreateChannelDto dto);
        Task<Response<IEnumerable<MessageDto>>> GetMessagesAsync(Guid channelId, int page, int pageSize);
        Task<Response<MessageDto>> SendMessageAsync(Guid channelId, CreateMessageDto dto);

        Task<Response<IEnumerable<GroupDto>>> GetGroupsAsync();
        Task<Response<GroupDto>> GetGroupByIdAsync(Guid groupId);
        Task<Response<GroupDto>> CreateGroupAsync(CreateGroupDto dto, Guid creatorId);
        Task<Response<string>> DeleteGroupAsync(Guid groupId, Guid requesterId);

        Task<Response<IEnumerable<GroupMemberDto>>> GetGroupMembersAsync(Guid groupId);
        Task<Response<GroupMemberDto>> AddGroupMemberAsync(Guid groupId, CreateGroupMemberDto dto);
        Task<Response<string>> RemoveGroupMemberAsync(Guid groupId, Guid requesterId, Guid memberId);

        Task<Response<IEnumerable<MessageDto>>> GetGroupMessagesAsync(Guid groupId, int page, int pageSize);
        Task<Response<MessageDto>> SendGroupMessageAsync(Guid groupId, CreateMessageDto dto);

        Task<Response<MessageDto>> UpdateMessageAsync(Guid messageId, Guid requesterId, UpdateMessageDto dto);
        Task<Response<string>> DeleteMessageAsync(Guid messageId, Guid requesterId);

        Task<Response<IEnumerable<ReactionDto>>> GetMessageReactionsAsync(Guid messageId);
        Task<Response<ReactionDto>> AddReactionAsync(Guid messageId, CreateReactionDto dto);
    }
}
