'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Mail, Loader2, Globe } from 'lucide-react';
import { resendVerification } from '@/api/authService';
import Link from 'next/link';
import { toast } from 'sonner';

function CheckYourEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const isReset = searchParams.get('type') === 'reset';
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!email || sending || sent) return;
    setSending(true);
    try {
      const res = await resendVerification(email);
      if (res.success) {
        setSent(true);
        toast.success('Email sent! Check your inbox.');
      } else {
        toast.error(res.message || 'Failed to resend.');
      }
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-blue-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h1>
          <p className="text-slate-500">
            {isReset ? `We sent a password reset link to` : `We sent a verification link to`}{' '}
            {email && <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>}
          </p>
          <p className="text-slate-400 text-sm mt-1">Check your spam folder if you don&apos;t see it.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          {!isReset && (
            <div>
              <p className="text-sm text-slate-500 mb-3">Didn&apos;t receive the email?</p>
              <button
                onClick={handleResend}
                disabled={sending || sent || !email}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {sent ? 'Email sent!' : 'Resend verification email'}
              </button>
            </div>
          )}
          <Link
            href="/login"
            className="block w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckYourEmailPage() {
  return (
    <Suspense>
      <CheckYourEmailContent />
    </Suspense>
  );
}
