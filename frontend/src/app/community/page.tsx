'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuestions } from '@/api/communityService';
import { getTags } from '@/api/jobService';
import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, ChevronUp, ChevronDown, Tag, Loader2, PlusCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState('');
  const [tagId, setTagId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['questions', keyword, tagId],
    queryFn: () => getQuestions({ keyword: keyword || undefined, tagId: tagId || undefined }),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const questions = data?.data ?? [];
  const tags = tagsData?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Community Q&A</h1>
          <p className="text-slate-500 text-sm mt-1">Ask questions, share knowledge</p>
        </div>
        {user && (
          <Link
            href="/community/ask"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Ask Question
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search questions…"
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {tags.length > 0 && (
          <select
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">All tags</option>
            {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Questions */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/community/questions/${q.id}`}
              className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div className="flex gap-4">
                {/* Stats */}
                <div className="flex flex-col items-center gap-3 text-center shrink-0 w-12">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{q.voteScore}</p>
                    <p className="text-xs text-slate-400">votes</p>
                  </div>
                  <div className={`space-y-0.5 ${q.isAnswered ? 'text-green-600' : ''}`}>
                    <p className="text-sm font-bold">{q.answerCount}</p>
                    <p className="text-xs text-slate-400">answers</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex-1">{q.title}</h3>
                    {q.isAnswered && <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                    {q.bountyAmount && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold shrink-0">
                        +{q.bountyAmount} pts
                      </span>
                    )}
                  </div>

                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.tags.map((tag) => (
                        <span key={tag.id} className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          <Tag className="w-3 h-3" />{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    {q.author && <span>{q.author.email.split('@')[0]}</span>}
                    <span>·</span>
                    <span>{formatRelativeTime(q.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No questions yet</p>
          <p className="text-slate-400 text-sm mt-1">Be the first to ask!</p>
        </div>
      )}
    </div>
  );
}
