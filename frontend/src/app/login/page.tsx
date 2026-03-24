"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/store/modalStore';

export default function LoginPage() {
  const router = useRouter();
  const openLogin = useModalStore((state) => state.openLogin);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    openLogin();
  }, [openLogin]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-2">Authentication Started</h1>
        <p className="text-zinc-500 text-sm font-medium mb-6">Please use the login modal to sign in.</p>
        <button 
           onClick={() => router.push('/')}
           className="text-amber-500 hover:text-amber-600 text-[10px] font-black tracking-widest uppercase transition-colors border border-amber-500/20 px-6 py-3 rounded-xl hover:bg-amber-50"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
