import api from '@/lib/api';
import { ApiResponse, Channel, Group, GroupMember, Message } from '@/types';

// Channels (DMs)
export const getChannels = () =>
  api.get<ApiResponse<Channel[]>>('/channels').then((r) => r.data);

export const getChannelMessages = (channelId: string) =>
  api.get<ApiResponse<Message[]>>(`/channels/${channelId}/messages`).then((r) => r.data);

export const sendChannelMessage = (channelId: string, content: string, mediaUrl?: string) =>
  api.post<ApiResponse<Message>>(`/channels/${channelId}/messages`, { content, mediaUrl }).then((r) => r.data);

// Groups
export const getGroups = () =>
  api.get<ApiResponse<Group[]>>('/groups').then((r) => r.data);

export const getGroup = (id: string) =>
  api.get<ApiResponse<Group>>(`/groups/${id}`).then((r) => r.data);

export const createGroup = (name: string, description?: string) =>
  api.post<ApiResponse<Group>>('/groups', { name, description }).then((r) => r.data);

export const getGroupMessages = (groupId: string) =>
  api.get<ApiResponse<Message[]>>(`/groups/${groupId}/messages`).then((r) => r.data);

export const sendGroupMessage = (groupId: string, content: string, mediaUrl?: string) =>
  api.post<ApiResponse<Message>>(`/groups/${groupId}/messages`, { content, mediaUrl }).then((r) => r.data);

export const getGroupMembers = (groupId: string) =>
  api.get<ApiResponse<GroupMember[]>>(`/groups/${groupId}/members`).then((r) => r.data);

export const addGroupMember = (groupId: string, userId: string) =>
  api.post<ApiResponse<GroupMember>>(`/groups/${groupId}/members`, { userId }).then((r) => r.data);

export const removeGroupMember = (groupId: string, memberId: string) =>
  api.delete<ApiResponse>(`/groups/${groupId}/members/${memberId}`).then((r) => r.data);

export const addMessageReaction = (messageId: string, reactionType: string) =>
  api.post<ApiResponse>(`/messages/${messageId}/reactions`, { reactionType }).then((r) => r.data);

export const createChannel = (userId: string) =>
  api.post<ApiResponse<Channel>>('/channels', { userId }).then((r) => r.data);
