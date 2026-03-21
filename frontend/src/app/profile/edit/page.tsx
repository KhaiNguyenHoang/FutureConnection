'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile, updateProfile,
  getOpenSource, addOpenSource, deleteOpenSource,
  getSocialMedia, addSocialMedia,
} from '@/api/profileService';
import { uploadAvatar } from '@/api/authService';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Loader2, PlusCircle, Trash2, Github, ExternalLink, Camera } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const INPUT_CLS = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();

  const [form, setForm] = useState({ bio: '', location: '', website: '', headline: '', skills: '' });
  const [initialized, setInitialized] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadAvatarMutation, isPending: uploadingAvatar } = useMutation({
    mutationFn: (file: File) => uploadAvatar(user!.id, file),
    onSuccess: (result) => {
      if (result.data?.avatarUrl) updateUser({ avatarUrl: result.data.avatarUrl });
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  // Open source form
  const [osForm, setOsForm] = useState({ repoName: '', repoUrl: '', description: '', mergedPrs: '' });
  const [showOsForm, setShowOsForm] = useState(false);

  // Social media form
  const [smForm, setSmForm] = useState({ platform: '', url: '' });
  const [showSmForm, setShowSmForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });
  const { data: osData } = useQuery({
    queryKey: ['open-source', user?.id],
    queryFn: () => getOpenSource(user!.id),
    enabled: !!user,
  });
  const { data: smData } = useQuery({
    queryKey: ['social-media', user?.id],
    queryFn: () => getSocialMedia(user!.id),
    enabled: !!user,
  });

  if (data?.data && !initialized) {
    const p = data.data;
    setForm({ bio: p.bio || '', location: p.location || '', website: p.website || '', headline: p.headline || '', skills: (p.skills || []).join(', ') });
    setInitialized(true);
  }

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: () => updateProfile(user!.id, {
      bio: form.bio || undefined,
      location: form.location || undefined,
      website: form.website || undefined,
      headline: form.headline || undefined,
      skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    }),
    onSuccess: () => { toast.success('Profile updated!'); router.push('/profile'); },
    onError: () => toast.error('Failed to update profile'),
  });

  const { mutate: addOs, isPending: addingOs } = useMutation({
    mutationFn: () => addOpenSource(user!.id, {
      repoName: osForm.repoName,
      repoUrl: osForm.repoUrl,
      description: osForm.description || undefined,
      mergedPrs: Number(osForm.mergedPrs) || 0,
    }),
    onSuccess: () => {
      toast.success('Contribution added!');
      setOsForm({ repoName: '', repoUrl: '', description: '', mergedPrs: '' });
      setShowOsForm(false);
      qc.invalidateQueries({ queryKey: ['open-source', user?.id] });
    },
    onError: () => toast.error('Failed to add contribution'),
  });

  const { mutate: removeOs } = useMutation({
    mutationFn: (id: string) => deleteOpenSource(id),
    onSuccess: () => { toast.success('Removed'); qc.invalidateQueries({ queryKey: ['open-source', user?.id] }); },
  });

  const { mutate: addSm, isPending: addingSm } = useMutation({
    mutationFn: () => addSocialMedia(user!.id, { platform: smForm.platform, url: smForm.url }),
    onSuccess: () => {
      toast.success('Social link added!');
      setSmForm({ platform: '', url: '' });
      setShowSmForm(false);
      qc.invalidateQueries({ queryKey: ['social-media', user?.id] });
    },
    onError: () => toast.error('Failed to add social link'),
  });

  if (!user) { router.push('/login'); return null; }
  if (isLoading && !initialized) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const openSourceList = osData?.data ?? [];
  const socialMediaList = smData?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>

      {/* Avatar upload */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xl font-bold overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.firstName?.[0] ?? user?.email?.[0] ?? '?'}{user?.lastName?.[0] ?? ''}</span>
              )}
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-slate-500 dark:text-slate-400">JPG, PNG or GIF · Max 5 MB</p>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
              {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatarMutation(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white">Basic Info</h2>
        {([['headline', 'Headline', 'text', 'e.g. Senior Full-Stack Developer'], ['location', 'Location', 'text', 'e.g. San Francisco, CA'], ['website', 'Website', 'url', 'https://yoursite.com']] as const).map(([field, label, type, placeholder]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
            <input type={type} value={form[field as keyof typeof form]} onChange={(e) => set(field, e.target.value)} placeholder={placeholder} className={INPUT_CLS} />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4} className={`${INPUT_CLS} resize-none`} placeholder="Tell people about yourself…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Skills (comma-separated)</label>
          <input type="text" value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, TypeScript, Node.js" className={INPUT_CLS} />
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/profile" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</Link>
          <button onClick={() => saveProfile()} disabled={savingProfile} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Open Source Contributions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">Open Source Contributions</h2>
          <button onClick={() => setShowOsForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />Add
          </button>
        </div>

        {showOsForm && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Repo Name *</label>
                <input value={osForm.repoName} onChange={(e) => setOsForm((f) => ({ ...f, repoName: e.target.value }))} placeholder="facebook/react" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Merged PRs</label>
                <input type="number" value={osForm.mergedPrs} onChange={(e) => setOsForm((f) => ({ ...f, mergedPrs: e.target.value }))} placeholder="0" min="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Repo URL *</label>
              <input value={osForm.repoUrl} onChange={(e) => setOsForm((f) => ({ ...f, repoUrl: e.target.value }))} placeholder="https://github.com/facebook/react" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
              <input value={osForm.description} onChange={(e) => setOsForm((f) => ({ ...f, description: e.target.value }))} placeholder="What did you contribute?" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowOsForm(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={() => addOs()} disabled={addingOs || !osForm.repoName || !osForm.repoUrl} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {addingOs && <Loader2 className="w-3 h-3 animate-spin" />}Add
              </button>
            </div>
          </div>
        )}

        {openSourceList.length > 0 ? (
          <div className="space-y-2">
            {openSourceList.map((os) => (
              <div key={os.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Github className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{os.repoName}</p>
                  {os.description && <p className="text-xs text-slate-400 truncate">{os.description}</p>}
                  <p className="text-xs text-slate-400">{os.mergedPrs} merged PR{os.mergedPrs !== 1 ? 's' : ''}</p>
                </div>
                <a href={os.repoUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => removeOs(os.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-3">No contributions added yet</p>
        )}
      </div>

      {/* Social Media Links */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">Social Links</h2>
          <button onClick={() => setShowSmForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />Add
          </button>
        </div>

        {showSmForm && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Platform *</label>
                <select value={smForm.platform} onChange={(e) => setSmForm((f) => ({ ...f, platform: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select…</option>
                  {['GitHub', 'LinkedIn', 'Twitter', 'YouTube', 'Instagram', 'Website', 'Other'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">URL *</label>
                <input value={smForm.url} onChange={(e) => setSmForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://…" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSmForm(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={() => addSm()} disabled={addingSm || !smForm.platform || !smForm.url} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {addingSm && <Loader2 className="w-3 h-3 animate-spin" />}Add
              </button>
            </div>
          </div>
        )}

        {socialMediaList.length > 0 ? (
          <div className="space-y-2">
            {socialMediaList.map((sm) => (
              <div key={sm.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{sm.platform}</p>
                  <a href={sm.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate block">{sm.url}</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-3">No social links added yet</p>
        )}
      </div>
    </div>
  );
}
