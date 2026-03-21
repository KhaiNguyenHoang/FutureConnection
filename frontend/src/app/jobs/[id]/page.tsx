'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { getJob } from '@/api/jobService';
import { applyForJob } from '@/api/jobService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { Briefcase, MapPin, DollarSign, Calendar, Building, Tag, ArrowLeft, Loader2, Send } from 'lucide-react';
import type { User } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [jobId, setJobId] = useState('');
  const { user } = useAuthStore();
  const [coverLetter, setCoverLetter] = useState('');
  const [showApply, setShowApply] = useState(false);

  // Await params
  if (!jobId) {
    params.then(({ id }) => setJobId(id));
    return null;
  }

  return <JobDetailContent jobId={jobId} user={user} coverLetter={coverLetter} setCoverLetter={setCoverLetter} showApply={showApply} setShowApply={setShowApply} />;
}

function JobDetailContent({ jobId, user, coverLetter, setCoverLetter, showApply, setShowApply }: {
  jobId: string;
  user: User | null;
  coverLetter: string;
  setCoverLetter: (v: string) => void;
  showApply: boolean;
  setShowApply: (v: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  });

  const { mutate: apply, isPending } = useMutation({
    mutationFn: () => applyForJob(jobId, { coverLetter }),
    onSuccess: () => {
      toast.success('Application submitted!');
      setShowApply(false);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Application failed';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const job = data?.data;
  if (!job) return <div className="p-8 text-center text-slate-500">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            {job.company?.logoUrl ? (
              <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <Briefcase className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
            {job.company && (
              <Link href={`/companies/${job.company.id}`} className="text-blue-600 hover:underline flex items-center gap-1.5 mt-1 text-sm">
                <Building className="w-4 h-4" />
                {job.company.name}
              </Link>
            )}
          </div>
          {user?.role === 'Freelancer' && (
            <button
              onClick={() => setShowApply(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shrink-0"
            >
              Apply Now
            </button>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          {job.location && (
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
          )}
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            job.locationType === 'Remote' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            job.locationType === 'Hybrid' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
          }`}>{job.locationType}</span>
          {job.seniority && <span className="flex items-center gap-1.5">{job.seniority}</span>}
          {job.jobType && <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" />{job.jobType.name}</span>}
          {(job.salaryMin || job.salaryMax) && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              {job.salaryMin && job.salaryMax ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}/yr` : job.salaryMin ? `From ${formatCurrency(job.salaryMin)}/yr` : `Up to ${formatCurrency(job.salaryMax!)}/yr`}
            </span>
          )}
          {job.budget && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />Budget: {formatCurrency(job.budget)}</span>}
          {job.deadline && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Deadline: {formatDate(job.deadline)}</span>}
          <span className="text-slate-400">Posted {formatRelativeTime(job.createdAt)}</span>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span key={tag.id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Job Description</h2>
          <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{job.description}</div>
        </div>

        {/* Apply form */}
        {showApply && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Your Application</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cover letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit…"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApply(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => apply()}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
