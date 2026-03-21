'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, deleteJob } from '@/api/jobService';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Briefcase, PlusCircle, Edit3, Trash2, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EmployerJobsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['employer-jobs'], queryFn: () => getJobs() });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => { toast.success('Job deleted'); qc.invalidateQueries({ queryKey: ['employer-jobs'] }); },
    onError: () => toast.error('Failed to delete job'),
  });

  const jobs = data?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Job Listings</h1>
          <p className="text-slate-500 text-sm mt-1">{jobs.length} active listing{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/employer/jobs/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <PlusCircle className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{job.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span>{job.locationType}</span>
                  {job.salaryMin && job.salaryMax && <span>{formatCurrency(job.salaryMin)} – {formatCurrency(job.salaryMax)}</span>}
                  {job.budget && <span>Budget: {formatCurrency(job.budget)}</span>}
                  <span>{formatRelativeTime(job.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/jobs/${job.id}`} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View">
                  <Eye className="w-4 h-4" />
                </Link>
                <Link href={`/employer/jobs/${job.id}/edit`} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </Link>
                <button onClick={() => { if (confirm('Delete this job?')) remove(job.id); }} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No jobs posted yet</p>
          <Link href="/employer/jobs/new" className="inline-block mt-3 text-sm text-blue-600 hover:underline">Post your first job</Link>
        </div>
      )}
    </div>
  );
}
