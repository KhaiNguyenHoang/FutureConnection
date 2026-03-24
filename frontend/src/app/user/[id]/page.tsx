"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import FreelancerProfile from "@/components/profile/FreelancerProfile";
import EmployerProfile from "@/components/profile/EmployerProfile";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import ErrorAlert from "@/components/common/ErrorAlert";
import SuccessAlert from "@/components/common/SuccessAlert";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    setError(null);
    api.get(`/profiles/public/${id}`)
      .then(res => {
        if (res.data && res.data.success) {
          setProfile(res.data.data);
        } else {
          setError(res.data?.message || "Profile not found");
        }
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || err.message || "Unable to connect to profile service.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const isEmployer = profile?.role === 'Employer' || profile?.role === 'Company' || (profile?.ownedCompanies && profile.ownedCompanies.length > 0);

  return (
    <div className="flex bg-zinc-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20 h-screen overflow-y-auto pb-20">
        {/* Animated Marquee Banner */}
        <div className="bg-amber-400 overflow-hidden py-2 shadow-sm shrink-0">
          <div className="whitespace-nowrap animate-marquee flex items-center">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-black font-black italic uppercase tracking-tighter text-[10px] mx-6 flex items-center">
                PROFILE VIEW <span className="mx-4 text-[4px]">●</span> ACTIVE PROTOCOL <span className="mx-4 text-[4px]">●</span> CONNECTION ESTABLISHED <span className="mx-4 text-[4px]">●</span>
              </span>
            ))}
          </div>
        </div>

        <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SuccessAlert message={success} onClear={() => setSuccess(null)} />
          
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => router.back()} 
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-all bg-white border border-zinc-200 hover:border-zinc-300 px-5 py-3 rounded-2xl shadow-lg shadow-black/[0.02]"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Network
            </button>

            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 block mb-1">Status // Online</span>
              <div className="h-1 w-24 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                <div className="h-full w-2/3 bg-amber-500 animate-pulse" />
              </div>
            </div>
          </div>

          {loading ? (
             <div className="flex items-center justify-center py-32">
               <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : error ? (
             <div className="py-10">
               <ErrorAlert error={error} onClear={() => setError(null)} title="Profile Error" />
             </div>
          ) : !profile ? (
             <div className="text-center py-32">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-2">Not Found</h2>
                <div className="text-zinc-500 font-medium">Profile not found</div>
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               {isEmployer ? (
                 <EmployerProfile user={profile} />
               ) : (
                 <FreelancerProfile user={profile} />
               )}
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
            width: max-content;
          }
        `}</style>
      </main>
    </div>
  );
}
