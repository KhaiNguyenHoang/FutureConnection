'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import {
  getChannels,
  getChannelMessages,
  sendChannelMessage,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  createChannel,
} from '@/api/chatService';
import { getAllUsers } from '@/api/authService';
import { useAuthStore } from '@/store/authStore';
import { getDisplayName, getInitials, formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Send, Loader2, Users, Plus, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { HUB_URL } from '@/constants';
import type { Channel, Group, Message, User } from '@/types';

// A conversation is either a DM channel or a group chat
type ActiveConversation =
  | { kind: 'channel'; channel: Channel }
  | { kind: 'group'; group: Group };

export default function MessagesPage() {
  const { user, token } = useAuthStore();
  const [active, setActive] = useState<ActiveConversation | null>(null);
  const [message, setMessage] = useState('');
  const [showNewDm, setShowNewDm] = useState(false);
  const [dmSearch, setDmSearch] = useState('');
  const [creatingDm, setCreatingDm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<signalR.HubConnection | null>(null);
  const qc = useQueryClient();

  const activeId = active?.kind === 'channel' ? active.channel.id : active?.kind === 'group' ? active.group.id : null;

  const { data: channelsData } = useQuery({ queryKey: ['channels'], queryFn: getChannels });
  const { data: groupsData } = useQuery({ queryKey: ['groups'], queryFn: getGroups });
  const { data: allUsersData } = useQuery({
    queryKey: ['all-users'],
    queryFn: getAllUsers,
    enabled: showNewDm,
  });

  // Fetch messages based on conversation kind
  const activeChannelId = active?.kind === 'channel' ? active.channel.id : null;
  const activeGroupId = active?.kind === 'group' ? active.group.id : null;

  const { data: channelMessagesData, isLoading: loadingChannelMessages } = useQuery({
    queryKey: ['channel-messages', activeId],
    queryFn: () => getChannelMessages(activeChannelId!),
    enabled: !!activeChannelId,
  });

  const { data: groupMessagesData, isLoading: loadingGroupMessages } = useQuery({
    queryKey: ['group-messages', activeId],
    queryFn: () => getGroupMessages(activeGroupId!),
    enabled: !!activeGroupId,
  });

  const loadingMessages = loadingChannelMessages || loadingGroupMessages;
  const messages: Message[] =
    active?.kind === 'channel'
      ? channelMessagesData?.data ?? []
      : active?.kind === 'group'
      ? groupMessagesData?.data ?? []
      : [];

  // Send mutation — delegates to correct API based on conversation kind
  const { mutate: send, isPending } = useMutation({
    mutationFn: () => {
      if (active?.kind === 'channel') return sendChannelMessage(active.channel.id, message);
      if (active?.kind === 'group') return sendGroupMessage(active.group.id, message);
      return Promise.reject(new Error('No active conversation'));
    },
    onSuccess: () => {
      setMessage('');
    },
    onError: () => toast.error('Failed to send message'),
  });

  // SignalR connection
  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}/hubs/chat`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (msg: Message) => {
      // Will be overwritten by the active-conversation-aware handler below
    });

    connection.start().catch((err) => console.warn('SignalR connect failed', err));
    hubRef.current = connection;

    return () => {
      connection.stop();
      hubRef.current = null;
    };
    // intentionally not re-running on active change — handled separately below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update ReceiveMessage handler and join/leave hub group whenever the active conversation changes
  useEffect(() => {
    const hub = hubRef.current;
    if (!hub) return;

    hub.off('ReceiveMessage');
    hub.on('ReceiveMessage', (msg: Message) => {
      if (active?.kind === 'channel') {
        qc.setQueryData<{ data: Message[] }>(['channel-messages', active.channel.id], (old) => {
          if (!old) return old;
          if (old.data.some((m) => m.id === msg.id)) return old;
          return { ...old, data: [...old.data, msg] };
        });
        qc.invalidateQueries({ queryKey: ['channels'] });
      } else if (active?.kind === 'group') {
        qc.setQueryData<{ data: Message[] }>(['group-messages', active.group.id], (old) => {
          if (!old) return old;
          if (old.data.some((m) => m.id === msg.id)) return old;
          return { ...old, data: [...old.data, msg] };
        });
        qc.invalidateQueries({ queryKey: ['groups'] });
      }
    });

    if (hub.state === signalR.HubConnectionState.Connected && activeId) {
      hub.invoke('JoinGroupAsync', activeId).catch(() => {});
      return () => {
        hub.invoke('LeaveGroupAsync', activeId).catch(() => {});
      };
    }
  }, [active, activeId, qc]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const channels = channelsData?.data ?? [];
  const groups = groupsData?.data ?? [];

  // Users available for a new DM (exclude self and those with existing channels)
  const existingDmUserIds = new Set(channels.flatMap((ch) => [ch.user1Id, ch.user2Id]));
  const allUsers: User[] = allUsersData?.data ?? [];
  const dmCandidates = allUsers.filter(
    (u) => u.id !== user?.id && dmSearch
      ? getDisplayName(u).toLowerCase().includes(dmSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(dmSearch.toLowerCase())
      : u.id !== user?.id
  );

  const handleStartDm = async (targetUser: User) => {
    setCreatingDm(true);
    try {
      const result = await createChannel(targetUser.id);
      const newChannel = result.data;
      if (newChannel) {
        await qc.invalidateQueries({ queryKey: ['channels'] });
        setActive({ kind: 'channel', channel: newChannel });
      }
      setShowNewDm(false);
      setDmSearch('');
    } catch {
      toast.error('Failed to start conversation');
    } finally {
      setCreatingDm(false);
    }
  };

  // Derive display info for the active conversation header
  const headerName =
    active?.kind === 'channel'
      ? active.channel.otherUser
        ? getDisplayName(active.channel.otherUser)
        : 'Unknown'
      : active?.kind === 'group'
      ? active.group.name
      : '';

  const headerAvatar =
    active?.kind === 'channel' ? (
      active.channel.otherUser?.avatarUrl ? (
        <img src={active.channel.otherUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="text-xs font-bold">
          {getInitials(active.channel.otherUser?.firstName, active.channel.otherUser?.lastName, active.channel.otherUser?.email)}
        </span>
      )
    ) : active?.kind === 'group' ? (
      active.group.avatarUrl ? (
        <img src={active.group.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <Users className="w-4 h-4" />
      )
    ) : null;

  const headerBg =
    active?.kind === 'group'
      ? 'bg-purple-100 dark:bg-purple-900 text-purple-600'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-600';

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">Messages</h2>
          <button
            onClick={() => setShowNewDm(true)}
            title="New Message"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-blue-600"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* DMs */}
          {channels.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Messages</p>
              {channels.map((ch) => {
                const other = ch.otherUser;
                const name = other ? getDisplayName(other) : 'Unknown';
                const initials = other ? getInitials(other.firstName, other.lastName, other.email) : 'FC';
                const isActive = active?.kind === 'channel' && active.channel.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActive({ kind: 'channel', channel: ch })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                      {other?.avatarUrl ? <img src={other.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{name}</p>
                      {ch.lastMessage && <p className="text-xs text-slate-400 truncate">{ch.lastMessage.content}</p>}
                    </div>
                    {ch.unreadCount ? <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{ch.unreadCount}</span> : null}
                  </button>
                );
              })}
            </div>
          )}

          {/* Groups */}
          {groups.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Groups</p>
              {groups.map((group) => {
                const isActive = active?.kind === 'group' && active.group.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setActive({ kind: 'group', group })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${isActive ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 shrink-0">
                      {group.avatarUrl ? <img src={group.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>{group.name}</p>
                      {group.lastMessage ? (
                        <p className="text-xs text-slate-400 truncate">{group.lastMessage.content}</p>
                      ) : group.memberCount ? (
                        <p className="text-xs text-slate-400">{group.memberCount} members</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {channels.length === 0 && groups.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {active ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${headerBg}`}>
                {headerAvatar}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{headerName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(msg.sender?.firstName, msg.sender?.lastName, msg.sender?.email)}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : ''} flex flex-col gap-1`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-slate-400">{formatRelativeTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-400 text-sm py-8">No messages yet. Say hi!</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) send(); }} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isPending}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-medium">Select a conversation</p>
              <p className="text-slate-400 text-sm">Choose from your messages on the left, or start a new one</p>
              <button
                onClick={() => setShowNewDm(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Message
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New DM modal */}
      {showNewDm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[70vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">New Message</h3>
              <button
                onClick={() => { setShowNewDm(false); setDmSearch(''); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={dmSearch}
                  onChange={(e) => setDmSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="flex-1 bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto p-2">
              {!allUsersData ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>
              ) : dmCandidates.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">No users found</p>
              ) : (
                dmCandidates.map((u) => {
                  const name = getDisplayName(u);
                  const initials = getInitials(u.firstName, u.lastName, u.email);
                  return (
                    <button
                      key={u.id}
                      disabled={creatingDm}
                      onClick={() => handleStartDm(u)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                      {creatingDm && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
