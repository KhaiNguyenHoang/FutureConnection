"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuestionService } from "@/lib/api/qa";
import { QuestionDto, AnswerDto } from "@/types/community";
import { 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  User as UserIcon,
  Send,
  Image as ImageIcon,
  X
} from "lucide-react";
import { useRef } from "react";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import { useAuthStore } from "@/store/authStore";
import SuccessAlert from "@/components/common/SuccessAlert";
import ErrorAlert from "@/components/common/ErrorAlert";
import Sidebar from "@/components/layout/Sidebar";

export default function QuestionDetailPage() {

  const { id } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [answers, setAnswers] = useState<AnswerDto[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setMounted(true);
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setSuccessMsg(null);
      setErrorMsg(null);
      const qRes = await QuestionService.getQuestion(id as string);
      if (qRes.data.success) {
        setQuestion(qRes.data.data);
      } else {
        setErrorMsg(qRes.data.message || "Transmission failed. Resource not found.");
      }
      const aRes = await QuestionService.getAnswers(id as string);
      if (aRes.data.success) {
        setAnswers(aRes.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching QA details:", error);
      setErrorMsg(error.response?.data?.message || "Critical failure in retrieval protocol.");
    } finally {

      setLoading(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!newAnswer.trim() || !user) return;
    try {
      setSuccessMsg(null);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("Content", newAnswer);
      formData.append("QuestionId", id as string);
      formData.append("UserId", user.id);
      selectedFiles.forEach(file => formData.append("MediaFiles", file));

      const res = await QuestionService.postAnswer(id as string, formData);
      if (res.data.success) {
        setNewAnswer("");
        setSelectedFiles([]);
        setSuccessMsg("Answer successfully uplinked. Merit points designated.");
        fetchData();
      } else {
        setErrorMsg(res.data.message || "Uplink failed. Transmission corrupted.");
      }
    } catch (error: any) {
      console.error("Error posting answer:", error);
      setErrorMsg(error.response?.data?.message || "Critical failure in transmission protocol.");
    }

  };

  const handleAccept = async (answerId: string) => {
    try {
      const res = await QuestionService.acceptAnswer(answerId);
      if (res.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error accepting answer:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse font-black text-zinc-300 tracking-widest uppercase">Initializing_Data_Stream...</div>;
  if (!question) return <div className="p-20 text-center font-black text-red-500 uppercase tracking-widest">Question_Not_Found</div>;

  return (
    <div className="flex bg-zinc-50/50 min-h-screen">

      <Sidebar />
      <main className="flex-1 ml-20 h-screen overflow-y-auto">
        <div className="py-12 max-w-5xl mx-auto px-6">
          <ErrorAlert error={errorMsg} onClear={() => setErrorMsg(null)} />
          <SuccessAlert message={successMsg} onClear={() => setSuccessMsg(null)} />

          <button 
            onClick={() => router.back()}
            className="flex items-center gap-3 text-zinc-400 hover:text-black mb-8 transition-all group font-black uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back_To_Nexus
          </button>

          {/* Main Question */}
          <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 mb-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 -mr-32 -mt-32 rounded-full blur-3xl" />

        
        <div className="flex gap-10">
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            <button className="p-3 hover:bg-zinc-50 rounded-2xl text-zinc-300 hover:text-amber-500 transition-all active:scale-90"><ChevronUp size={32} strokeWidth={3} /></button>
            <span className="text-3xl font-black text-zinc-900 leading-none">{question.voteCount}</span>
            <button className="p-3 hover:bg-zinc-50 rounded-2xl text-zinc-300 hover:text-red-500 transition-all active:scale-90"><ChevronDown size={32} strokeWidth={3} /></button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                PROTOCOL_QA
              </span>
              {question.tags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-zinc-50 text-zinc-400 border border-zinc-100 text-[10px] font-black uppercase tracking-widest rounded-full uppercase">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-black text-zinc-900 leading-[1.1] mb-6 tracking-tight uppercase">
              {question.title}
            </h1>

            <div 
              className="prose prose-zinc max-w-none text-zinc-600 font-bold leading-relaxed mb-10"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />

            {question.media && question.media.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-10">
                {question.media.map((m, i) => (
                  <div key={i} className="w-full max-w-2xl rounded-3xl overflow-hidden border border-zinc-100 shadow-lg">
                    <img src={m.mediaUrl} alt="evidence" className="w-full h-auto" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-8 border-t border-zinc-100">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-zinc-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Posted on {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{question.authorFirstName} {question.authorLastName}</p>
                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mt-1">Reputation Score: 12.5K</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
                   {question.authorAvatarUrl ? <img src={question.authorAvatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400 transition-colors"><UserIcon size={24} /></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-12">
        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-widest flex items-center gap-3 mb-8">
          <MessageSquare size={24} className="text-amber-500" /> {answers.length} Answers
        </h3>

        <div className="space-y-6">
          {answers.map((answer) => (
            <div key={answer.id} className={`bg-white rounded-[2.5rem] border ${answer.isAccepted ? 'border-amber-500 ring-4 ring-amber-50' : 'border-zinc-200'} p-8 shadow-lg transition-all relative group`}>
              {answer.isAccepted && (
                <div className="absolute top-6 right-8 flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                  <CheckCircle2 size={14} /> Solution_Accepted
                </div>
              )}

              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                  <button className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-300 hover:text-amber-500 transition-all active:scale-90"><ChevronUp size={24} strokeWidth={3} /></button>
                  <span className="text-lg font-black text-zinc-900">{answer.voteCount}</span>
                  <button className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-300 hover:text-red-500 transition-all active:scale-90"><ChevronDown size={24} strokeWidth={3} /></button>
                </div>

                <div className="flex-1">
                  <div 
                    className="prose prose-sm prose-zinc max-w-none text-zinc-600 font-bold leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />

                  {answer.media && answer.media.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-8">
                      {answer.media.map((m, i) => (
                        <div key={i} className="w-48 h-32 rounded-2xl overflow-hidden border border-zinc-100 shadow-md">
                          <img src={m.mediaUrl} alt="evidence" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      {user?.id === question.userId && !answer.isAccepted && (
                        <button 
                          onClick={() => handleAccept(answer.id)}
                          className="px-4 py-2 hover:bg-zinc-900 hover:text-white text-zinc-400 border border-zinc-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          Mark_As_Solution
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{answer.authorFirstName} {answer.authorLastName}</p>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Contributor // {new Date(answer.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden shadow-sm">
                        {answer.authorAvatarUrl ? <img src={answer.authorAvatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><UserIcon size={20} /></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer Form */}
      <div className="bg-zinc-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 -mr-32 -mb-32 rounded-full blur-3xl animate-pulse" />
        <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
          <Send size={20} className="text-amber-500" /> Broadcast_Your_Knowledge
        </h3>

        <div className="quill-wrapper-dark bg-zinc-800/50 rounded-[2rem] border border-zinc-700/50 overflow-hidden mb-6 backdrop-blur-md">
          {mounted && (
            <ReactQuill
              theme="snow"
              value={newAnswer}
              onChange={setNewAnswer}
              placeholder="Provide a technical solution or insight..."
              className="w-full text-white font-bold min-h-[150px]"
            />
          )}
        </div>

        {/* Media Upload for Answer */}
        <div className="mb-6">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <ImageIcon size={14} /> Attach_Visual_Evidence
          </button>

          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative group/img w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handlePostAnswer}
            disabled={!newAnswer.trim()}
            className="bg-white text-black px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-30 shadow-xl"
          >
            Deploy_Answer
          </button>
        </div>

        <style jsx global>{`
          .quill-wrapper-dark .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid rgba(255,255,255,0.1); background: transparent; padding: 15px; }
          .quill-wrapper-dark .ql-toolbar .ql-stroke { stroke: #fff !important; }
          .quill-wrapper-dark .ql-toolbar .ql-fill { fill: #fff !important; }
          .quill-wrapper-dark .ql-container.ql-snow { border: none; }
          .quill-wrapper-dark .ql-editor { padding: 30px; font-size: 14px; min-height: 150px; }
          .quill-wrapper-dark .ql-editor.ql-blank::before { color: #52525b; font-style: normal; left: 30px; }
        `}</style>
      </div>
    </div>
  </main>
</div>
);
}

