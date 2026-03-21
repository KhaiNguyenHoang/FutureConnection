'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, getJobApplications, updateApplicationStatus } from '@/api/jobService';
import { getDisplayName } from '@/lib/utils';
import { Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Application, ApplicationStatus } from '@/types';

const COLUMNS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'Pending', label: 'Pending', color: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' },
  { status: 'Reviewed', label: 'Reviewed', color: 'border-blue-300 bg-blue-50 dark:bg-blue-900/10' },
  { status: 'Accepted', label: 'Accepted', color: 'border-green-300 bg-green-50 dark:bg-green-900/10' },
  { status: 'Rejected', label: 'Rejected', color: 'border-red-300 bg-red-50 dark:bg-red-900/10' },
];

export default function PipelinePage() {
  const qc = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState('');

  const { data: jobsData, isLoading: loadingJobs } = useQuery({ queryKey: ['employer-jobs'], queryFn: () => getJobs() });
  const { data: appsData, isLoading: loadingApps } = useQuery({
    queryKey: ['applications', selectedJobId],
    queryFn: () => getJobApplications(selectedJobId),
    enabled: !!selectedJobId,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: ApplicationStatus }) => updateApplicationStatus(appId, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['applications', selectedJobId] }); },
    onError: () => toast.error('Failed to update status'),
  });

  const jobs = jobsData?.data ?? [];
  const applications = appsData?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application Pipeline</h1>
        <p className="text-slate-500 text-sm mt-1">Track and manage all applicants</p>
      </div>

      {/* Job selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="">Select a job posting…</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
      </div>

      {/* Kanban */}
      {selectedJobId && (
        loadingApps ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const colApps = applications.filter((a) => a.status === col.status);
              return (
                <div key={col.status} className={`rounded-2xl border-2 ${col.color} p-4 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{col.label}</h3>
                    <span className="text-xs bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 font-bold text-slate-600 dark:text-slate-400">{colApps.length}</span>
                  </div>

                  {colApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      onStatusChange={(status) => updateStatus({ appId: app.id, status })}
                    />
                  ))}

                  {colApps.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No applications</p>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {!selectedJobId && !loadingJobs && (
        <div className="text-center py-16 text-slate-500">
          <p>Select a job to view applications</p>
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app, onStatusChange }: { app: Application; onStatusChange: (s: ApplicationStatus) => void }) {
  const [open, setOpen] = useState(false);
  const applicant = app.applicant;
  const name = applicant ? getDisplayName(applicant) : 'Unknown';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-white/50 dark:border-slate-800 space-y-2">
      <p className="font-medium text-sm text-slate-900 dark:text-white">{name}</p>
      {applicant?.email && <p className="text-xs text-slate-400">{applicant.email}</p>}
      {app.coverLetter && (
        <p className="text-xs text-slate-500 line-clamp-2">{app.coverLetter}</p>
      )}
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Move to…
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden">
            {(['Pending', 'Reviewed', 'Accepted', 'Rejected'] as ApplicationStatus[])
              .filter((s) => s !== app.status)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(s); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                >
                  {s}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
