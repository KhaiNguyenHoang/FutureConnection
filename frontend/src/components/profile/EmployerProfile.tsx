import { useAuthStore } from "@/store/authStore";
import { Briefcase, Building2, MapPin, Globe, Plus, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPhoneNumberIntl } from 'react-phone-number-input';

export default function EmployerProfile({ user }: { user: any }) {
  const { user: currentUser } = useAuthStore();
  const router = useRouter();
  const isOwner = currentUser?.id === user.id;

  const company = user.ownedCompanies && user.ownedCompanies.length > 0 ? user.ownedCompanies[0] : null;

  return (
    <div className="space-y-8">
      {/* Header Info - Soft Modern Style */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-black/5 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group transition-all hover:shadow-2xl hover:shadow-black/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />

        <div className="relative">
          <div className="w-32 h-32 rounded-2xl bg-zinc-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm text-4xl font-black uppercase text-zinc-300">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              user.firstName[0]
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 border border-white rounded-full flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900 leading-none">
              {user.firstName} <span className="text-amber-500">{user.lastName}</span>
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-black/10">
                EMPLOYER // PARTNER
              </span>
              <span className="px-3 py-1 bg-emerald-400 text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-emerald-500/10">
                Active Protocol
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {user.email && (
              <div className="flex items-center gap-2 group/link cursor-default">
                <span className="text-amber-500 font-black">//</span>
                <span className="group-hover/link:text-zinc-900 transition-colors">{user.email}</span>
              </div>
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

      {company ? (
        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-xl shadow-black/[0.02] p-8 group transition-all hover:shadow-2xl hover:shadow-black/5">
           <div className="flex flex-col sm:flex-row items-start gap-8">
             <div className="w-24 h-24 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
               {company.logoUrl ? (
                 <img src={company.logoUrl} alt="logo" className="w-full h-full object-cover"/>
               ) : (
                 <Building2 size={32} className="text-zinc-900" />
               )}
             </div>
             <div className="flex-1">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">{company.name}</h2>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-amber-500 transition-colors">Org // Data</span>
               </div>
               
               <div className="flex flex-wrap items-center gap-6 mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {company.industry && (
                    <span className="flex items-center gap-2">
                      <Briefcase size={14} className="text-amber-500"/> {company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span className="flex items-center gap-2">
                      <MapPin size={14} className="text-amber-500"/> {company.location}
                    </span>
                  )}
                  {company.websiteUrl && (
                    <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-black transition-colors">
                      <Globe size={14} className="text-zinc-900"/> WEBSITE_LINK
                    </a>
                  )}
               </div>
               {company.description && (
                 <div className="mt-8 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/10 rounded-full" />
                    <p className="pl-6 text-zinc-600 text-sm font-medium leading-[1.8] italic">
                      {company.description}
                    </p>
                 </div>
               )}
             </div>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-dashed border-zinc-200 shadow-black/[0.02] p-20 text-center group/empty transition-all hover:shadow-xl hover:shadow-black/5">
            <Building2 size={64} className="mx-auto text-zinc-200 mb-8 group-hover/empty:scale-110 transition-transform" />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-400">Registry Entry Empty</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-3 max-w-sm mx-auto leading-relaxed">This profile requires valid company credentials to be verified on the protocol.</p>
            {isOwner && (
              <button 
                onClick={() => router.push('/settings/profile?tab=general')}
                className="mt-10 px-10 py-4 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-black/10 hover:bg-black transition-all flex items-center gap-3 mx-auto active:scale-[0.98]"
              >
                <Plus size={18} /> INITIALIZE_COMPANY
              </button>
            )}
        </div>
      )}
    </div>
  );
}
