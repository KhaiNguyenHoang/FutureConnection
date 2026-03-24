"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/authStore";
import { MessageSquare, Smile, Check } from "lucide-react";

export default function MessageFeed() {
  const { messages, activeChannel, activeGroup, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!activeChannel && !activeGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-zinc-500 p-8 text-center">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100 shadow-sm">
            <MessageSquare size={40} className="text-zinc-200" />
        </div>
        <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">Select a conversation</h3>
        <p className="max-w-xs text-sm text-zinc-400 leading-relaxed font-medium">Choose a friend or a group from the sidebar to start connected with amazing people.</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-white scroll-smooth">
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                <Smile size={32} className="text-neutral-200" />
            </div>
          <p className="text-sm font-bold uppercase tracking-widest">No messages yet. Say hello!</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isMe = msg.senderId === user?.id;
          const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

          return (
            <div 
              key={msg.id} 
              className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-100 shadow-sm ${!showAvatar && "opacity-0"}`}>
                <Image
                  src={msg.senderAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderFirstName || msg.senderName || "User")}&background=f4f4f5&color=71717a`}
                  alt={msg.senderFirstName ? `${msg.senderFirstName} ${msg.senderLastName}` : (msg.senderName || "User avatar")}
                  width={32}
                  height={32}
                />
              </div>

              {/* Message Content */}
              <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                {showAvatar && (
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">
                    {msg.senderFirstName ? `${msg.senderFirstName} ${msg.senderLastName}` : msg.senderName} • {mounted ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                  isMe 
                    ? "bg-zinc-900 text-white rounded-tr-sm" 
                    : "bg-zinc-100 text-zinc-800 rounded-tl-sm border border-zinc-200/50"
                }`}>
                  {msg.content}
                </div>
                
                {/* Status Indicator */}
                {isMe && (
                   <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check size={12} className="text-amber-500" />
                   </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

