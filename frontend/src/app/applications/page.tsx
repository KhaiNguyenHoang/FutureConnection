'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyApplications } from '@/api/jobService';
import { formatRelativeTime } from '@/lib/utils';
import { FileText, Loader2, Briefcase, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { ApplicationStatus } from '@/types';

const statusColors: Record<ApplicationStatus, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Reviewed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Accepted: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ApplicationsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-applications'], queryFn: getMyApplications });
  const applications = data?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
        <p className="text-slate-500 text-sm mt-1">Track the status of your job applications</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/jobs/${app.jobId}`}
              className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {app.job?.title ?? 'Job listing'}
                  </h3>
                  {app.job?.company && (
                    <p className="text-sm text-slate-500 mt-0.5">{app.job.company.name}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {app.job?.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {app.job.location}
                      </span>
                    )}
                    {app.job?.locationType && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        app.job.locationType === 'Remote' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        app.job.locationType === 'Hybrid' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {app.job.locationType}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">Applied {formatRelativeTime(app.appliedAt)}</span>
                  </div>
                  {app.coverLetter && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{app.coverLetter}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColors[app.status]}`}>
                  {app.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No applications yet</p>
          <p className="text-slate-400 text-sm mt-1">Browse jobs and start applying</p>
          <Link href="/jobs" className="inline-block mt-4 text-sm text-blue-600 hover:underline font-medium">
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}
