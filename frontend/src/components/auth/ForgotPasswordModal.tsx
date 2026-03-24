"use client";

import { useState } from 'react';
import { useRegisterStore } from '@/store/registerStore';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ErrorAlert from '@/components/common/ErrorAlert';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, error, forgotPassword } = useRegisterStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await forgotPassword(email);
    if (result.success) {
      setIsSubmitted(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Animated Construction Tape Banner */}
      <div className="bg-amber-400 overflow-hidden py-2 shadow-sm border-b border-black/5 shrink-0">
        <div className="whitespace-nowrap animate-marquee flex items-center">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-black font-black italic uppercase tracking-tighter text-xs mx-4 flex items-center">
              RESET <span className="mx-4 text-[6px]">●</span> PASSWORD <span className="mx-4 text-[6px]">●</span> RECOVER <span className="mx-4 text-[6px]">●</span>
            </span>
          ))}
        </div>
      </div>

      <div className="p-8 pt-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
            Reset <span className="text-amber-500">Password</span>
          </h2>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest leading-none">
            {isSubmitted ? "Check your inbox" : "Enter your email to continue"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-medium"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
              </div>
            </div>

            <div className="min-h-[40px]">
              <ErrorAlert 
                error={error} 
                title="Recovery Error" 
                code="PWD_003" 
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-black uppercase tracking-tighter py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group text-sm"
            >
              {isLoading ? 'Sending...' : (
                <>
                  <span>Send Reset Link</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto border border-green-100 rotate-3 shadow-lg shadow-green-500/10">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-zinc-900">Check your email</h3>
              <p className="text-zinc-500 text-sm font-medium">
                We&apos;ve sent a password reset link to <br/>
                <span className="font-bold text-zinc-900">{email}</span>
              </p>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-amber-600 hover:text-amber-700 text-xs font-black uppercase tracking-tighter underline underline-offset-4"
            >
              Didn&apos;t receive it? Try again
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <button 
            onClick={onBackToLogin}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-xs transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </button>
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
      `}</style>
    </Modal>
  );
}
