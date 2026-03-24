"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Settings, 
  HelpCircle, 
  LogOut,
  LogIn,
  UserPlus,
  MessageSquare,
  Search,
  User,
  Building,
  Rss,
  MessageCircle,
  Briefcase,
  AlertCircle,
  ShieldAlert,
  CheckCircle2
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useModalStore } from "@/store/modalStore";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import PolicyModal from "@/components/common/PolicyModal";
import SupportModal from "@/components/common/SupportModal";
import { useRegisterStore } from "@/store/registerStore";

export default function Sidebar({ isFixed = true }: { isFixed?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { resendVerification, isLoading } = useRegisterStore();
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null);
  const { 
    isLoginOpen, 
    isRegisterOpen, 
    isForgotPasswordOpen,
    isPrivacyOpen,
    isTermsOpen,
    isSupportOpen,
    openLogin, 
    closeLogin, 
    openRegister, 
    closeRegister,
    openForgotPassword,
    closeForgotPassword,
    closePrivacy,
    closeTerms,
    openSupport,
    closeSupport
  } = useModalStore();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 h-screen bg-white border-r border-neutral-200 z-40 w-20 flex flex-col py-6" />
    );
  }

  const handleLogout = () => {
    logout();
    if (window.location.pathname === '/' || window.location.pathname === '/feed') {
      // Stay put or reload
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  const handleOpenLogin = () => {
    openLogin();
  };

  const handleOpenRegister = () => {
    openRegister();
  };

  const handleForgotPassword = () => {
    openForgotPassword();
  };

  const handleAuthSuccess = () => {
    closeLogin();
    closeRegister();
    closeForgotPassword();
    if (window.location.pathname === '/' || window.location.pathname === '/login') {
      router.push('/feed');
    }
  };

  const getMenuItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { icon: Home, label: "Home", href: "/" },
        { icon: Rss, label: "Feed", href: "/feed" },
        { icon: MessageCircle, label: "Q&A", href: "/qa" },
        { icon: Briefcase, label: "Job", href: "/jobs" },
      ];
    }

    const isEmployer = user.role === 'Employer' || user.role === 'Company';

    if (isEmployer) {
      return [
        { icon: Home, label: "Home", href: "/" },
        { icon: MessageSquare, label: "Chat", href: "/chat" },
        { icon: Briefcase, label: "Job", href: "/jobs" },
        { icon: Rss, label: "Feed", href: "/feed" },
        { icon: User, label: "Profile", href: "/profile" },
        { icon: Building, label: "Company", href: "/company" },
        { icon: Search, label: "Find", href: "/find" },
      ];
    }

    // Default for Freelancer (Dev) or Regular User
    return [
      { icon: Home, label: "Home", href: "/" },
      { icon: Rss, label: "Feed", href: "/feed" },
      { icon: MessageCircle, label: "Q&A", href: "/qa" },
      { icon: MessageSquare, label: "Chat", href: "/chat" },
      { icon: Briefcase, label: "Job", href: "/jobs" },
      { icon: User, label: "Profile", href: "/profile" },
      { icon: Search, label: "Find", href: "/find" },
    ];
  };

  const menuItems = getMenuItems();

  const bottomItems = [
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HelpCircle, label: "Support", href: "/support" },
  ];

  return (
    <>
      <aside
        className={`${isFixed ? "fixed left-0 top-0" : "relative"} h-screen bg-white border-r border-neutral-200 z-40 transition-all duration-500 ease-in-out flex flex-col ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-10 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black hover:bg-neutral-900 hover:text-white transition-colors shadow-lg"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Logo Section */}
        <div className="p-6 flex items-center gap-4">
          <div className="min-w-[32px] w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
            <span className="text-amber-400 font-black text-xl italic">F</span>
          </div>
          <span className={`font-bold tracking-tighter text-xl text-black transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
            Future<span className="text-amber-500">Connection</span>
          </span>
        </div>

        {/* User Profile (if logged in) */}
        {isAuthenticated && user && (
          <div className="flex flex-col gap-2">
            <div className="px-4 py-2 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200 overflow-hidden shrink-0 relative">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.firstName} fill sizes="40px" className="object-cover" />
                ) : (
                  <span className="text-black font-bold uppercase">{user.firstName[0]}{user.lastName[0]}</span>
                )}
              </div>
              <div className={`transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
                <p className="text-sm font-bold text-black truncate">{user.firstName} {user.lastName}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  {user.isEmailVerified && <CheckCircle2 size={10} className="text-green-500 shrink-0" />}
                </div>
              </div>
            </div>

            {/* Email Verification Warning */}
            {(!user.isEmailVerified) && (
              <div className={`mx-4 p-3 rounded-xl bg-amber-50 border border-amber-200 transition-all duration-300 ${isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"}`}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Email Not Verified</p>
                    <button 
                      onClick={async () => {
                        const result = await resendVerification(user.email);
                        setResendStatus({ success: result.success, message: result.message || (result.success ? "Sent!" : "Error") });
                        setTimeout(() => setResendStatus(null), 3000);
                      }}
                      disabled={isLoading}
                      className="text-[9px] font-black text-amber-600 hover:text-amber-700 underline underline-offset-2 uppercase tracking-widest mt-1 disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : resendStatus?.message || "Resend Link"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Minimal mode verification badge */}
            {!isExpanded && !user.isEmailVerified && (
              <div className="absolute top-28 left-14">
                <div className="w-4 h-4 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle size={8} className="text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Menu */}
        <nav className={`flex-1 px-4 py-8 space-y-2 overflow-y-auto ${!isExpanded ? "scrollbar-none" : ""}`}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`flex items-center rounded-xl hover:bg-neutral-100 group transition-all relative ${isExpanded ? "gap-4 p-3" : "justify-center p-3"}`}
            >
              <item.icon size={22} className="text-neutral-400 group-hover:text-amber-500 transition-colors shrink-0" />
              <span className={`text-sm font-medium text-neutral-600 group-hover:text-black transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "absolute opacity-0 -translate-x-4 pointer-events-none"}`}>
                {item.label}
              </span>
              
              {/* Tooltip for minimal mode */}
              {!isExpanded && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-white/10" />
                </div>
              )}
            </a>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-4 py-6 border-t border-neutral-100 space-y-2 relative">
          {bottomItems.map((item, index) => {
            const isSupport = item.label === "Support";
            const isSettings = item.label === "Settings";
            const Component = (isSupport || isSettings) ? 'button' : 'a';
            return (
              <div key={index} className="relative">
                <Component
                  href={(!isSupport && !isSettings) ? item.href : undefined}
                  onClick={isSupport ? openSupport : isSettings ? () => setIsSettingsOpen(!isSettingsOpen) : undefined}
                  className={`w-full flex items-center rounded-xl hover:bg-neutral-100 group transition-all relative ${isExpanded ? "gap-4 p-3" : "justify-center p-3"}`}
                >
                  <item.icon size={22} className={`text-neutral-400 group-hover:text-amber-500 transition-colors shrink-0 ${isSettings && isSettingsOpen ? '!text-amber-500' : ''}`} />
                  <span className={`text-sm font-medium text-neutral-600 group-hover:text-black transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "absolute opacity-0 -translate-x-4 pointer-events-none"} ${isSettings && isSettingsOpen ? '!text-black' : ''}`}>
                    {item.label}
                  </span>

                  {/* Tooltip for minimal mode */}
                  {!isExpanded && !isSettingsOpen && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-white/10" />
                    </div>
                  )}
                </Component>

                {/* Settings Popup Menu */}
                {isSettings && isSettingsOpen && (
                  <div className={`absolute bottom-full mb-2 ${isExpanded ? 'left-0 w-full' : 'left-full ml-4 w-48'} bg-white border border-zinc-200 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                    <button 
                      onClick={() => { setIsSettingsOpen(false); router.push('/settings/profile'); }} 
                      className="w-full text-left px-3 py-2 text-sm font-bold text-zinc-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User size={16} /> Profile Settings
                    </button>
                    <button 
                      onClick={() => { setIsSettingsOpen(false); router.push('/settings/account'); }} 
                      className="w-full text-left px-3 py-2 text-sm font-bold text-zinc-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Settings size={16} /> Account & Security
                    </button>
                    {/* Add invisible arrow for mini mode */}
                    {!isExpanded && (
                      <div className="absolute left-0 bottom-6 -translate-x-1/2 w-3 h-3 bg-white border-l border-b border-zinc-200 rotate-45" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center rounded-xl hover:bg-red-50 group transition-all mt-4 relative ${isExpanded ? "gap-4 p-3" : "justify-center p-3"}`}
            >
              <LogOut size={22} className="text-neutral-400 group-hover:text-red-500 transition-colors shrink-0" />
              <span className={`text-sm font-medium text-neutral-600 group-hover:text-red-500 transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "absolute opacity-0 -translate-x-4 pointer-events-none"}`}>
                Logout
              </span>
              {!isExpanded && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
                  Logout
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-white/10" />
                </div>
              )}
            </button>
          ) : (
            <div className={`space-y-2 ${isExpanded ? "mt-4" : "mt-2"}`}>
              <button
                onClick={handleOpenLogin}
                className={`w-full flex items-center rounded-xl hover:bg-amber-50 group transition-all relative ${isExpanded ? "gap-4 p-3" : "justify-center p-3"}`}
              >
                <LogIn size={22} className="text-neutral-400 group-hover:text-amber-500 transition-colors shrink-0" />
                <span className={`text-sm font-medium text-neutral-600 group-hover:text-amber-600 transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "absolute opacity-0 -translate-x-4 pointer-events-none"}`}>
                  Sign In
                </span>
                {!isExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
                    Sign In
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-white/10" />
                  </div>
                )}
              </button>
              <button
                onClick={handleOpenRegister}
                className={`w-full flex items-center rounded-xl hover:bg-black group transition-all relative ${isExpanded ? "gap-4 p-3" : "justify-center p-3"}`}
              >
                <UserPlus size={22} className="text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                <span className={`text-sm font-medium text-neutral-600 group-hover:text-white transition-all duration-300 ${isExpanded ? "opacity-100 translate-x-0" : "absolute opacity-0 -translate-x-4 pointer-events-none"}`}>
                  Register
                </span>
                {!isExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
                    Register
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-white/10" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={closeLogin} 
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={handleOpenRegister}
        onForgotPassword={handleForgotPassword}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={closeRegister} 
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={handleOpenLogin}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={closeForgotPassword}
        onBackToLogin={handleOpenLogin}
      />

      <PolicyModal 
        isOpen={isPrivacyOpen} 
        onClose={closePrivacy} 
        type="privacy" 
      />

      <PolicyModal 
        isOpen={isTermsOpen} 
        onClose={closeTerms} 
        type="terms" 
      />

      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={closeSupport} 
      />
    </>
  );
}
