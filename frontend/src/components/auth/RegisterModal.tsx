import { useRegisterStore } from '@/store/registerStore';
import { useModalStore } from '@/store/modalStore';
import { User, Mail, Lock, ArrowRight, UserCircle, Briefcase, Code, CheckCircle2, Github, Chrome } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ErrorAlert from '@/components/common/ErrorAlert';
import { useState } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onSuccess }: RegisterModalProps) {
  const { firstName, lastName, email, password, confirmPassword, roleId, isLoading, error, setField, submit, resendVerification } = useRegisterStore();
  const { openPrivacy, openTerms } = useModalStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submit();
    if (result.success) {
      setIsSuccess(true);
    }
  };

  const handleResend = async () => {
    const result = await resendVerification(email);
    setResendStatus({ success: result.success, message: result.message || (result.success ? "Verification email resent!" : "Failed to resend") });
    setTimeout(() => setResendStatus(null), 5000);
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

  const roles = [
    { id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', name: 'Employer', icon: Briefcase, description: 'HR / Hiring' },
    { id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', name: 'Freelancer', icon: Code, description: 'Developer' },
    { id: '', name: 'Regular User', icon: UserCircle, description: 'Default' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Animated Construction Tape Banner INSIDE the modal */}
      <div className="bg-amber-400 overflow-hidden py-2 shadow-sm border-b border-black/5 shrink-0">
        <div className="whitespace-nowrap animate-marquee flex items-center">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-black font-black italic uppercase tracking-tighter text-xs mx-4 flex items-center">
              SIGN UP <span className="mx-4 text-[6px]">●</span> CREATE PROFILE <span className="mx-4 text-[6px]">●</span> JOIN FC <span className="mx-4 text-[6px]">●</span>
            </span>
          ))}
        </div>
      </div>

      {isSuccess ? (
        <div className="p-8 py-12 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900">
              Check Your <span className="text-amber-500">Inbox</span>
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              We've sent a verification link to <span className="text-zinc-900 font-bold">{email}</span>. 
              Please click the link to activate your account.
            </p>
          </div>
          
          <div className="pt-4 space-y-4">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Didn't receive the email?
            </div>
            <button 
              onClick={handleResend}
              disabled={isLoading}
              className="text-amber-600 hover:text-amber-500 font-black uppercase tracking-tighter underline underline-offset-4 disabled:opacity-50"
            >
              {isLoading ? 'Resending...' : 'Resend Verification'}
            </button>

            {resendStatus && (
              <p className={`text-[11px] font-bold ${resendStatus.success ? 'text-green-600' : 'text-red-600'} animate-in fade-in slide-in-from-top-1`}>
                {resendStatus.message}
              </p>
            )}
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-tighter py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/20 text-sm mt-8"
          >
            Got it, close
          </button>
        </div>
      ) : (
        <div className="p-8 pt-6 space-y-5 overflow-y-auto max-h-[92vh]">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
              Join <span className="text-amber-500">With Us</span>
            </h2>
            <p className="text-zinc-500 text-xs font-medium">Build your professional future today.</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">First Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
                    placeholder="John"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Last Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
                    placeholder="Doe"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setField('password', e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Confirm Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 pl-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Choose Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = roleId === role.id;
                  return (
                    <button
                      key={role.name}
                      type="button"
                      onClick={() => setField('roleId', role.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all space-y-1 group ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-amber-500' : 'text-zinc-500 group-hover:text-zinc-900'}`} />
                      <div className="text-center">
                        <div className={`text-xs font-black uppercase tracking-tighter ${isSelected ? 'text-zinc-900' : 'text-zinc-600'}`}>
                          {role.name}
                        </div>
                        <div className="text-[9px] text-zinc-500 font-bold whitespace-nowrap">{role.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="min-h-[40px]">
                <ErrorAlert 
                  error={error} 
                  title="Registration Error" 
                  code="REG_002" 
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-black uppercase tracking-tighter py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group text-sm"
              >
                {isLoading ? 'Processing...' : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 font-bold text-center uppercase tracking-widest leading-relaxed mt-2">
                By joining, you agree to our <br/>
                <button onClick={openTerms} className="text-amber-600 hover:underline">Terms of Protocol</button> & <button onClick={openPrivacy} className="text-amber-600 hover:underline">Privacy Shield</button>
              </p>
            </div>
          </form>

          <div className="text-center pt-2 pb-2">
            <p className="text-zinc-500 text-xs font-medium">
              Already have an account?{' '}
              <button 
                onClick={onSwitchToLogin}
                className="text-zinc-900 hover:text-amber-600 font-black uppercase tracking-tighter underline underline-offset-4"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      )}

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
