'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createJob, getJobTypes, getTags } from '@/api/jobService';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { LocationType } from '@/types';

export default function CreateJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    locationType: 'Remote' as LocationType,
    seniority: '',
    salaryMin: '',
    salaryMax: '',
    budget: '',
    deadline: '',
    jobTypeId: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: jobTypesData } = useQuery({ queryKey: ['job-types'], queryFn: getJobTypes });
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: getTags });

  const { mutate, isPending } = useMutation({
    mutationFn: () => createJob({
      title: form.title,
      description: form.description,
      location: form.location || undefined,
      locationType: form.locationType,
      seniority: form.seniority || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      deadline: form.deadline || undefined,
      jobTypeId: form.jobTypeId || undefined,
      tagIds: selectedTags,
    }),
    onSuccess: () => {
      toast.success('Job posted!');
      router.push('/employer/jobs');
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to post job';
      toast.error(message);
    },
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const toggleTag = (id: string) => setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);

  const jobTypes = jobTypesData?.data ?? [];
  const tags = tagsData?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post a Job</h1>
        <p className="text-slate-500 text-sm mt-1">Find the right talent for your project.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Title *</label>
          <input type="text" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Senior React Developer"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description *</label>
          <textarea required value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the role, responsibilities, and requirements…" rows={6}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location Type *</label>
            <select value={form.locationType} onChange={(e) => set('locationType', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="OnSite">On-site</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. San Francisco, CA"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Seniority</label>
            <select value={form.seniority} onChange={(e) => set('seniority', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
              <option value="">Any</option>
              {['Junior', 'Mid', 'Senior', 'Lead', 'Principal'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {jobTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Job Type</label>
              <select value={form.jobTypeId} onChange={(e) => set('jobTypeId', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                <option value="">Select type</option>
                {jobTypes.map((jt) => <option key={jt.id} value={jt.id}>{jt.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Salary Min (annual)</label>
            <input type="number" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} placeholder="50000"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Salary Max (annual)</label>
            <input type="number" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} placeholder="100000"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Budget</label>
            <input type="number" value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="5000"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Application Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills / Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${selectedTags.includes(tag.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                  {tag.name}
                  {selectedTags.includes(tag.id) && <X className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/employer/jobs" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button
            onClick={() => mutate()}
            disabled={isPending || !form.title || !form.description}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
}
