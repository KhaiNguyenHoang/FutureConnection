"use client";

import { Trophy, Medal, Award } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ErrorAlert from "@/components/common/ErrorAlert";

export default function TopBadges() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    api.get('/posts/top-contributors?top=5')
      .then(res => {
        const data = res.data;
        if (data && data.success && data.data && data.data.length > 0) {
          // Map backend TopContributorDto names to UI expected names
          const formatted = data.data.map((u: any) => ({
            id: u.userId,
            firstName: u.firstName,
            lastName: u.lastName,
            badges: u.badgeCount,
            avatarUrl: u.avatarUrl
          }));
          setTopUsers(formatted);
        } else {
          setTopUsers([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load Top Badges:", err);
        setError(err.response?.data?.message || err.message || "Failed to load Top Badges");
        setTopUsers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-black/5 p-8 sticky top-8 group overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/10">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />

      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 shadow-lg shadow-amber-500/10 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
          <Trophy size={24} className="text-amber-500 fill-amber-500/20" />
        </div>
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">
            Top <span className="text-amber-500">Badges</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400">
               GLOBAL // RANKING
             </p>
          </div>
        </div>
      </div>

      <ErrorAlert error={error} onClear={() => setError(null)} title="Ranking Error" />

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-zinc-400">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          topUsers.map((user, index) => (
            <div key={user.id} className="flex items-center gap-4 group px-3 py-2 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all relative">
              <div className="w-8 flex justify-center shrink-0">
                {index === 0 ? <Medal size={24} className="text-amber-500 drop-shadow-sm" /> :
                 index === 1 ? <Medal size={24} className="text-zinc-400" /> :
                 index === 2 ? <Medal size={24} className="text-amber-700" /> :
                 <span className="text-sm font-black text-zinc-400 italic">#{index + 1}</span>}
              </div>
              <Link href={`/user/${user.id}`} className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex-shrink-0 flex items-center justify-center text-black text-sm font-black uppercase overflow-hidden hover:scale-110 transition-transform shadow-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user.firstName[0]
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/user/${user.id}`}>
                  <h3 className="font-black text-sm text-zinc-900 truncate group-hover:text-amber-500 transition-colors cursor-pointer uppercase tracking-tight">
                    {user.firstName} {user.lastName}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 rounded border border-zinc-100">
                    <Award size={12} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{user.badges} PTS</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {!isLoading && topUsers.length === 0 && (
           <div className="text-center py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
             No ranking data available
           </div>
        )}
      </div>
      
      <button className="w-full mt-8 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-[0.98]">
        EXTRACT_LEADERBOARD
      </button>
    </div>
  );
}
