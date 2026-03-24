"use client";

import { useState, useRef } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";

export default function MessageInput() {
  const [content, setContent] = useState("");
  const { sendMessage, activeChannel, activeGroup } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!content.trim()) return;
    await sendMessage(content);
    setContent("");
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
    setContent(target.value);
  };

  if (!activeChannel && !activeGroup) return null;

  return (
    <div className="p-4 bg-white border-t border-zinc-200">
      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-zinc-50 border border-zinc-200/50 p-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-amber-500/10 focus-within:border-amber-500/30 transition-all">
        <button className="p-2 hover:bg-zinc-200 rounded-xl transition-colors text-zinc-400">
          <Paperclip size={20} />
        </button>
        
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-2 px-1 resize-none scrollbar-none"
          value={content}
          onChange={adjustHeight}
          onKeyDown={handleKeyDown}
        />

        <button className="p-2 hover:bg-zinc-200 rounded-xl transition-colors text-zinc-400">
          <Smile size={20} />
        </button>

        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-30 disabled:hover:bg-zinc-900 shadow-md shadow-black/10 active:scale-95 translate-y-[-2px]"
        >
          <Send size={20} />
        </button>
      </div>
      <p className="max-w-4xl mx-auto mt-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center px-4">
        Shift + Enter for new line • Type @ to mention
      </p>
    </div>
  );
}
