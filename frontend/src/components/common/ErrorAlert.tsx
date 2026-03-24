"use client";

import { AlertTriangle, Construction, X } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
  onClear?: () => void;
  title?: string;
  code?: string;
}

export default function ErrorAlert({ error, onClear, title = "System Alert", code }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="relative overflow-hidden bg-amber-500 border-2 border-black rounded-2xl shadow-xl shadow-amber-500/20 animate-in slide-in-from-top-4 duration-500 mb-6 group">
      {/* Decorative Warning Pattern */}
      <div className="absolute top-0 left-0 w-full h-1.5 flex">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'} -skew-x-45`} />
        ))}
      </div>

      <div className="p-4 pt-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-black text-amber-500 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <AlertTriangle size={20} className="animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 bg-black/10 px-2 py-0.5 rounded-md">
              {code || "Error_v1"}
            </span>
            <h4 className="text-sm font-black italic uppercase tracking-tighter text-black truncate">
              {title}
            </h4>
          </div>
          <p className="text-xs font-bold text-black/80 leading-relaxed break-words">
            {error}
          </p>
        </div>

        {onClear && (
          <button 
            onClick={onClear}
            className="p-1.5 rounded-lg hover:bg-black/10 text-black/40 hover:text-black transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Construction Label */}
      <div className="px-4 py-1.5 bg-black/5 flex items-center gap-2 border-t border-black/5">
        <Construction size={12} className="text-black/60" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">
          FutureConnection // Emergency_Protocol
        </span>
      </div>

      {/* Bottom Warning Pattern */}
      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        {[...Array(40)].map((_, i) => (
          <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-black/20' : 'bg-transparent'} skew-x-45`} />
        ))}
      </div>
    </div>
  );
}
