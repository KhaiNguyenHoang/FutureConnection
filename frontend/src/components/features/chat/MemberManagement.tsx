"use client";

import { useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/authStore";
import { UserPlus, Mail, Shield, X, ArrowLeft, Settings, Trash2, Globe, Lock, User, Fingerprint } from "lucide-react";
import Image from "next/image";
import ErrorAlert from "@/components/common/ErrorAlert";

export default function MemberManagement() {
  const { user } = useAuthStore();
  const { activeGroup, members, addMember, removeMember, updateGroup, deleteGroup, setMemberView, isLoading } = useChatStore();
  const [identifier, setIdentifier] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeGroup) return null;

  const currentUserMember = members.find(m => m.userId.toLowerCase() === user?.id?.toLowerCase());
  const isAdmin = currentUserMember?.role === 2 || activeGroup.ownerId?.toLowerCase() === user?.id?.toLowerCase();

  // Settings state
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editName, setEditName] = useState(activeGroup.name);
  const [editDescription, setEditDescription] = useState(activeGroup.description || "");
  const [editIsPrivate, setEditIsPrivate] = useState(activeGroup.isPrivate);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsAdding(true);
    setError(null);
    try {
      await addMember(activeGroup.id, identifier, 0); // Default to Member
      setIdentifier("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsUpdatingSettings(true);
    setError(null);
    try {
      await updateGroup(activeGroup.id, editName, editDescription, editIsPrivate);
      setIsEditingSettings(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update settings");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) return;

    try {
      await deleteGroup(activeGroup.id);
      setMemberView(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete group");
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!isAdmin && memberUserId !== user?.id) return;
    
    if (memberUserId === user?.id) {
        if (!confirm("Are you sure you want to leave this group?")) return;
    } else {
        if (!confirm("Are you sure you want to remove this member?")) return;
    }

    try {
      // Find the member record ID
      const member = members.find(m => m.userId === memberUserId);
      if (!member) return;
      
      await removeMember(activeGroup.id, member.id);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to remove member");
    }
  };

  const getRoleIcon = (role: number) => {
    switch (role) {
      case 2: return <Shield size={14} className="text-amber-500" />;
      case 1: return <Shield size={14} className="text-zinc-500" />;
      default: return <User size={14} className="text-zinc-400" />;
    }
  };

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 2: return "Administrator";
      case 1: return "Moderator";
      default: return "Member";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-8 border-b border-zinc-100 bg-zinc-50/30">
        <button
          onClick={() => setMemberView(false)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Back to messages</span>
        </button>

        {isLoading && members.length === 0 && (
          <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
            <div className="w-1 h-1 bg-white rounded-full animate-ping" />
            Updating roles...
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Member Management</h2>
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest text-[11px]">
              Managing {members.length} participants in <span className="text-zinc-900 font-bold">{activeGroup.name}</span>
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="px-4 py-2 text-center border-r border-zinc-100">
              <p className="text-[10px] font-black text-zinc-400 uppercase leading-none mb-1">Total</p>
              <p className="text-xl font-black text-zinc-900 leading-none">{members.length}</p>
            </div>
            <div className="px-4 py-2 text-center border-r border-zinc-100">
              <p className="text-[10px] font-black text-zinc-400 uppercase leading-none mb-1">Admins</p>
              <p className="text-xl font-black text-zinc-900 leading-none">{members.filter(m => m.role === 2).length}</p>
            </div>
            <div className="px-2">
              <button 
                onClick={() => setIsEditingSettings(!isEditingSettings)}
                className={`p-3 rounded-xl transition-all ${isEditingSettings ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}
                title="Group Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Member List or Settings */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
          {isEditingSettings && isAdmin ? (
            <div className="max-w-2xl mx-auto space-y-12 py-8 animate-in slide-in-from-bottom duration-500">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Group Settings</h3>
                <p className="text-sm text-zinc-500 font-medium">Update the group information and privacy settings.</p>
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Group Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Privacy Status</label>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200 h-[60px]">
                      <span className="text-sm font-bold text-zinc-600">{editIsPrivate ? "Private Group" : "Public Group"}</span>
                      <button
                        type="button"
                        onClick={() => setEditIsPrivate(!editIsPrivate)}
                        className={`w-12 h-6 rounded-full transition-all relative ${editIsPrivate ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editIsPrivate ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all resize-none"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUpdatingSettings || !editName.trim()}
                    className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
                  >
                    {isUpdatingSettings ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingSettings(false)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="pt-12 border-t border-zinc-100">
                <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-lg font-black text-red-900 mb-1">Danger Zone</h4>
                    <p className="text-sm text-red-900/60 font-medium">Permanently delete this group and all its messages. This cannot be undone.</p>
                  </div>
                  <button
                    onClick={handleDeleteGroup}
                    className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 shrink-0"
                  >
                    Delete Group
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Active Members</h3>
                <div className="h-px flex-1 bg-zinc-100 mx-4" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all group bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <Image
                          src={member.userAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userFirstName || member.userName || "User")}&background=f4f4f5&color=71717a`}
                          alt={member.userName || "User avatar"}
                          width={48}
                          height={48}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">
                          {member.userFirstName ? `${member.userFirstName} ${member.userLastName}` : member.userName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {getRoleIcon(member.role)}
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {getRoleLabel(member.role)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all">
                        <Fingerprint size={18} />
                      </button>
                      {(isAdmin || member.userId.toLowerCase() === user?.id?.toLowerCase()) && (
                        <button 
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Invite Sidebar */}
        <div className="w-full md:w-96 bg-zinc-50/50 border-l border-zinc-100 p-8">
          <div className="sticky top-0">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/60 shadow-xl shadow-zinc-200/20">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-black/10">
                <UserPlus size={24} />
              </div>

              <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2">Invite New Members</h3>
              <p className="text-sm text-zinc-500 font-medium mb-8 leading-relaxed">
                Add people to this group by entering their registered email address or unique User ID.
              </p>

              <ErrorAlert error={error} onClear={() => setError(null)} title="Member Error" />

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Email or User ID</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search user..."
                      disabled={!isAdmin}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all disabled:opacity-50"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError(null);
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAdding || !identifier.trim() || !isAdmin}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isAdding ? "Adding..." : (
                    <>
                      <UserPlus size={20} /> Add to Group
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-zinc-100">
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                    <Settings size={16} />
                  </div>
                  <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed uppercase tracking-wide">
                    Only administrators can invite or remove members from this group.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
