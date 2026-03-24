"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRegisterStore } from '@/store/registerStore';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail, isLoading, error } = useRegisterStore();
  const { user, updateUser } = useAuthStore();
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    const result = await verifyEmail(token!);
    if (result.success) {
      setIsVerified(true);
      // If the verified user is currently logged in, update the local state
      if (user) {
        updateUser({ isEmailVerified: true });
      }
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-black uppercase tracking-tighter">Missing Token</h1>
        <p className="text-zinc-500">The verification link is invalid or has been tampered with.</p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden">
      {/* Decorative Top Bar */}
      <div className="h-2 bg-amber-500 w-full" />
      
      <div className="p-8 py-12 text-center space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-amber-500 mx-auto animate-spin" />
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tighter">Verifying...</h1>
              <p className="text-zinc-500">Securing your connection to the grid.</p>
            </div>
          </div>
        ) : isVerified ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">
                Email <span className="text-amber-500">Verified!</span>
              </h1>
              <p className="text-zinc-500 font-medium px-4">
                Your account is now fully active. You can now access all features of FutureConnection.
              </p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-tighter py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/20 text-sm flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <XCircle size={48} className="text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">
                Verification <span className="text-red-500">Failed</span>
              </h1>
              <p className="text-zinc-500 font-medium px-4">
                {error || "The link might be expired or already used. Please request a new verification link."}
              </p>
            </div>
            <div className="pt-4 space-y-4">
              <Link 
                href="/"
                className="block w-full text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-amber-600 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Suspense fallback={
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-500 mx-auto animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Grid...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
