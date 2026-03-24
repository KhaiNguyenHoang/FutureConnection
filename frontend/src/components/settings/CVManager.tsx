"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import api from "@/lib/api";
import { Plus, Trash2, FileText, Download, Briefcase, AlertCircle } from "lucide-react";
import ErrorAlert from "@/components/common/ErrorAlert";
import SuccessAlert from "@/components/common/SuccessAlert";

interface CVDto {
  id: string;
  cvUrl: string;
  uploadedAt: string;
}

export default function CVManager({ user }: { user: User }) {
  const [cvs, setCvs] = useState<CVDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [cvUrl, setCvUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCvs = async () => {
    setError(null); // Clear previous errors
    try {
      const res = await api.get(`/profiles/public/${user.id}`);
      if (res.data.success && res.data.data.cVs) {
        setCvs(res.data.data.cVs);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load CVs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCvs();
  }, [user.id]);

  const handleDelete = async (cvId: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/profiles/${user.id}/cvs/${cvId}`);
      setCvs(cvs.filter(c => c.id !== cvId));
      setSuccess("CV deleted successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvUrl) return;
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/profiles/${user.id}/cvs`, { cvUrl });
      setCvUrl("");
      setIsAdding(false);
      setSuccess("CV attached successfully!");
      fetchCvs();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Save CV failed");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden group">
      <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">CV <span className="text-amber-500">Management</span></h2>
          <p className="text-zinc-500 text-xs font-medium mt-1">Connect your professional documents.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter flex items-center gap-2 transition-all active:scale-[0.98] z-10 shadow-lg shadow-zinc-900/10"
          >
            <Plus size={16} /> Link CV
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-8 bg-zinc-50 border-b border-zinc-200 space-y-5">
          <div className="space-y-1.5 group/input">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">CV Document URL *</label>
             <input type="url" required value={cvUrl} onChange={e => setCvUrl(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all" placeholder="https://drive.google.com/... or /pdfs/resume.pdf" />
             <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter ml-1">Paste a publicly accessible URL to your PDF document.</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setIsAdding(false); setCvUrl(""); }} className="px-6 py-3 text-[11px] font-black uppercase tracking-tighter text-zinc-500 hover:text-zinc-900 transition-all underline underline-offset-4">ABORT</button>
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]">
              Attach CV
            </button>
          </div>
        </form>
      )}

      <div className="px-6 sm:px-8 pt-4">
        <ErrorAlert error={error} onClear={() => setError(null)} title="CV Management Error" />
        <SuccessAlert message={success} onClear={() => setSuccess(null)} />
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl group/empty">
            <FileText className="w-16 h-16 text-zinc-200 mx-auto mb-6 group-hover/empty:scale-110 transition-transform" />
            <h3 className="text-zinc-400 text-lg font-black uppercase tracking-tighter">Credential Repository Empty</h3>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Initialize your professional index below</p>
          </div>
        ) : (
          cvs.map(cv => (
            <div key={cv.id} className="p-6 rounded-3xl border border-zinc-200 group bg-white flex items-center justify-between shadow-sm hover:shadow-md hover:border-amber-500 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-black text-base text-zinc-900 uppercase tracking-tight">Curriculum Vitae</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                     <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em]">DETECTED: {new Date(cv.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={cv.cvUrl} target="_blank" rel="noreferrer" className="px-5 py-3 bg-zinc-900 text-white hover:bg-black rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95">
                  <Download size={18} /> Open
                </a>
                <button onClick={() => handleDelete(cv.id)} className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
