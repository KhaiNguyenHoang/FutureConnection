"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useChatStore } from "@/store/useChatStore";
import { Hash, Users, Plus, Check } from "lucide-react";

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateChatModal({ isOpen, onClose }: CreateChatModalProps) {
  const [type, setType] = useState<"channel" | "group">("group");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const { groups, createChannel, createGroup, isLoading } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (type === "group") {
      await createGroup(name, description, isPrivate);
    } else {
      if (!selectedGroupId) return;
      await createChannel(name, description, selectedGroupId);
    }
    
    // Reset and close
    setName("");
    setDescription("");
    setIsPrivate(false);
    setType("group");
    setSelectedGroupId("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-8">
        <h2 className="text-2xl font-black text-zinc-900 mb-6 tracking-tight">Create New</h2>
        
        {/* Type Selector */}
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl mb-8">
          <button
            onClick={() => setType("group")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
              type === "group" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Users size={18} /> Group
          </button>
          <button
            onClick={() => setType("channel")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
              type === "channel" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Hash size={18} /> Channel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === "channel" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Group</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none"
                required
              >
                <option value="">Select a group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {type === "group" ? "Group Name" : "Channel Name"}
            </label>
            <input
              type="text"
              placeholder={`Enter ${type} name`}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description (Optional)</label>
            <textarea
              placeholder="What is this conversation about?"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {type === "group" && (
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div>
                <p className="text-sm font-bold text-zinc-900 leading-none mb-1">Private Group</p>
                <p className="text-[10px] font-medium text-zinc-400">Only invited members can access</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-12 h-6 rounded-full transition-all relative ${isPrivate ? 'bg-zinc-900' : 'bg-zinc-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPrivate ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !name.trim() || (type === "channel" && !selectedGroupId)}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : (
              <>
                <Plus size={20} /> Create {type.charAt(0).toUpperCase() + type.slice(1)}
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
