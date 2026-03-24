import { create } from 'zustand';
import { ChannelDto, MessageDto, GroupDto, GroupMemberDto } from '@/types/chat';
import { ChatService } from '@/lib/api/chat';
import { signalRService } from '@/lib/signalr';
import { useAuthStore } from '@/store/authStore';

interface ChatState {
  channels: ChannelDto[];
  groups: GroupDto[];
  activeChannel: ChannelDto | null;
  activeGroup: GroupDto | null;
  messages: MessageDto[];
  members: GroupMemberDto[];
  isLoading: boolean;
  isSignalRConnected: boolean;
  isMemberView: boolean;

  // Actions
  fetchChannels: (userId: string) => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchMembers: (groupId: string) => Promise<void>;
  addMember: (groupId: string, identifier: string, role: number) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  setActiveChannel: (channel: ChannelDto | null) => void;
  setActiveGroup: (group: GroupDto | null) => void;
  fetchMessages: (id: string, isGroup: boolean) => Promise<void>;
  addMessage: (message: MessageDto) => void;
  sendMessage: (content: string) => Promise<void>;
  createChannel: (name: string, description: string, groupId: string) => Promise<void>;
  createGroup: (name: string, description: string, isPrivate: boolean) => Promise<void>;
  updateGroup: (groupId: string, name: string, description: string, isPrivate: boolean) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  updateMessage: (message: MessageDto) => void;
  removeMessage: (messageId: string) => void;
  setSignalRConnected: (connected: boolean) => void;
  setMemberView: (isView: boolean) => void;
  initSignalR: (userId: string) => void;
  stopSignalR: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  channels: [],
  groups: [],
  activeChannel: null,
  activeGroup: null,
  messages: [],
  members: [],
  isLoading: false,
  isSignalRConnected: false,
  isMemberView: false,

  fetchChannels: async (userId) => {
    set({ isLoading: true });
    try {
      const response = await ChatService.getChannels(userId) as any;
      if (response.data.success) {
        set({ channels: response.data.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const response = await ChatService.getGroups() as any;
      if (response.data.success) {
        set({ groups: response.data.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveChannel: (channel) => {
    set({ activeChannel: channel, activeGroup: null, messages: [], members: [], isMemberView: false });
    if (channel) get().fetchMessages(channel.id, false);
  },

  setActiveGroup: (group) => {
    set({ activeGroup: group, activeChannel: null, messages: [], members: [], isMemberView: false });
    if (group) {
      get().fetchMessages(group.id, true);
      get().fetchMembers(group.id);
    }
  },

  fetchMessages: async (id, isGroup) => {
    set({ isLoading: true });
    try {
      const response = (isGroup 
        ? await ChatService.getGroupMessages(id)
        : await ChatService.getChannelMessages(id)) as any;
      
      if (response.data.success) {
        set({ messages: response.data.data?.reverse() || [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addMessage: (message) => {
    const { activeChannel, activeGroup, messages } = get();
    // Only add if it belongs to current active view
    const isCurrentChannel = activeChannel && message.channelId === activeChannel.id;
    const isCurrentGroup = activeGroup && message.groupId === activeGroup.id;
    
    if (isCurrentChannel || isCurrentGroup || (message.receiverId && !message.channelId && !message.groupId)) {
        // Prevent duplicates
        if (!messages.find(m => m.id === message.id)) {
            set({ messages: [...messages, message] });
        }
    }
  },

  sendMessage: async (content) => {
    const { activeChannel, activeGroup } = get();
    if (!activeChannel && !activeGroup) return;

    const token = useAuthStore.getState().accessToken; // Added this line
    const dto = {
      content,
      channelId: activeChannel?.id,
      groupId: activeGroup?.id,
    };

    let response: any;
    if (activeChannel) {
      response = await ChatService.sendChannelMessage(activeChannel.id, dto);
    } else if (activeGroup) {
      response = await ChatService.sendGroupMessage(activeGroup.id, dto);
    }

    if (response?.data?.success) {
      get().addMessage(response.data.data);
    }
  },

  createChannel: async (name, description, groupId) => {
    set({ isLoading: true });
    try {
      const response = await ChatService.createChannel({ name, description, groupId }) as any;
      if (response.data.success) {
        set(state => ({ channels: [...state.channels, response.data.data] }));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createGroup: async (name, description, isPrivate) => {
    set({ isLoading: true });
    try {
      const response = await ChatService.createGroup({ name, description, isPrivate }) as any;
      if (response.data.success) {
        set(state => ({ groups: [...state.groups, response.data.data] }));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateGroup: async (groupId, name, description, isPrivate) => {
    set({ isLoading: true });
    try {
      const response = await ChatService.updateGroup(groupId, { name, description, isPrivate }) as any;
      if (response.data.success) {
        set(state => ({
          groups: state.groups.map(g => g.id === groupId ? response.data.data : g),
          activeGroup: state.activeGroup?.id === groupId ? response.data.data : state.activeGroup
        }));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGroup: async (groupId) => {
    set({ isLoading: true });
    try {
      const response = await ChatService.deleteGroup(groupId) as any;
      if (response.data.success) {
        set(state => ({
          groups: state.groups.filter(g => g.id !== groupId),
          activeGroup: state.activeGroup?.id === groupId ? null : state.activeGroup
        }));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMembers: async (groupId) => {
    try {
      const response = await ChatService.getGroupMembers(groupId) as any;
      if (response.data.success) {
        set({ members: response.data.data });
      }
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  },

  addMember: async (groupId, identifier, role) => {
    try {
      const isEmail = identifier.includes('@');
      const dto = {
        groupId,
        role,
        ...(isEmail ? { email: identifier } : { userId: identifier })
      };
      const response = await ChatService.addGroupMember(groupId, dto) as any;
      if (response.data.success) {
        set(state => ({ members: [...state.members, response.data.data] }));
      } else {
        throw new Error(response.data.message || "Failed to add member");
      }
    } catch (error: any) {
      console.error("Failed to add member", error);
      throw error;
    }
  },

  removeMember: async (groupId, memberId) => {
    try {
      const response = await ChatService.removeGroupMember(groupId, memberId) as any;
      if (response.data.success) {
        set(state => ({
          members: state.members.filter(m => m.id !== memberId)
        }));
      } else {
        // Assuming the user intended to add this logic here, but it was malformed.
        // This part of the change is syntactically incorrect as provided in the instruction.
        // To maintain syntactic correctness, I'm keeping the original else block.
        // If the intention was to throw an error on success, that would be unusual.
        throw new Error(response.data.message || "Failed to remove member");
      }
    } catch (error: any) {
      console.error("Failed to remove member", error);
      throw error;
    }
  },

  updateMessage: (message) => {
    set(state => ({
      messages: state.messages.map(m => m.id === message.id ? message : m)
    }));
  },

  removeMessage: (messageId) => {
    set(state => ({
      messages: state.messages.filter(m => m.id !== messageId)
    }));
  },

  setSignalRConnected: (connected) => set({ isSignalRConnected: connected }),
  setMemberView: (isView) => set({ isMemberView: isView }),

  initSignalR: (userId) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    signalRService.start(token).then(() => {
        signalRService.on('ReceiveMessage', (message: MessageDto) => {
            get().addMessage(message);
        });
        set({ isSignalRConnected: true });
    });
  },

  stopSignalR: () => {
    signalRService.stop();
    set({ isSignalRConnected: false });
  }
}));
