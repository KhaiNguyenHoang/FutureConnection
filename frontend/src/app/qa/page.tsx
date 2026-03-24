"use client";

import { useEffect, useState } from "react";
import { QuestionService } from "@/lib/api/qa";
import { QuestionDto } from "@/types/community";
import QuestionCard from "@/components/qa/QuestionCard";
import AskQuestion from "@/components/qa/AskQuestion";
import { Search, SlidersHorizontal, Plus, Loader2, Sparkles, Trophy, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import api from "@/lib/api";
import ErrorAlert from "@/components/common/ErrorAlert";
import SuccessAlert from "@/components/common/SuccessAlert";

export default function QAPage() {
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    fetchQuestions();
    fetchTopContributors();
  }, [keyword]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await QuestionService.getQuestions(1, 15, keyword);
      if (res.data.success) {
        setQuestions(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const res = await api.get('/posts/top-contributors?top=3');
      if (res.data.success) {
        setTopContributors(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching top contributors:", error);
    }
  };

  const handleCreateQuestion = async (title: string, content: string, tags: string[], files: File[]) => {
    if (!user) return;
    try {
      setSuccessMsg(null);
      setErrorMsg(null);
      
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Content", content);
      formData.append("UserId", user.id);
      tags.forEach(tag => formData.append("Tags", tag));
      files.forEach(file => formData.append("MediaFiles", file));

      const res = await QuestionService.askQuestion(formData);
      if (res.data.success) {
        setShowAskForm(false);
        setSuccessMsg("Broadcast successfully deployed to the comm-link. Nexus reputation points pending.");
        fetchQuestions();
      } else {
        setErrorMsg(res.data.message || "Uplink failed. Transmission corrupted.");
      }
    } catch (error: any) {
      console.error("Error creating question:", error);
      setErrorMsg(error.response?.data?.message || "Critical failure in broadcast protocol.");
    }
  };

  // Removed handleSearch and keyword state as per instruction

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-zinc-50/50">
        {/* Hero Section */}
        <div className="bg-white border-b border-zinc-200 pt-32 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 -mr-[300px] -mt-[300px] rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-900/5 -ml-[200px] -mb-[200px] rounded-full blur-[100px]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <ErrorAlert error={errorMsg} onClear={() => setErrorMsg(null)} />
            <SuccessAlert message={successMsg} onClear={() => setSuccessMsg(null)} />
            
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                  BROADCAST_PROTO: QA_ENGINE
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  <Sparkles size={14} /> AI_AUGMENTED_SYSTEM
                </span>
              </div>

              <h1 className="text-7xl font-black text-zinc-900 leading-[0.9] mb-8 tracking-tighter uppercase">
                The Nexus of <span className="text-zinc-400">Knowledge.</span>
              </h1>

              <p className="text-xl font-bold text-zinc-500 leading-relaxed mb-12 max-w-2xl">
                Connect with the most elite developers, architects, and visionaries. Ask, solve, and transcend the technical boundaries of today.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAskForm(!showAskForm)}
                  className="bg-zinc-900 hover:bg-black text-white px-12 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center gap-4 transition-all shadow-2xl shadow-black/20 group active:scale-95"
                >
                  {showAskForm ? <X size={20} /> : <Plus size={20} />}
                  {showAskForm ? 'Close_Input' : 'Broadcast_Question'}
                </button>

                <div className="flex items-center gap-3 px-6 py-4 bg-white border border-zinc-100 rounded-3xl shadow-xl">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Trophy size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest leading-none">Global Ranking</p>
                    <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest mt-1">#1,402 / Top 5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {showAskForm && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-12">
                <AskQuestion onQuestionCreated={handleCreateQuestion} />
              </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-4 mb-10 shadow-xl flex items-center gap-4 group transition-all focus-within:ring-4 focus-within:ring-zinc-900/5">
              <div className="p-4 bg-zinc-900 text-white rounded-[1.5rem] flex-shrink-0 shadow-lg group-focus-within:bg-amber-500 transition-colors">
                <Search size={24} strokeWidth={3} />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Filter transmissions by keyword..."
                  className="w-full bg-transparent border-none outline-none text-[12px] font-black uppercase tracking-[0.2em] text-zinc-900 placeholder-zinc-300"
                />
              </div>
              <button className="p-4 hover:bg-zinc-50 rounded-[1.5rem] text-zinc-400 transition-all">
                <SlidersHorizontal size={24} />
              </button>
            </div>

            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-[0.3em]">
                Recent_Broadcasts // {(questions || []).length} results
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sort By:</span>
                <select className="bg-transparent font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer text-amber-500 hover:underline">
                  <option>Chronological</option>
                  <option>Highest_Impact</option>
                  <option>Bounty_Reward</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-32 space-y-6">
                <Loader2 size={64} className="text-zinc-200 animate-spin" strokeWidth={1} />
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em] animate-pulse">Syncing_Records...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {questions?.length > 0 ? (
                  questions.map(q => <QuestionCard key={q.id} question={q} />)
                ) : (
                  <div className="text-center p-20 bg-white border border-zinc-100 rounded-[3rem] shadow-xl">
                    <p className="text-[12px] font-black text-zinc-300 uppercase tracking-[0.5em]">Zero_Matches_Found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-8 hidden xl:block">
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 -mr-16 -mt-16 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Top_Contributors</h4>
              <div className="space-y-6">
                {topContributors.length > 0 ? (
                  topContributors.map((c, i) => (
                    <div key={c.userId} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-xs font-black italic">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          c.firstName[0]
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest truncate">{c.firstName} {c.lastName}</p>
                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">{(c.badgeCount || 0).toLocaleString()} points</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Zero_Data_Stream</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
