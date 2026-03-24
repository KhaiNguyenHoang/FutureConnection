"use client";

import { useEffect, useState } from "react";
import { Search, Plus, MessageSquare, Hash, Users, MoreVertical } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/authStore";
import { ChannelDto, GroupDto } from "@/types/chat";
import CreateChatModal from "./CreateChatModal";

export default function ConversationSidebar() {
  const { user } = useAuthStore();
  const { 
    channels, 
    groups, 
    fetchChannels, 
    fetchGroups, 
    activeChannel, 
    activeGroup,
    setActiveChannel,
    setActiveGroup,
    isLoading 
  } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchChannels(user.id);
      fetchGroups();
    }
  }, [user?.id, fetchChannels, fetchGroups]);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-white border-r border-zinc-200 flex flex-col bg-neutral-50/30">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Messages</h2>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        {/* Groups Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Groups</span>
            <Users size={12} className="text-zinc-400" />
          </div>
          <div className="space-y-0.5">
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  activeGroup?.id === group.id 
                    ? "bg-amber-50 text-amber-900 shadow-sm border border-amber-200/50" 
                    : "hover:bg-white hover:shadow-sm text-zinc-600 border border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-colors ${
                  activeGroup?.id === group.id ? "bg-amber-400 border-amber-500 text-white" : "bg-zinc-100 border-zinc-200 text-zinc-500"
                }`}>
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate">{group.name}</p>
                  <p className="text-xs text-zinc-400 truncate">Group</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Channels / Direct Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Channels</span>
            <Hash size={12} className="text-zinc-400" />
          </div>
          <div className="space-y-0.5">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  activeChannel?.id === channel.id 
                    ? "bg-amber-50 text-amber-900 shadow-sm border border-amber-200/50" 
                    : "hover:bg-white hover:shadow-sm text-zinc-600 border border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border transition-colors ${
                  activeChannel?.id === channel.id ? "bg-amber-400 border-amber-500 text-white" : "bg-zinc-100 border-zinc-200 text-zinc-500"
                }`}>
                  <Hash size={18} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate">{channel.name}</p>
                  <p className="text-xs text-zinc-400 truncate">Channel</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Connection</span>
        </div>
      </div>

      <CreateChatModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
