'use client';

import { useQuery } from '@tanstack/react-query';
import { getContracts } from '@/api/contractService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate, getDisplayName } from '@/lib/utils';
import { FileText, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import type { ContractStatus } from '@/types';

const statusColors: Record<ContractStatus, string> = {
  PendingSignature: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Completed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Disputed: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Cancelled: 'bg-slate-100 text-slate-500',
};

export default function ContractsPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['contracts'], queryFn: getContracts });
  const contracts = data?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contracts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your freelance contracts</p>
        </div>
        <Link href="/contracts/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <PlusCircle className="w-4 h-4" />
          New Contract
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : contracts.length > 0 ? (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const other = user?.role === 'Employer' ? contract.freelancer : contract.client;
            return (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{contract.title}</h3>
                      {other && <p className="text-sm text-slate-500 mt-0.5">With {getDisplayName(other)}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[contract.status]}`}>
                      {contract.status.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(contract.budget)}</span>
                  </div>
                </div>
                {contract.endDate && (
                  <p className="text-xs text-slate-400 mt-2 ml-13">Due: {formatDate(contract.endDate)}</p>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No contracts yet</p>
          <p className="text-slate-400 text-sm mt-1">Create one to get started</p>
        </div>
      )}
    </div>
  );
}
