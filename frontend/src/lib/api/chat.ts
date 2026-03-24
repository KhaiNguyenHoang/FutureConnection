import api from '../api';
import { 
  ChannelDto, 
  MessageDto, 
  GroupDto, 
  GroupMemberDto, 
  ReactionDto, 
  CreateChannelDto, 
  CreateMessageDto, 
  CreateGroupDto, 
  CreateGroupMemberDto, 
  CreateReactionDto,
  UpdateMessageDto,
  UpdateGroupDto
} from '@/types/chat';

export const ChatService = {
  // Channels
  getChannels: (userId: string) => 
    api.get<ChannelDto[]>(`/channels?userId=${userId}`),
  
  createChannel: (dto: CreateChannelDto) => 
    api.post<ChannelDto>('/channels', dto),
  
  getChannelMessages: (channelId: string, page = 1, pageSize = 50) => 
    api.get<MessageDto[]>(`/channels/${channelId}/messages?page=${page}\u0026pageSize=${pageSize}`),
  
  sendChannelMessage: (channelId: string, dto: CreateMessageDto) => 
    api.post<MessageDto>(`/channels/${channelId}/messages`, dto),

  // Groups
  getGroups: () => 
    api.get<GroupDto[]>('/groups'),
  
  createGroup: (dto: CreateGroupDto) => 
    api.post<GroupDto>('/groups', dto),

  updateGroup: (groupId: string, dto: UpdateGroupDto) =>
    api.put<GroupDto>(`/groups/${groupId}`, dto),
  
  getGroupMembers: (groupId: string) => 
    api.get<GroupMemberDto[]>(`/groups/${groupId}/members`),
  
  addGroupMember: (groupId: string, dto: CreateGroupMemberDto) => 
    api.post<GroupMemberDto>(`/groups/${groupId}/members`, dto),
  
  removeGroupMember: (groupId: string, memberId: string) => 
    api.delete(`/groups/${groupId}/members/${memberId}`),
  
  getGroupMessages: (groupId: string, page = 1, pageSize = 50) => 
    api.get<MessageDto[]>(`/groups/${groupId}/messages?page=${page}\u0026pageSize=${pageSize}`),
  
  sendGroupMessage: (groupId: string, dto: CreateMessageDto) => 
    api.post<MessageDto>(`/groups/${groupId}/messages`, dto),
  
  deleteGroup: (groupId: string) => 
    api.delete(`/groups/${groupId}`),

  // Messages
  getMessageReactions: (messageId: string) => 
    api.get<ReactionDto[]>(`/messages/${messageId}/reactions`),
  
  addReaction: (messageId: string, dto: CreateReactionDto) => 
    api.post<ReactionDto>(`/messages/${messageId}/reactions`, dto),
  
  updateMessage: (messageId: string, dto: UpdateMessageDto) => 
    api.put<MessageDto>(`/messages/${messageId}`, dto),
  
  deleteMessage: (messageId: string) => 
    api.delete(`/messages/${messageId}`),
};
