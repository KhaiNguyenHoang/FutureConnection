'use client';

import { useState } from 'react';
import { Mail, X, Loader2 } from 'lucide-react';
import { resendVerification } from '@/api/authService';
import { toast } from 'sonner';

export default function EmailVerificationBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await resendVerification(email);
      if (res.success) {
        toast.success('Verification email sent! Check your inbox.');
      } else {
        toast.error(res.message || 'Failed to send email.');
      }
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 shrink-0" />
        <span>Please verify your email address to access all features.</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleResend}
          disabled={sending}
          className="font-semibold underline underline-offset-2 hover:no-underline flex items-center gap-1 disabled:opacity-70"
        >
          {sending && <Loader2 className="w-3 h-3 animate-spin" />}
          Resend email
        </button>
        <button onClick={() => setDismissed(true)} className="p-0.5 hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
