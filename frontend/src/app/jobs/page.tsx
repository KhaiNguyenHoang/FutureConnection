'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobs, getJobTypes, getTags } from '@/api/jobService';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Briefcase, Search, MapPin, DollarSign, Loader2, Filter, X } from 'lucide-react';
import Link from 'next/link';
import type { LocationType } from '@/types';

export default function JobBoardPage() {
  const [keyword, setKeyword] = useState('');
  const [locationType, setLocationType] = useState<LocationType | ''>('');
  const [jobTypeId, setJobTypeId] = useState('');

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', keyword, locationType, jobTypeId],
    queryFn: () => getJobs({ keyword: keyword || undefined, locationType: locationType || undefined, jobTypeId: jobTypeId || undefined }),
  });

  const { data: jobTypesData } = useQuery({
    queryKey: ['job-types'],
    queryFn: getJobTypes,
  });

  const jobs = jobsData?.data ?? [];
  const jobTypes = jobTypesData?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Jobs</h1>
        <p className="text-slate-500 text-sm mt-1">Find your next opportunity</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title, company..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <select
          value={locationType}
          onChange={(e) => setLocationType(e.target.value as LocationType | '')}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="">All locations</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="OnSite">On-site</option>
        </select>

        {jobTypes.length > 0 && (
          <select
            value={jobTypeId}
            onChange={(e) => setJobTypeId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">All job types</option>
            {jobTypes.map((jt) => (
              <option key={jt.id} value={jt.id}>{jt.name}</option>
            ))}
          </select>
        )}

        {(keyword || locationType || jobTypeId) && (
          <button
            onClick={() => { setKeyword(''); setLocationType(''); setJobTypeId(''); }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  {job.company && <p className="text-sm text-slate-500 mt-0.5">{job.company.name}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.locationType === 'Remote' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      job.locationType === 'Hybrid' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {job.locationType}
                    </span>
                    {job.seniority && (
                      <span className="text-xs text-slate-400">{job.seniority}</span>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salaryMin && job.salaryMax
                          ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
                          : job.salaryMin ? `From ${formatCurrency(job.salaryMin)}`
                          : `Up to ${formatCurrency(job.salaryMax!)}`}
                      </span>
                    )}
                    {job.budget && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <DollarSign className="w-3.5 h-3.5" />
                        Budget: {formatCurrency(job.budget)}
                      </span>
                    )}
                  </div>
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.tags.slice(0, 5).map((tag) => (
                        <span key={tag.id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400 shrink-0">{formatRelativeTime(job.createdAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No jobs found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
