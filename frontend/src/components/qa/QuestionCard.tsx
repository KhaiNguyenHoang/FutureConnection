"use client";

import { QuestionDto } from "@/types/community";
import { MessageSquare, Eye, ThumbsUp, ChevronUp, ChevronDown, Clock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/formatters";

interface QuestionCardProps {
  question: QuestionDto;
  onVote?: (type: number) => void;
}

export default function QuestionCard({ question, onVote }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 mb-4 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-amber-500/5 transition-colors" />

      
      <div className="flex gap-6">
        {/* Vote Stats */}
        <div className="flex flex-col items-center gap-1 min-w-[60px]">
          <button 
            onClick={() => onVote?.(1)}
            className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-amber-500 transition-all active:scale-90"
          >
            <ChevronUp size={24} strokeWidth={3} />
          </button>
          <span className="text-lg font-black text-zinc-900 leading-none">
            {question.voteCount}
          </span>
          <button 
            onClick={() => onVote?.(-1)}
            className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-red-500 transition-all active:scale-90"
          >
            <ChevronDown size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Question Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-zinc-50 text-[8px] font-black uppercase tracking-widest text-zinc-400 rounded border border-zinc-100 flex items-center gap-1.5">
              <Clock size={10} /> {new Date(question.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
            </span>
            {question.tags?.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>

          <Link href={`/qa/${question.id}`}>
            <h2 className="text-xl font-black text-zinc-900 leading-tight mb-3 group-hover:text-amber-500 transition-colors cursor-pointer line-clamp-2 uppercase tracking-tight">
              {question.title}
            </h2>
          </Link>

          <div 
            className="text-zinc-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <div className={`p-2 rounded-lg ${question.answerCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-zinc-50'}`}>
                  <MessageSquare size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {question.answerCount} answers
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <Eye size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {formatCompactNumber(question.viewCount)} views
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">
                  {question.authorFirstName} {question.authorLastName}
                </p>
                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                  Level 5 // ARCHITECT
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm">
                {question.authorAvatarUrl ? (
                  <img src={question.authorAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <UserIcon size={20} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
