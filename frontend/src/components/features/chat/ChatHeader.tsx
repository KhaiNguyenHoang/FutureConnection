"use client";

import { useChatStore } from "@/store/useChatStore";
import { Hash, Users, Info, Settings, Search } from "lucide-react";

export default function ChatHeader() {
  const { 
    activeChannel, 
    activeGroup, 
    members, 
    isMemberView, 
    setMemberView 
  } = useChatStore();

  if (!activeChannel && !activeGroup) return null;

  const title = activeChannel?.name || activeGroup?.name;
  const isGroup = !!activeGroup;

  return (
    <div className="h-20 px-8 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-black/10">
          {isGroup ? <Users size={20} /> : <Hash size={20} />}
        </div>
        <div>
          <h1 className="text-lg font-black text-zinc-900 tracking-tight leading-7">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {isGroup ? `${members.length} Members` : "Active Channel"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-xl transition-all text-zinc-500 hover:text-zinc-900">
          <Search size={20} />
        </button>
        {isGroup && (
          <button 
            onClick={() => setMemberView(!isMemberView)}
            className={`h-10 px-3 rounded-xl transition-all flex items-center gap-2 ${
              isMemberView 
                ? "bg-zinc-900 text-white shadow-lg shadow-black/10" 
                : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Users size={20} />
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
              isMemberView ? "bg-white/20" : "bg-zinc-100"
            }`}>
              {members.length}
            </span>
          </button>
        )}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-xl transition-all text-zinc-500 hover:text-zinc-900">
          <Info size={20} />
        </button>
        {isGroup && (
          <button 
            onClick={() => setMemberView(!isMemberView)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              isMemberView 
                ? "bg-zinc-900 text-white shadow-lg shadow-black/10" 
                : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
