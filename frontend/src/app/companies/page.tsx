'use client';
import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '@/api/companyService';
import { Building, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function CompaniesPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['companies'], queryFn: getCompanies });
  const companies = data?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Companies</h1>
        {user?.role === 'Employer' && (
          <Link href="/companies/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-4 h-4" />Create Company
          </Link>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : companies.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {companies.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="w-full h-full rounded-xl object-cover" /> : <Building className="w-6 h-6 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{c.name}</h3>
                {c.industry && <p className="text-sm text-slate-500 mt-0.5">{c.industry}</p>}
                {c.location && <p className="text-xs text-slate-400 mt-0.5">{c.location}</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16"><Building className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No companies yet</p></div>
      )}
    </div>
  );
}
