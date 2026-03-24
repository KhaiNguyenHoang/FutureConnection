"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useChatStore } from "@/store/useChatStore";
import { Users, Plus, UserPlus, Shield, User, X } from "lucide-react";
import Image from "next/image";
import ErrorAlert from "@/components/common/ErrorAlert";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MemberModal({ isOpen, onClose }: MemberModalProps) {
  const { activeGroup, members, addMember } = useChatStore();
  const [newUserId, setNewUserId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeGroup) return null;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    
    setIsAdding(true);
    setError(null);
    try {
      await addMember(activeGroup.id, newUserId, 0); // 0 = Member
      setNewUserId("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  const getRoleIcon = (role: number) => {
    switch (role) {
      case 2: return <Shield size={12} className="text-amber-500" />;
      case 1: return <Shield size={12} className="text-zinc-500" />;
      default: return <User size={12} className="text-zinc-400" />;
    }
  };

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 2: return "Admin";
      case 1: return "Moderator";
      default: return "Member";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header */}
        <div className="p-8 pb-4 border-b border-zinc-100">
          <h2 className="text-2xl font-black text-zinc-900 mb-1 tracking-tight">Group Members</h2>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {activeGroup.name} • {members.length} people
          </p>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-100 shadow-sm shrink-0">
                  <Image
                    src={member.userAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userFirstName || member.userName || "User")}&background=f4f4f5&color=71717a`}
                    alt={member.userName || "User avatar"}
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">
                    {member.userFirstName ? `${member.userFirstName} ${member.userLastName}` : member.userName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {getRoleIcon(member.role)}
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Member Form (Sticky at bottom) */}
        <div className="p-8 pt-4 border-t border-zinc-100 bg-zinc-50/50">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Invite by Email or ID</label>
          
          <ErrorAlert error={error} onClear={() => setError(null)} title="Member Error" />
          
          <form onSubmit={handleAddMember} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter email or User ID..."
              className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none"
              value={newUserId}
              onChange={(e) => {
                setNewUserId(e.target.value);
                if (error) setError(null);
              }}
            />
            <button
              type="submit"
              disabled={isAdding || !newUserId.trim()}
              className="w-11 h-11 flex items-center justify-center bg-zinc-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-50 ring-offset-2 focus:ring-2 focus:ring-zinc-900"
            >
              <UserPlus size={20} />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
