'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn, getDisplayName, getInitials } from '@/lib/utils';
import {
  Home, Briefcase, FileText, Users, MessageSquare, Building,
  ShieldCheck, PlusCircle, LayoutGrid, Zap, Globe, BarChart2, BookOpen,
  Settings, ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  group: string;
}

const navItems: NavItem[] = [
  // General — visible to everyone
  { name: 'Feed', href: '/feed', icon: Home, roles: ['Freelancer', 'Employer', 'Admin'], group: 'General' },
  { name: 'Jobs', href: '/jobs', icon: Briefcase, roles: ['Freelancer', 'Employer', 'Admin'], group: 'General' },
  { name: 'Community', href: '/community', icon: BookOpen, roles: ['Freelancer', 'Employer', 'Admin'], group: 'General' },
  { name: 'Companies', href: '/companies', icon: Building, roles: ['Freelancer', 'Employer', 'Admin'], group: 'General' },
  { name: 'Connections', href: '/connections', icon: Users, roles: ['Freelancer', 'Employer', 'Admin'], group: 'General' },
  { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['Freelancer', 'Employer', 'Admin'], group: 'General' },

  // Freelancer
  { name: 'My Applications', href: '/applications', icon: LayoutGrid, roles: ['Freelancer'], group: 'Work' },
  { name: 'Contracts', href: '/contracts', icon: FileText, roles: ['Freelancer'], group: 'Work' },

  // Employer
  { name: 'Post a Job', href: '/employer/jobs/new', icon: PlusCircle, roles: ['Employer'], group: 'Manage' },
  { name: 'My Jobs', href: '/employer/jobs', icon: LayoutGrid, roles: ['Employer'], group: 'Manage' },
  { name: 'Pipeline', href: '/employer/pipeline', icon: Zap, roles: ['Employer'], group: 'Manage' },
  { name: 'Agency', href: '/employer/agency', icon: Building, roles: ['Employer'], group: 'Manage' },
  { name: 'Analytics', href: '/employer/analytics', icon: BarChart2, roles: ['Employer'], group: 'Manage' },

  // Admin
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['Admin'], group: 'Admin' },
  { name: 'Tags & Jobs', href: '/admin/tags', icon: Globe, roles: ['Admin'], group: 'Admin' },
  { name: 'Disputes', href: '/admin/disputes', icon: ShieldCheck, roles: ['Admin'], group: 'Admin' },
  { name: 'Audit Log', href: '/admin/audit', icon: ShieldCheck, roles: ['Admin'], group: 'Admin' },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  if (!user) return null;

  const filtered = navItems.filter((item) => item.roles.includes(user.role));

  // Group items
  const groups = filtered.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 hidden md:flex flex-col z-40">

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {Object.entries(groups).map(([group, items], gi) => (
          <div key={group} className={cn(gi > 0 && 'mt-4')}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )} />
                    <span className="flex-1">{item.name}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom profile card */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={getDisplayName(user)} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-bold shrink-0">
              {getInitials(user.firstName, user.lastName, user.email)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate">{getDisplayName(user)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>
          <Link
            href="/profile/edit"
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Edit profile"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
