'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllDisputes, resolveDispute } from '@/api/contractService';
import { formatRelativeTime } from '@/lib/utils';
import { AlertTriangle, Loader2, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { DisputeStatus } from '@/types';

const statusColors: Record<DisputeStatus, string> = {
  Open: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  UnderReview: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Resolved: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

export default function AdminDisputesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | ''>('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['all-disputes'], queryFn: getAllDisputes });

  const { mutate: resolve, isPending: resolving } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DisputeStatus }) => resolveDispute(id, status),
    onSuccess: () => {
      toast.success('Dispute updated');
      setResolvingId(null);
      qc.invalidateQueries({ queryKey: ['all-disputes'] });
    },
    onError: () => toast.error('Failed to update dispute'),
  });

  const disputes = (data?.data ?? []).filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (search && !d.reason.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount = data?.data?.filter((d) => d.status === 'Open').length ?? 0;
  const reviewCount = data?.data?.filter((d) => d.status === 'UnderReview').length ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispute Resolution</h1>
        <p className="text-slate-500 text-sm mt-1">{data?.data?.length ?? 0} total disputes</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Open</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{openCount}</p>
          <p className="text-xs text-red-500 mt-0.5">Requires attention</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 border border-yellow-100 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Under Review</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{reviewCount}</p>
          <p className="text-xs text-yellow-500 mt-0.5">Being investigated</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reason…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DisputeStatus | '')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="UnderReview">Under Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Disputes list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : disputes.length > 0 ? (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[dispute.status ?? 'Open']}`}>
                        {(dispute.status ?? 'Open').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-xs text-slate-400">Contract: {dispute.contractId.slice(0, 8)}…</span>
                      <span className="text-xs text-slate-400">{formatRelativeTime(dispute.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{dispute.reason}</p>
                    {dispute.resolution && (
                      <div className="mt-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs font-medium text-green-700 dark:text-green-400">Resolution</p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{dispute.resolution}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {(dispute.status === 'Open' || dispute.status === 'UnderReview') && (
                  <div className="flex gap-2 shrink-0">
                    {dispute.status === 'Open' && (
                      <button
                        disabled={resolving && resolvingId === dispute.id}
                        onClick={() => { setResolvingId(dispute.id); resolve({ id: dispute.id, status: 'UnderReview' }); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 text-xs font-semibold hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors disabled:opacity-60"
                      >
                        Review
                      </button>
                    )}
                    <button
                      disabled={resolving && resolvingId === dispute.id}
                      onClick={() => { setResolvingId(dispute.id); resolve({ id: dispute.id, status: 'Resolved' }); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                    <button
                      disabled={resolving && resolvingId === dispute.id}
                      onClick={() => { setResolvingId(dispute.id); resolve({ id: dispute.id, status: 'Closed' }); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No disputes found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search || statusFilter ? 'Try adjusting your filters' : 'All contracts are running smoothly'}
          </p>
        </div>
      )}
    </div>
  );
}
