import { useAuthStore } from "@/store/authStore";
import { Award, Briefcase, FileText, Code2, Link as LinkIcon, Calendar, Github, Linkedin, MapPin, Mail, Sparkles, Plus, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPhoneNumberIntl } from 'react-phone-number-input';

export default function FreelancerProfile({ user }: { user: any }) {
  const { user: currentUser } = useAuthStore();
  const router = useRouter();
  const isOwner = currentUser?.id === user.id;

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info - Soft Modern Style */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-black/5 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group transition-all hover:shadow-2xl hover:shadow-black/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />
        
        <div className="relative">
          <div className="w-32 h-32 rounded-2xl bg-zinc-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm text-4xl font-black uppercase text-zinc-300">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              user.firstName[0]
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border border-white rounded-full flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900 leading-none">
              {user.firstName} <span className="text-amber-500">{user.lastName}</span>
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-black/10">
                {user.role || 'PRO_DEV'}
              </span>
              <span className="px-3 py-1 bg-amber-400 text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-amber-500/10">
                Verified // FC
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {user.email && (
              <div className="flex items-center gap-2 group/link cursor-default">
                <Mail size={14} className="text-amber-500"/> 
                <span className="group-hover/link:text-zinc-900 transition-colors">{user.email}</span>
              </div>
            )}
            {user.socialMedia?.githubUrl && (
              <a href={user.socialMedia.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-black transition-colors">
                <Github size={14} className="text-zinc-900"/> GitHub
              </a>
            )}
            {user.socialMedia?.linkedInUrl && (
              <a href={user.socialMedia.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <Linkedin size={14} className="text-blue-600"/> LinkedIn
              </a>
            )}
            {user.phoneNumber && (
              <div className="flex items-center gap-2 group/link cursor-default">
                <Phone size={14} className="text-amber-500"/> 
                <span className="group-hover/link:text-zinc-900 transition-colors">{formatPhoneNumberIntl(user.phoneNumber)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout for details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Badges Section */}
        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-lg shadow-black/[0.02] p-8 group transition-all hover:shadow-xl hover:shadow-black/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 flex items-center gap-2">
              <Award className="text-amber-500" size={24} /> Earned Badges
            </h2>
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-amber-500 transition-colors">Protocol // 002</span>
          </div>

          {user.badges && user.badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.badges.map((b: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-zinc-200 hover:bg-white transition-all group/badge">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-black/10 group-hover/badge:scale-110 transition-transform">
                    <Award size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-black uppercase tracking-tight text-zinc-900 leading-tight truncate">{b.name}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1 truncate" title={b.description}>{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 group/empty relative overflow-hidden">
              <Award size={32} className="mx-auto text-zinc-200 mb-3 group-hover/empty:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No data protocol found</p>
              {isOwner && (
                <button 
                  onClick={() => router.push('/settings/profile?tab=skills')}
                  className="mt-6 px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all flex items-center gap-2 mx-auto shadow-lg shadow-black/10 active:scale-95"
                >
                  <Plus size={14} /> Add Badges
                </button>
              )}
            </div>
          )}
        </div>

        {/* Certificates Section */}
        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-lg shadow-black/[0.02] p-8 group transition-all hover:shadow-xl hover:shadow-black/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 flex items-center gap-2">
              <FileText className="text-amber-500" size={24} /> Certificates
            </h2>
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-amber-500 transition-colors">Protocol // 003</span>
          </div>

          {user.certificates && user.certificates.length > 0 ? (
            <div className="space-y-4">
              {user.certificates.map((c: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 border border-transparent hover:border-zinc-200 hover:bg-white transition-all">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-xs font-black uppercase tracking-tight text-zinc-900 leading-tight truncate">{c.name}</h3>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest truncate">{c.issuingOrganization}</p>
                  </div>
                  {c.dateIssued && <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">{formatDate(c.dateIssued)}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 group/empty">
              <FileText size={32} className="mx-auto text-zinc-200 mb-3 group-hover/empty:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Credentials pending...</p>
              {isOwner && (
                <button 
                  onClick={() => router.push('/settings/profile?tab=cv')}
                  className="mt-6 px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all flex items-center gap-2 mx-auto shadow-lg shadow-black/10 active:scale-95"
                >
                  <Plus size={14} /> Upload CV
                </button>
              )}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-black/[0.02] p-10 lg:col-span-2 group">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 flex items-center gap-3">
              <Code2 className="text-amber-500" size={28} /> Personal Projects
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-amber-500 transition-colors">Protocol // 001</span>
          </div>

          {user.personalProjects && user.personalProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {user.personalProjects.map((p: any, idx: number) => (
                <div key={idx} className="p-8 rounded-[2rem] border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all group/proj relative flex flex-col h-full overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/5">
                   {/* Project Decor */}
                   <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                   </div>

                   <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 group-hover/proj:text-amber-600 transition-colors line-clamp-1">{p.name}</h3>
                   <p className="text-sm text-zinc-500 mt-4 line-clamp-2 flex-1 font-medium leading-relaxed">{p.description}</p>
                   
                   <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center gap-8 text-[10px] font-black uppercase tracking-widest shrink-0">
                      {p.repositoryUrl && (
                        <a href={p.repositoryUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-black flex items-center gap-3 transition-colors">
                          <Github size={16} className="text-zinc-900"/> REPOSITORY
                        </a>
                      )}
                      {p.deploymentUrl && (
                        <a href={p.deploymentUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-amber-500 flex items-center gap-3 transition-colors">
                          <LinkIcon size={16} className="text-amber-500"/> LIVE_DEMO
                        </a>
                      )}
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200 group/empty relative overflow-hidden">
               <div className="absolute inset-0 bg-zinc-100/30 opacity-0 group-hover/empty:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300">AWAITING_PROTOCOLS</span>
               </div>
               <Briefcase size={48} className="mx-auto text-zinc-200 mb-6 group-hover/empty:rotate-12 transition-transform" />
               <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Portfolio index // EMPTY_v1</p>
               {isOwner && (
                 <div className="mt-10 space-y-6">
                    <p className="text-[10px] font-medium text-zinc-500 max-w-xs mx-auto">Start showcasing your modern engineering work to the network.</p>
                    <button 
                      onClick={() => router.push('/settings/profile?tab=portfolio')}
                      className="px-10 py-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto border border-amber-600"
                    >
                      <Plus size={16} /> INITIALIZE_PROJECTS
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
