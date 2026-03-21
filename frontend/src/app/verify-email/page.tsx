'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Globe } from 'lucide-react';
import { verifyEmail } from '@/api/authService';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        if (res.success) {
          setStatus('success');
          // Update auth store if user is logged in
          if (user) updateUser({ isEmailVerified: true });
          setTimeout(() => router.push(user?.isOnboarded ? '/feed' : '/onboarding'), 2500);
        } else {
          setStatus('error');
          setMessage(res.message || 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed. The link may have expired or already been used.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verifying your email…</h1>
            <p className="text-slate-500">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email verified!</h1>
            <p className="text-slate-500">Your email has been verified successfully. Redirecting you now…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification failed</h1>
            <p className="text-slate-500">{message}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
