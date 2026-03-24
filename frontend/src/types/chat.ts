export interface ChannelDto {
  id: string;
  name: string;
  description?: string;
  groupId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderFirstName?: string;
  senderLastName?: string;
  senderAvatarUrl?: string;
  receiverId?: string;
  channelId?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
  reactions: ReactionDto[];
}

export interface GroupDto {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  isActive: boolean;
  isPrivate: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMemberDto {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userFirstName?: string;
  userLastName?: string;
  userAvatarUrl?: string;
  role: number; // 0: Member, 1: Moderator, 2: Admin
  joinedAt: string;
}

export interface ReactionDto {
  id: string;
  type: number; // Enum: Like, Love, Haha, Wow, Sad, Angry
  userId: string;
  userName: string;
}

export interface CreateChannelDto {
  name: string;
  description?: string;
  groupId: string;
}

export interface CreateMessageDto {
  content: string;
  receiverId?: string;
  channelId?: string;
  groupId?: string;
  senderId?: string; // Optional if handled by backend
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  avatarUrl?: string;
  isPrivate: boolean;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
  isPrivate: boolean;
}

export interface CreateGroupMemberDto {
  groupId: string;
  userId?: string;
  email?: string;
  role: number;
}

export interface CreateReactionDto {
  type: number;
  userId?: string;
}

export interface UpdateMessageDto {
  content: string;
}
