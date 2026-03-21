'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags, createTag, getJobTypes, createJobType } from '@/api/jobService';
import { getBadges, createBadge } from '@/api/communityService';
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTagsPage() {
  const qc = useQueryClient();
  const [newTag, setNewTag] = useState('');
  const [newJobType, setNewJobType] = useState('');

  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: getTags });
  const { data: jobTypesData } = useQuery({ queryKey: ['job-types'], queryFn: getJobTypes });
  const { data: badgesData } = useQuery({ queryKey: ['badges'], queryFn: getBadges });

  const { mutate: addTag, isPending: addingTag } = useMutation({
    mutationFn: () => createTag(newTag),
    onSuccess: () => { toast.success('Tag created'); setNewTag(''); qc.invalidateQueries({ queryKey: ['tags'] }); },
    onError: () => toast.error('Failed to create tag'),
  });

  const { mutate: addJobType, isPending: addingJobType } = useMutation({
    mutationFn: () => createJobType(newJobType),
    onSuccess: () => { toast.success('Job type created'); setNewJobType(''); qc.invalidateQueries({ queryKey: ['job-types'] }); },
    onError: () => toast.error('Failed to create job type'),
  });

  const tags = tagsData?.data ?? [];
  const jobTypes = jobTypesData?.data ?? [];
  const badges = badgesData?.data ?? [];

  const Section = ({ title, items, value, onChange, onAdd, adding }: { title: string; items: { id: string; name: string }[]; value: string; onChange: (v: string) => void; onAdd: () => void; adding: boolean }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      <div className="flex gap-2">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`New ${title.toLowerCase().slice(0, -1)}…`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        <button onClick={onAdd} disabled={adding || !value.trim()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.id} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm">{item.name}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tags & Categories</h1>
      <Section title="Tags" items={tags} value={newTag} onChange={setNewTag} onAdd={() => addTag()} adding={addingTag} />
      <Section title="Job Types" items={jobTypes} value={newJobType} onChange={setNewJobType} onAdd={() => addJobType()} adding={addingJobType} />
      {badges.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => <span key={b.id} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">{b.name}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
