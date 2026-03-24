"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home, Construction } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl relative">
        {/* Decorative Construction Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full" />
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute h-px bg-amber-500/20 w-full" 
              style={{ top: `${i * 5}%` }} 
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 text-center space-y-8">
          {/* Warning Icon */}
          <div className="inline-flex flex-col items-center">
             <div className="w-24 h-24 rounded-3xl bg-amber-500 text-black flex items-center justify-center shadow-2xl shadow-amber-500/20 -rotate-3 mb-6 relative group">
                <AlertTriangle size={48} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-black italic text-amber-500">!</span>
                </div>
             </div>
             <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <Construction size={14} /> System Protocol Failure
             </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight">
              Major <span className="text-amber-500">Incident</span> Detected
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
              We&apos;ve encountered a critical system interruption. Our team is already on-site investigating the protocol failure.
            </p>
          </div>

          {/* Error Details (Minimalist) */}
          <div className="py-4 border-y border-white/5 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Trace Digest</span>
            <code className="text-xs font-bold text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              {error.digest || "SYS_UNKNOWN_INTERRUPT"}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-tighter rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 group"
            >
              <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              Reset Protocol
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-tighter rounded-2xl transition-all border border-white/10 backdrop-blur-md flex items-center justify-center gap-3"
            >
              <Home size={18} />
              Platform Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
