"use client";

import Modal from "@/components/ui/Modal";
import { ScrollText, ShieldCheck, Construction, FileText } from "lucide-react";
import { useSupportStore } from "@/store/supportStore";
import { useEffect } from "react";
import ReactMarkdown from 'react-markdown';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export default function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  const isPrivacy = type === 'privacy';
  const { policies, fetchPolicies, isLoading } = useSupportStore();

  useEffect(() => {
    if (isOpen) {
      fetchPolicies();
    }
  }, [isOpen, fetchPolicies]);

  const currentPolicy = policies.find(p => p.type === type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="relative overflow-hidden pt-12">
        {/* Animated Header Banner */}
        <div className="absolute top-0 left-0 w-full h-12 bg-amber-500 border-b-4 border-black flex items-center overflow-hidden whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-black font-black text-[10px] uppercase tracking-[0.3em] px-8">
              {isPrivacy ? "Privacy Protocol // Data Shield" : "Legal Framework // Terms of Service"}
            </span>
          ))}
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-black text-amber-500 flex items-center justify-center shrink-0 shadow-xl shadow-black/10">
              {isPrivacy ? <ShieldCheck size={32} /> : <ScrollText size={32} />}
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black">
                {isPrivacy ? "Privacy" : "Terms of"} <span className="text-amber-500">{isPrivacy ? "Policy" : "Service"}</span>
              </h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                {currentPolicy ? `Last Updated: ${new Date().toLocaleDateString()} // v${currentPolicy.version}` : 'Loading protocol...'}
              </p>
            </div>
          </div>

          <div className="prose prose-zinc prose-sm max-w-none h-[450px] overflow-y-auto pr-4 scroll-smooth hide-scrollbar hover-scrollbar space-y-6 text-zinc-600 font-medium leading-relaxed">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Synchronizing Protocols...</p>
               </div>
            ) : currentPolicy ? (
               <ReactMarkdown>{currentPolicy.content}</ReactMarkdown>
            ) : (
               <div className="p-10 text-center space-y-4">
                  <Construction className="mx-auto text-amber-500" size={48} />
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Protocol not yet established in this region.</p>
               </div>
            )}
          </div>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              <FileText size={14} /> Ref: {currentPolicy ? `FC_LEGAL_${currentPolicy.id.slice(0, 6).toUpperCase()}` : 'REF_PENDING'}
            </div>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-black text-white font-black uppercase tracking-tighter rounded-xl hover:bg-zinc-800 transition-all active:scale-95"
            >
              Acknowledged
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
