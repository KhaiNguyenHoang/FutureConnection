'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import { requestChangePasswordOtp, verifyChangePasswordOtp, changePassword } from '@/api/authService';
import { useAuthStore } from '@/store/authStore';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import { toast } from 'sonner';

type Step = 'request' | 'verify' | 'change' | 'done';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('request');
  const [otp, setOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  const requestOtp = async () => {
    setLoading(true);
    try {
      const res = await requestChangePasswordOtp();
      if (res.success) {
        toast.success('OTP sent to your email!');
        setStep('verify');
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch {
      toast.error('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyChangePasswordOtp(otp);
      if (res.success) {
        toast.success('OTP verified!');
        setStep('change');
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch {
      toast.error('Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const doChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await changePassword(user.id, currentPassword, newPassword);
      if (res.success) {
        setStep('done');
        setTimeout(() => router.push('/feed'), 2000);
      } else {
        toast.error(res.message || 'Password change failed');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h1>
        <p className="text-slate-500 mt-1 text-sm">Secure your account with a new password.</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(['Request OTP', 'Verify OTP', 'New Password'] as const).map((label, i) => {
          const stepMap: Step[] = ['request', 'verify', 'change'];
          const stepIndex = stepMap.indexOf(step);
          const active = i === stepIndex;
          const done = i < stepIndex || step === 'done';
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{label}</span>
              {i < 2 && <div className="w-8 h-px bg-slate-200 dark:bg-slate-700" />}
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        {step === 'request' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Request a One-Time Password</h2>
              <p className="text-sm text-slate-500 mt-1">We&apos;ll send a 6-digit OTP to <span className="font-medium">{user.email}</span></p>
            </div>
            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send OTP
            </button>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Enter your OTP</h2>
              <p className="text-sm text-slate-500">Enter the 6-digit code sent to {user.email}</p>
            </div>
            <div>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify OTP
            </button>
            <button type="button" onClick={requestOtp} className="w-full text-sm text-slate-500 hover:text-blue-600 transition-colors">
              Resend OTP
            </button>
          </form>
        )}

        {step === 'change' && (
          <form onSubmit={doChange} className="space-y-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Set your new password</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={newPassword} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm new password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              {confirm && newPassword !== confirm && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
            </div>
            <button
              type="submit"
              disabled={loading || (!!confirm && newPassword !== confirm)}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Password changed successfully!</h2>
            <p className="text-sm text-slate-500">Redirecting you back…</p>
          </div>
        )}
      </div>
    </div>
  );
}
