'use client';

import { useQuery } from '@tanstack/react-query';
import { getJobs, getJobApplications } from '@/api/jobService';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Briefcase, Users, CheckCircle, TrendingUp, Clock, XCircle, Eye } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';
import { useEffect, useState } from 'react';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  Pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', icon: Clock },
  Reviewed: { label: 'Reviewed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', icon: Eye },
  Accepted: { label: 'Accepted', color: 'text-green-600 bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
  Rejected: { label: 'Rejected', color: 'text-red-500 bg-red-50 dark:bg-red-900/20', icon: XCircle },
};

export default function HiringAnalyticsPage() {
  const { user } = useAuthStore();
  const [allApplications, setAllApplications] = useState<{ jobId: string; status: ApplicationStatus; appliedAt: string }[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const { data: jobsData, isLoading: loadingJobs } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => getJobs(),
    enabled: !!user,
  });

  const jobs = jobsData?.data ?? [];

  useEffect(() => {
    if (!jobs.length) return;
    setLoadingApps(true);
    Promise.all(jobs.map((j) => getJobApplications(j.id).then((r) => (r.data ?? []).map((a) => ({
      jobId: j.id,
      status: a.status,
      appliedAt: a.appliedAt,
    })))))
      .then((results) => setAllApplications(results.flat()))
      .finally(() => setLoadingApps(false));
  }, [jobs.length]);

  const isLoading = loadingJobs || loadingApps;

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.isActive).length;
  const totalApps = allApplications.length;
  const acceptedApps = allApplications.filter((a) => a.status === 'Accepted').length;
  const acceptanceRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;

  const appsByStatus = (['Pending', 'Reviewed', 'Accepted', 'Rejected'] as ApplicationStatus[]).map((status) => ({
    status,
    count: allApplications.filter((a) => a.status === status).length,
  }));

  const jobPerformance = jobs.map((job) => ({
    ...job,
    applicationCount: allApplications.filter((a) => a.jobId === job.id).length,
    acceptedCount: allApplications.filter((a) => a.jobId === job.id && a.status === 'Accepted').length,
  })).sort((a, b) => b.applicationCount - a.applicationCount);

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hiring Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your recruitment performance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: totalJobs, sub: `${activeJobs} active`, icon: Briefcase, color: 'blue' },
          { label: 'Total Applications', value: totalApps, sub: 'across all jobs', icon: Users, color: 'purple' },
          { label: 'Accepted', value: acceptedApps, sub: 'candidates hired', icon: CheckCircle, color: 'green' },
          { label: 'Acceptance Rate', value: `${acceptanceRate}%`, sub: 'of all applicants', icon: TrendingUp, color: 'amber' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/30 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Applications by status */}
      {totalApps > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Applications by Status</h2>
          <div className="space-y-3">
            {appsByStatus.map(({ status, count }) => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status === 'Accepted' ? 'bg-green-500' :
                        status === 'Rejected' ? 'bg-red-400' :
                        status === 'Reviewed' ? 'bg-blue-500' :
                        'bg-yellow-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Job performance table */}
      {jobs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Job Performance</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">Job</th>
                <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-400">Applications</th>
                <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-400">Accepted</th>
                <th className="text-center p-4 font-semibold text-slate-600 dark:text-slate-400">Rate</th>
                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobPerformance.map((job) => {
                const rate = job.applicationCount > 0 ? Math.round((job.acceptedCount / job.applicationCount) * 100) : 0;
                return (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{job.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${job.isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500'}`}>
                            {job.isActive ? 'Active' : 'Closed'}
                          </span>
                          <span className="text-xs text-slate-400">{job.locationType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-slate-900 dark:text-white">{job.applicationCount}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-green-600">{job.acceptedCount}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        rate >= 50 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        rate >= 20 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {formatRelativeTime(job.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No jobs posted yet</p>
          <p className="text-slate-400 text-sm mt-1">Post a job to start tracking applications</p>
        </div>
      )}
    </div>
  );
}
