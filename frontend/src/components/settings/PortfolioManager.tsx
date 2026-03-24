"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import api from "@/lib/api";
import { Plus, Trash2, Edit2, Link as LinkIcon, Briefcase, AlertCircle } from "lucide-react";
import ErrorAlert from "@/components/common/ErrorAlert";
import SuccessAlert from "@/components/common/SuccessAlert";

interface ProjectDto {
  id: string;
  projectName: string;
  description: string;
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
}

export default function PortfolioManager({ user }: { user: User }) {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    projectUrl: "",
    startDate: "",
    endDate: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    setError(null);
    try {
      const res = await api.get(`/profiles/public/${user.id}`);
      if (res.data.success && res.data.data.projects) {
        setProjects(res.data.data.projects);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user.id]);

  const resetForm = () => {
    setFormData({ projectName: "", description: "", projectUrl: "", startDate: "", endDate: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (proj: ProjectDto) => {
    setFormData({
      projectName: proj.projectName,
      description: proj.description,
      projectUrl: proj.projectUrl || "",
      startDate: proj.startDate ? new Date(proj.startDate).toISOString().split('T')[0] : "",
      endDate: proj.endDate ? new Date(proj.endDate).toISOString().split('T')[0] : ""
    });
    setEditingId(proj.id);
    setIsAdding(true);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/profiles/${user.id}/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      setSuccess("Project deleted successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await api.put(`/profiles/${user.id}/projects/${editingId}`, { id: editingId, ...formData });
        setSuccess("Project updated successfully!");
      } else {
        await api.post(`/profiles/${user.id}/projects`, formData);
        setSuccess("Project added successfully!");
      }
      resetForm();
      fetchPortfolio(); // Refetch to get IDs and fresh data
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Save failed");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden group">
      <div className="p-8 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">Personal <span className="text-amber-500">Projects</span></h2>
          <p className="text-zinc-500 text-xs font-medium mt-1">Showcase your technical workspace.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter flex items-center gap-2 transition-all active:scale-[0.98] z-10 shadow-lg shadow-zinc-900/10"
          >
            <Plus size={16} /> Add Project
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-8 bg-zinc-50 border-b border-zinc-200 space-y-5">
          <div className="space-y-1.5 group/input">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Project Name *</label>
             <input required value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all" placeholder="e.g. E-Commerce Platform" />
          </div>
          <div className="space-y-1.5 group/input">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Description *</label>
             <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 min-h-[100px] resize-none transition-all" placeholder="What did you build? What stack did you use?" />
          </div>
          <div className="space-y-1.5 group/input">
             <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Live URL / Github Repo</label>
             <input type="url" value={formData.projectUrl} onChange={e => setFormData({...formData, projectUrl: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all" placeholder="https://github.com/..." />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={resetForm} className="px-6 py-3 text-[11px] font-black uppercase tracking-tighter text-zinc-500 hover:text-zinc-900 transition-all transition-all underline underline-offset-4">Cancel</button>
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]">
              {editingId ? "Update Project" : "Save Project"}
            </button>
          </div>
        </form>
      )}

      <div className="px-6 sm:px-8 pt-4">
        <ErrorAlert error={error} onClear={() => setError(null)} title="Portfolio Error" />
        <SuccessAlert message={success} onClear={() => setSuccess(null)} />
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl group/empty">
            <Briefcase className="w-16 h-16 text-zinc-200 mx-auto mb-6 group-hover/empty:scale-110 transition-transform" />
            <h3 className="text-zinc-400 text-lg font-black uppercase tracking-tighter">Portfolio Index Empty</h3>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Initialize your repository showcasing below</p>
          </div>
        ) : (
          projects.map(proj => (
            <div key={proj.id} className="p-6 rounded-3xl border border-zinc-200 hover:border-amber-500 hover:bg-amber-50/10 transition-all group bg-white shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                     <h3 className="font-black text-lg text-zinc-900 uppercase tracking-tight">{proj.projectName}</h3>
                     <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  </div>
                  <p className="text-sm text-zinc-600 font-medium leading-relaxed mb-6">{proj.description}</p>
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-2.5 rounded-xl transition-all hover:bg-amber-100 active:scale-95 border border-amber-200">
                      <LinkIcon size={14} /> View Project
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(proj)} className="p-2.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(proj.id)} className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
