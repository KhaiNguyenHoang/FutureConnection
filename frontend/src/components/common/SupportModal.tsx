"use client";

import { useState } from 'react';
import Modal from "@/components/ui/Modal";
import { 
  HelpCircle, 
  MessageSquare, 
  LifeBuoy, 
  Rocket, 
  Send, 
  Search,
  ChevronRight,
  ShieldCheck,
  Building,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useSupportStore } from '@/store/supportStore';
import { useEffect } from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'help' | 'ticket' | 'my-tickets'>('help');
  const [category, setCategory] = useState('Technical Support');
  const [urgency, setUrgency] = useState('Standard Flow');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const { faqs, myTickets, isLoading, fetchFAQs, fetchMyTickets, createTicket } = useSupportStore();

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'help') fetchFAQs();
      if (activeTab === 'my-tickets') fetchMyTickets();
    }
  }, [isOpen, activeTab, fetchFAQs, fetchMyTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    const result = await createTicket(category, urgency, description);
    setSubmitting(false);
    if (result.success) {
      setSubmitMessage("Ticket transmitted to the core. We'll be in touch.");
      setDescription('');
      setTimeout(() => setActiveTab('my-tickets'), 2000);
    } else {
      setSubmitMessage(`Failure: ${result.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <Clock size={14} className="text-amber-500" />;
      case 'resolved': return <CheckCircle2 size={14} className="text-emerald-500" />;
      default: return <AlertCircle size={14} className="text-zinc-400" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Left Sidebar - Navigation */}
        <div className="w-full md:w-64 bg-zinc-50 border-r border-zinc-100 p-8 space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-black text-amber-500 flex items-center justify-center shadow-lg shadow-black/10">
                <LifeBuoy size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-black">Support</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hub // v1.2</p>
             </div>
          </div>

          <div className="space-y-2">
            {[
              { id: 'help', label: 'Help Center', icon: HelpCircle },
              { id: 'ticket', label: 'Open Ticket', icon: MessageSquare },
              { id: 'my-tickets', label: 'My Tickets', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black uppercase tracking-tighter text-xs transition-all ${
                  activeTab === tab.id 
                    ? "bg-black text-white shadow-xl shadow-black/10 translate-x-1" 
                    : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-200 space-y-6">
             <div className="space-y-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Emergency Protocols</span>
               <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white rounded-xl border border-zinc-100 flex flex-col items-center gap-1">
                     <ShieldCheck size={14} className="text-amber-500" />
                     <span className="text-[9px] font-black uppercase text-black">Security</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-zinc-100 flex flex-col items-center gap-1">
                     <Building size={14} className="text-zinc-400" />
                     <span className="text-[9px] font-black uppercase text-zinc-400">Billing</span>
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Content - Main View */}
        <div className="flex-1 p-8 bg-white overflow-y-auto hide-scrollbar hover-scrollbar max-h-[600px]">
          {activeTab === 'help' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search the future..."
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                  />
               </div>

               <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                   <div className="w-1 h-3 bg-amber-500" /> Popular Protocols
                 </h4>
                 <div className="grid grid-cols-1 gap-3">
                    {faqs.length === 0 && !isLoading && (
                      <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest text-center py-10 italic">No protocols found in the database yet.</p>
                    )}
                    {faqs.map((faq, i) => (
                      <div key={faq.id} className="group p-4 rounded-2xl border border-zinc-100 hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all cursor-pointer flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black italic tracking-tighter text-black uppercase mb-1">{faq.question}</p>
                          <p className="text-xs font-medium text-zinc-500">{faq.answer}</p>
                        </div>
                        <ChevronRight size={18} className="text-zinc-300 group-hover:text-amber-500 transition-colors" />
                      </div>
                    ))}
                 </div>
               </div>

               <div className="p-6 bg-zinc-900 rounded-[2rem] text-white flex items-center justify-between overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                    <Rocket size={120} />
                  </div>
                  <div className="relative z-10 space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-500">Live Pilot Assistance</p>
                    <h5 className="text-lg font-black italic uppercase tracking-tighter leading-tight">Need direct <br/> connection?</h5>
                  </div>
                  <button 
                    onClick={() => setActiveTab('ticket')}
                    className="relative z-10 px-6 py-3 bg-amber-500 text-black font-black uppercase tracking-tighter rounded-xl hover:bg-amber-400 transition-all active:scale-95 text-xs"
                  >
                    Open Ticket
                  </button>
               </div>
            </div>
          ) : activeTab === 'ticket' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black">New <span className="text-amber-500">Ticket</span></h3>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed uppercase tracking-tighter">
                    Standard protocol: Our team responds within 24 nanocyc... hours.
                  </p>
               </div>

               {submitMessage && (
                 <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${submitMessage.startsWith('Failure') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                   {submitMessage}
                 </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Focus Area</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option>Technical Support</option>
                        <option>Account & Profile</option>
                        <option>Billing & Agency</option>
                        <option>Safety & Security</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Urgency</label>
                      <select 
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option>Standard Flow</option>
                        <option>Priority Patch</option>
                        <option>Critical Failure</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Incident Report</label>
                    <textarea 
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the anomaly..."
                      className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all h-40"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-black text-white font-black uppercase tracking-tighter rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-2xl shadow-black/10 flex items-center justify-center gap-3 text-sm"
                  >
                    {submitting ? 'Transmitting...' : 'Transmit Data'} <Send size={18} />
                  </button>
               </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black">Active <span className="text-amber-500">Tickets</span></h3>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed uppercase tracking-tighter">
                  Monitoring your active incident reports and protocol updates.
                </p>
              </div>

              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : myTickets.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                    <ShieldCheck size={32} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">No active incidents detected.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTickets.map((ticket) => (
                    <div key={ticket.id} className="p-5 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 rounded-lg text-zinc-500">
                          ID: {ticket.id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
                          {getStatusIcon(ticket.status)}
                          <span className="text-[9px] font-black uppercase text-black">{ticket.status}</span>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-black italic uppercase tracking-tighter text-black leading-tight mb-1">
                          {ticket.subject}
                        </h5>
                        <p className="text-xs text-zinc-500 line-clamp-2">{ticket.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                        <span className="text-[9px] font-bold text-zinc-400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] font-black uppercase text-amber-600">
                          {ticket.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
