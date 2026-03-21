'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/api/authService';
import { getDisplayName, getInitials, formatDate } from '@/lib/utils';
import { Shield, User, Clock, Search, Loader2, Activity } from 'lucide-react';

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: getAllUsers });

  const users = (data?.data ?? [])
    .filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (search) {
        const name = getDisplayName(u).toLowerCase();
        return name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = (a as { lastLoginDate?: string }).lastLoginDate;
      const dateB = (b as { lastLoginDate?: string }).lastLoginDate;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
        <p className="text-slate-500 text-sm mt-1">User activity and account overview</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: data?.data?.length ?? 0, icon: User, color: 'blue' },
          { label: 'Verified', value: data?.data?.filter((u) => u.isEmailVerified).length ?? 0, icon: Shield, color: 'green' },
          { label: 'Admins', value: data?.data?.filter((u) => u.role === 'Admin').length ?? 0, icon: Activity, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-2xl p-4 border border-${color}-100 dark:border-${color}-800`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 text-${color}-500`} />
              <span className={`text-sm font-semibold text-${color}-700 dark:text-${color}-400`}>{label}</span>
            </div>
            <p className={`text-2xl font-bold text-${color}-700 dark:text-${color}-400`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
          <option value="">All roles</option>
          <option value="Admin">Admin</option>
          <option value="Employer">Employer</option>
          <option value="Freelancer">Freelancer</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">User</th>
                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">Last Login</th>
                <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const name = getDisplayName(u);
                const initials = getInitials(u.firstName, u.lastName, u.email);
                const loginDate = (u as { lastLoginDate?: string }).lastLoginDate;
                const loginIp = (u as { lastLoginIp?: string }).lastLoginIp;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0 overflow-hidden">
                          {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'Admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        u.role === 'Employer' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {u.role === 'Admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${u.isEmailVerified ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {u.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                        {u.isOnboarded && (
                          <span className="text-xs text-slate-400">Onboarded</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {loginDate ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(loginDate)}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">Never</span>
                      )}
                    </td>
                    <td className="p-4">
                      {loginIp ? (
                        <span className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {loginIp}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-slate-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
