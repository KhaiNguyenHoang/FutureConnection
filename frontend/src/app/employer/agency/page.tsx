'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgencies, createAgency, deleteAgency, addAgencyMember, removeAgencyMember } from '@/api/agencyService';
import { getDisplayName, getInitials } from '@/lib/utils';
import { Building, PlusCircle, Trash2, UserPlus, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AgencyPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['agencies'], queryFn: getAgencies });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: () => createAgency({ name, description: description || undefined, logoUrl: undefined }),
    onSuccess: () => {
      toast.success('Agency created!');
      setShowCreate(false);
      setName('');
      setDescription('');
      qc.invalidateQueries({ queryKey: ['agencies'] });
    },
    onError: () => toast.error('Failed to create agency'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteAgency(id),
    onSuccess: () => { toast.success('Agency deleted'); qc.invalidateQueries({ queryKey: ['agencies'] }); },
  });

  const agencies = data?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agency</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your agency and team members</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create Agency
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">New Agency</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Agency Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your agency do?" rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={() => create()} disabled={creating || !name.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </div>
      )}

      {/* Agencies */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : agencies.length > 0 ? (
        <div className="space-y-4">
          {agencies.map((agency) => (
            <div key={agency.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  {agency.logoUrl ? <img src={agency.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" /> : <Building className="w-6 h-6 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{agency.name}</h3>
                  {agency.description && <p className="text-sm text-slate-500 mt-0.5">{agency.description}</p>}
                  {agency.memberCount !== undefined && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" />{agency.memberCount} members</p>
                  )}
                </div>
                <button onClick={() => { if (confirm('Delete this agency?')) remove(agency.id); }} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No agencies yet</p>
        </div>
      )}
    </div>
  );
}
