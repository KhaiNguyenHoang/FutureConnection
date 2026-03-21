'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { updateUser, deleteUser, uploadAvatar } from '@/api/authService';
import { useAuthStore } from '@/store/authStore';
import { getDisplayName, getInitials } from '@/lib/utils';
import { User, Mail, Phone, Upload, Trash2, Loader2, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, updateUser: updateStore, logout } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  if (!user) { router.push('/login'); return null; }

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      const res = await updateUser(user.id, form);
      if (!res.success) throw new Error(res.message);
      if (avatarFile) await uploadAvatar(user.id, avatarFile);
      return res.data;
    },
    onSuccess: (data) => {
      if (data) updateStore(data);
      toast.success('Settings saved!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: () => { logout(); },
    onError: () => toast.error('Failed to delete account'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>

      {/* Profile section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 dark:text-white">Profile Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xl font-bold overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
            ) : user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(user.firstName, user.lastName, user.email)
            )}
          </div>
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Change Photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={form.firstName} onChange={(e) => set('firstName', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
            <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="tel" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
        </div>

        <button onClick={() => save()} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white">Security</h2>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Password</p>
              <p className="text-xs text-slate-400">Change your account password</p>
            </div>
          </div>
          <Link href="/account/change-password" className="text-sm text-blue-600 hover:underline font-medium">Update</Link>
        </div>

        {user.externalProvider && (
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Connected Account</p>
              <p className="text-xs text-slate-400">Signed in via {user.externalProvider}</p>
            </div>
            <span className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full font-semibold">Connected</span>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 p-6 space-y-4">
        <h2 className="font-semibold text-red-600">Danger Zone</h2>
        <p className="text-sm text-slate-500">Once you delete your account, there is no going back.</p>
        <button
          onClick={() => { if (confirm('Are you absolutely sure? This cannot be undone.')) remove(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </div>
  );
}
