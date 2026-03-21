'use client';

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/api/profileService';
import { useAuthStore } from '@/store/authStore';
import { getDisplayName, getInitials } from '@/lib/utils';
import { MapPin, Globe, Edit3, Loader2, User } from 'lucide-react';
import Link from 'next/link';

export default function MyProfilePage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  if (!user) return null;

  const profile = data?.data;
  const displayName = getDisplayName(user);
  const initials = getInitials(user.firstName, user.lastName, user.email);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-700" />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
          {profile?.headline && <p className="text-slate-600 dark:text-slate-400 mt-0.5">{profile.headline}</p>}

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
            {profile?.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
            )}
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {user.role}
            </span>
          </div>

          {profile?.bio && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      {profile?.skills && profile.skills.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Quick links */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Account</h2>
        <div className="space-y-2">
          <Link href="/account/settings" className="flex items-center justify-between py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
            <span>Account Settings</span>
            <span className="text-slate-300">→</span>
          </Link>
          <Link href="/account/change-password" className="flex items-center justify-between py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
            <span>Change Password</span>
            <span className="text-slate-300">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
