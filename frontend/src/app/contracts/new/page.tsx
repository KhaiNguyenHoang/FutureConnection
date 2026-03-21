'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createContract } from '@/api/contractService';
import { getJobs, getJobApplications } from '@/api/jobService';
import { ArrowLeft, Loader2, FileText, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getDisplayName } from '@/lib/utils';
import type { Application } from '@/types';

export default function NewContractPage() {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: jobsData, isLoading: loadingJobs } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => getJobs(),
  });

  const { data: appsData, isLoading: loadingApps } = useQuery({
    queryKey: ['job-applications-accepted', selectedJobId],
    queryFn: () => getJobApplications(selectedJobId),
    enabled: !!selectedJobId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => createContract({
      applicationId: selectedApp!.id,
      agreedPrice: Number(agreedPrice),
      startDate,
      endDate: endDate || undefined,
    }),
    onSuccess: () => { toast.success('Contract created!'); router.push('/contracts'); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create contract';
      toast.error(msg);
    },
  });

  const jobs = jobsData?.data ?? [];
  const acceptedApps = (appsData?.data ?? []).filter((a) => a.status === 'Accepted');
  const canSubmit = selectedApp && agreedPrice && startDate && Number(agreedPrice) > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/contracts" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Contracts
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Contract</h1>
        <p className="text-slate-500 text-sm mt-1">Create a contract from an accepted job application.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">

        {/* Step 1: Select job */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">1. Select Job *</label>
          {loadingJobs ? (
            <div className="flex items-center gap-2 py-2.5 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Loading jobs…</div>
          ) : (
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => { setSelectedJobId(e.target.value); setSelectedApp(null); }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="">Choose a job posting…</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Step 2: Select accepted applicant */}
        {selectedJobId && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">2. Select Applicant *</label>
            {loadingApps ? (
              <div className="flex items-center gap-2 py-2.5 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Loading applications…</div>
            ) : acceptedApps.length > 0 ? (
              <div className="space-y-2">
                {acceptedApps.map((app) => {
                  const name = app.applicant ? getDisplayName(app.applicant) : 'Applicant';
                  const active = selectedApp?.id === app.id;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                        {app.applicant?.avatarUrl ? (
                          <img src={app.applicant.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{name}</p>
                        {app.applicant?.email && <p className="text-xs text-slate-400 truncate">{app.applicant.email}</p>}
                        {app.coverLetter && <p className="text-xs text-slate-500 truncate mt-0.5">{app.coverLetter}</p>}
                      </div>
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  No accepted applications for this job. Accept an applicant in the Pipeline first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contract terms */}
        {selectedApp && (
          <div className="space-y-4 pt-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">3. Contract Terms</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Agreed Price (USD) *</label>
              <input
                type="number"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                placeholder="e.g. 5000"
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/contracts" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button
            onClick={() => mutate()}
            disabled={isPending || !canSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Contract
          </button>
        </div>
      </div>
    </div>
  );
}
