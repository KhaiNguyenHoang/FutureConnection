"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const oauthLogin = useAuthStore((state) => state.oauthLogin);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing your sign in...');
  const hasCalled = useRef(false);

  useEffect(() => {
    const provider = params.provider as 'github' | 'google';
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (hasCalled.current) return;

    if (error) {
      setStatus('error');
      setMessage(searchParams.get('error_description') || 'Authentication failed');
      return;
    }

    if (!code || !provider) {
      setStatus('error');
      setMessage('Invalid callback parameters');
      return;
    }

    const completeLogin = async () => {
      try {
        hasCalled.current = true;
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUri = `${APP_URL}/auth/callback/${provider}`;
        
        console.log(`Exchanging code for ${provider}...`);
        const result = await oauthLogin(provider, code, redirectUri);
        
        if (result.success) {
          setStatus('success');
          setMessage('Successfully signed in! Redirecting...');
          setTimeout(() => {
            router.push('/feed');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(result.message || 'Failed to exchange authorization code');
        }
      } catch (err) {
        console.error('Fatal callback error:', err);
        setStatus('error');
        setMessage('A fatal error occurred during the authentication callback.');
      }
    };

    if (provider && code) {
      completeLogin();
    } else if (!error) {
      setStatus('error');
      setMessage('Missing authorization code or provider.');
    }
  }, [params.provider, searchParams, oauthLogin, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full -z-10 animate-pulse"></div>
          
          <div className="flex flex-col items-center space-y-6">
            {status === 'loading' && (
              <div className="relative">
                <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-green-100 p-4 rounded-full animate-in zoom-in duration-300">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-100 p-4 rounded-full animate-in zoom-in duration-300">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                {status === 'loading' ? 'Verifying' : status === 'success' ? 'Authenticated' : 'Login Failed'}
                {status === 'loading' && <span className="text-amber-500 animate-pulse">...</span>}
              </h1>
              <p className="text-zinc-500 font-medium max-w-xs mx-auto text-sm">
                {message}
              </p>
            </div>

            {status === 'error' && (
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all active:scale-[0.98] shadow-lg text-sm group"
              >
                <span>Back to Home</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Brand footer */}
        <div className="pt-12">
          <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]">
            FutureConnection Protocol
          </div>
        </div>
      </div>
    </div>
  );
}
