"use client";

import Link from "next/link";
import { ArrowLeft, Construction, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center grayscale brightness-50 opacity-60 scale-105"
        style={{ backgroundImage: "url('/images/error/404_bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[1]" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        {/* Animated Construction Tape Top */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[200%] h-12 bg-amber-500 border-y-4 border-black -rotate-6 flex items-center overflow-hidden whitespace-nowrap opacity-20">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="text-black font-black text-xs uppercase tracking-[0.3em] px-8">
              Section Closed // Restricted Area // 404
            </span>
          ))}
        </div>

        {/* Impactful Header */}
        <div className="mb-12 relative inline-block">
          <div className="absolute -inset-10 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
          <h1 className="text-[12rem] md:text-[18rem] font-black italic tracking-tighter text-white/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-amber-500 text-black flex items-center justify-center shadow-2xl shadow-amber-500/40 rotate-12 mb-6">
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-tight">
                Road <span className="text-amber-500">Closed</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-4">
            <p className="text-zinc-400 text-lg font-medium leading-relaxed">
              The page you are looking for is currently under construction or has been relocated within our ecosystem.
            </p>
            <div className="flex items-center justify-center gap-3 text-amber-500/60 font-black uppercase tracking-widest text-[10px]">
              <Construction size={14} />
              Protocol: ERROR_RESOURCE_NOT_FOUND
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-tighter rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Return Home
            </Link>
            <Link 
              href="/support"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-tighter rounded-2xl transition-all border border-white/10 backdrop-blur-md flex items-center justify-center gap-3"
            >
              Report Issue
            </Link>
          </div>
        </div>

        {/* Animated Construction Tape Bottom */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[200%] h-12 bg-amber-500 border-y-4 border-black rotate-6 flex items-center overflow-hidden whitespace-nowrap opacity-20">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="text-black font-black text-xs uppercase tracking-[0.3em] px-8">
              Access Denied // Maintenance // FutureConnection
            </span>
          ))}
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-[2] opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />
    </div>
  );
}
