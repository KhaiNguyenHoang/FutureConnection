"use client";

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, children, maxWidth = 'max-w-xl' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:p-6 sm:pb-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-white rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.15)] overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col custom-scrollbar`}
      >
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 z-50 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors"
        >
          <X size={20} />
        </button>
        
        {children}
      </div>
    </div>
  );
}
