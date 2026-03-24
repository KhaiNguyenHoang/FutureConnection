"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Github, Mail, Chrome, ArrowRight, Lock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ErrorAlert from '@/components/common/ErrorAlert';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onForgotPassword, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.message || 'Login failed');
    }
    setIsLoading(false);
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${APP_URL}/auth/callback/${provider}`;

    if (provider === 'github') {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
    } else {
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      {/* Animated Construction Tape Banner INSIDE the modal */}
      <div className="bg-amber-400 overflow-hidden py-2 shadow-sm border-b border-black/5 shrink-0">
        <div className="whitespace-nowrap animate-marquee flex items-center">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-black font-black italic uppercase tracking-tighter text-xs mx-4 flex items-center">
              SIGN IN <span className="mx-4 text-[6px]">●</span> ACCESS ACCOUNT <span className="mx-4 text-[6px]">●</span>
            </span>
          ))}
        </div>
      </div>

      <div className="p-8 pt-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
            Welcome <span className="text-amber-500">Back</span>
          </h2>
          <p className="text-zinc-500 text-xs font-medium">Please enter your details to sign in.</p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 py-3 rounded-2xl transition-all font-bold text-zinc-700 text-sm active:scale-[0.98]"
          >
            <Chrome className="w-4 h-4 text-red-500" />
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black py-3 rounded-2xl transition-all font-bold text-white text-sm active:scale-[0.98]"
          >
            <Github className="w-4 h-4 text-white" />
            <span>GitHub</span>
          </button>
        </div>

        <div className="flex items-center gap-4 py-1">
          <div className="h-[1px] flex-1 bg-zinc-100"></div>
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">or use email</span>
          <div className="h-[1px] flex-1 bg-zinc-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
                placeholder="name@example.com"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
            <div className="relative group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <div className="flex justify-end pr-1">
              <button 
                type="button"
                onClick={onForgotPassword}
                className="text-amber-600 hover:text-amber-700 text-[11px] font-black uppercase tracking-tighter underline underline-offset-4"
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="min-h-[40px]">
              <ErrorAlert 
                error={error} 
                title="Authentication Error" 
                code="AUTH_001" 
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-black uppercase tracking-tighter py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group text-sm"
            >
              {isLoading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-zinc-500 text-xs font-medium">
            New to FutureConnection?{' '}
            <button 
              onClick={onSwitchToRegister}
              className="text-zinc-900 hover:text-amber-600 font-black uppercase tracking-tighter underline underline-offset-4"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          width: max-content;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </Modal>
  );
}
