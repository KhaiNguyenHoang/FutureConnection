'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, XCircle, Globe } from 'lucide-react';
import { oauthGitHub, oauthGoogle } from '@/api/authService';
import { useAuthStore } from '@/store/authStore';

function OAuthCallbackContent({ params }: { params: Promise<{ provider: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errParam = searchParams.get('error');

    if (errParam) {
      setError('OAuth authorization was denied. Please try again.');
      return;
    }

    if (!code) {
      setError('No authorization code received.');
      return;
    }

    params.then(({ provider }) => {
      const oauthFn = provider === 'github' ? oauthGitHub : provider === 'google' ? oauthGoogle : null;

      if (!oauthFn) {
        setError(`Unknown OAuth provider: ${provider}`);
        return;
      }

      oauthFn(code)
        .then((res) => {
          if (res.success && res.data) {
            setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
            router.push(res.data.isNewUser || !res.data.user.isOnboarded ? '/onboarding' : '/feed');
          } else {
            setError(res.message || 'OAuth authentication failed.');
          }
        })
        .catch(() => {
          setError('OAuth authentication failed. Please try again.');
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Authentication Failed</h1>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <Globe className="w-9 h-9 text-white" />
        </div>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
        <p className="text-slate-500">Completing sign-in…</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage({ params }: { params: Promise<{ provider: string }> }) {
  return (
    <Suspense>
      <OAuthCallbackContent params={params} />
    </Suspense>
  );
}
