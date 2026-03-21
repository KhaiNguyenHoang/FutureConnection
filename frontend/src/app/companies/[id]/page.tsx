'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCompany, getCompanyJobs, followCompany, unfollowCompany, deleteCompany } from '@/api/companyService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Building, MapPin, Globe, Users, Briefcase, ArrowLeft, Loader2, Edit3, DollarSign, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [companyId, setCompanyId] = useState('');
  if (!companyId) {
    params.then(({ id }) => setCompanyId(id));
    return null;
  }
  return <CompanyContent companyId={companyId} />;
}

function CompanyContent({ companyId }: { companyId: string }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => getCompany(companyId),
  });

  const { data: jobsData } = useQuery({
    queryKey: ['company-jobs', companyId],
    queryFn: () => getCompanyJobs(companyId),
  });

  const { mutate: follow, isPending: following } = useMutation({
    mutationFn: () => followCompany(companyId),
    onSuccess: () => { toast.success('Following company!'); qc.invalidateQueries({ queryKey: ['company', companyId] }); },
    onError: () => toast.error('Failed to follow'),
  });

  const { mutate: unfollow, isPending: unfollowing } = useMutation({
    mutationFn: () => unfollowCompany(companyId),
    onSuccess: () => { toast.success('Unfollowed'); qc.invalidateQueries({ queryKey: ['company', companyId] }); },
    onError: () => toast.error('Failed to unfollow'),
  });

  const { mutate: destroy, isPending: destroying } = useMutation({
    mutationFn: () => deleteCompany(companyId),
    onSuccess: () => { toast.success('Company deleted'); router.push('/companies'); },
    onError: () => toast.error('Failed to delete company'),
  });

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  const company = data?.data;
  if (!company) return <div className="p-8 text-center text-slate-500">Company not found</div>;

  const jobs = jobsData?.data ?? [];
  const isOwner = user?.id === company.ownerId;
  const isPending = following || unfollowing;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Link href="/companies" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-slate-700 to-slate-900" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-9 h-9 text-slate-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <Link
                    href={`/companies/${companyId}/edit`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => { if (confirm(`Delete "${company.name}"? This cannot be undone.`)) destroy(); }}
                    disabled={destroying}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
                  >
                    {destroying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </>
              )}
              {user && !isOwner && (
                company.isFollowing ? (
                  <button
                    onClick={() => unfollow()}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Following
                  </button>
                ) : (
                  <button
                    onClick={() => follow()}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Follow
                  </button>
                )
              )}
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
          {company.industry && <p className="text-slate-500 mt-0.5">{company.industry}</p>}

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
            {company.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {company.location}
              </span>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            {company.size && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {company.size} employees
              </span>
            )}
            {company.followerCount !== undefined && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {company.followerCount} follower{company.followerCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {company.description && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{company.description}</p>
          )}
        </div>
      </div>

      {/* Open positions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Open Positions {jobs.length > 0 && <span className="text-slate-400 font-normal text-base">({jobs.length})</span>}
        </h2>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
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
                      {job.seniority && <span className="text-xs text-slate-400">{job.seniority}</span>}
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salaryMin && job.salaryMax
                            ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
                            : job.salaryMin ? `From ${formatCurrency(job.salaryMin)}`
                            : `Up to ${formatCurrency(job.salaryMax!)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0">{formatRelativeTime(job.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No open positions right now</p>
          </div>
        )}
      </div>
    </div>
  );
}
