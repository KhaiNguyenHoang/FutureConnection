'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuestion, getAnswers, addAnswer, voteQuestion, voteAnswer, acceptAnswer,
  deleteAnswer, updateAnswer, addBounty, awardBounty,
} from '@/api/communityService';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime, getDisplayName, getInitials } from '@/lib/utils';
import { ChevronUp, ChevronDown, CheckCircle, Loader2, Send, ArrowLeft, Tag, Pencil, Trash2, Award, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [questionId, setQuestionId] = useState('');
  if (!questionId) { params.then(({ id }) => setQuestionId(id)); return null; }
  return <QuestionContent questionId={questionId} />;
}

function QuestionContent({ questionId }: { questionId: string }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [answerBody, setAnswerBody] = useState('');

  // Edit state per answer
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  // Bounty state
  const [showBountyInput, setShowBountyInput] = useState(false);
  const [bountyAmount, setBountyAmount] = useState('');

  const { data: qData, isLoading } = useQuery({ queryKey: ['question', questionId], queryFn: () => getQuestion(questionId) });
  const { data: answersData } = useQuery({ queryKey: ['answers', questionId], queryFn: () => getAnswers(questionId) });

  const { mutate: vote } = useMutation({
    mutationFn: (value: 1 | -1) => voteQuestion(questionId, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['question', questionId] }),
    onError: () => toast.error('You must be logged in to vote'),
  });

  const { mutate: voteAns } = useMutation({
    mutationFn: ({ id, value }: { id: string; value: 1 | -1 }) => voteAnswer(id, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['answers', questionId] }),
  });

  const { mutate: accept } = useMutation({
    mutationFn: (answerId: string) => acceptAnswer(answerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question', questionId] });
      qc.invalidateQueries({ queryKey: ['answers', questionId] });
    },
    onError: () => toast.error('Only the question author can accept answers'),
  });

  const { mutate: postAnswer, isPending: posting } = useMutation({
    mutationFn: () => addAnswer(questionId, { body: answerBody }),
    onSuccess: () => {
      setAnswerBody('');
      qc.invalidateQueries({ queryKey: ['answers', questionId] });
      toast.success('Answer posted!');
    },
    onError: () => toast.error('Failed to post answer'),
  });

  const { mutate: delAnswer, isPending: deleting } = useMutation({
    mutationFn: (answerId: string) => deleteAnswer(answerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['answers', questionId] });
      toast.success('Answer deleted');
    },
    onError: () => toast.error('Failed to delete answer'),
  });

  const { mutate: editAnswer, isPending: savingEdit } = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => updateAnswer(id, body),
    onSuccess: () => {
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['answers', questionId] });
      toast.success('Answer updated');
    },
    onError: () => toast.error('Failed to update answer'),
  });

  const { mutate: submitBounty, isPending: addingBounty } = useMutation({
    mutationFn: (amount: number) => addBounty(questionId, amount),
    onSuccess: () => {
      setShowBountyInput(false);
      setBountyAmount('');
      qc.invalidateQueries({ queryKey: ['question', questionId] });
      toast.success('Bounty added!');
    },
    onError: () => toast.error('Failed to add bounty'),
  });

  const { mutate: award, isPending: awarding } = useMutation({
    mutationFn: ({ answerId }: { answerId: string }) => awardBounty(questionId, answerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question', questionId] });
      qc.invalidateQueries({ queryKey: ['answers', questionId] });
      toast.success('Bounty awarded!');
    },
    onError: () => toast.error('Failed to award bounty'),
  });

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  const question = qData?.data;
  if (!question) return <div className="p-8 text-center text-slate-500">Question not found</div>;

  const answers = answersData?.data ?? [];
  const isAuthor = user?.id === question.userId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/community" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      {/* Question */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex gap-4">
          {/* Vote */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button onClick={() => vote(1)} className={`p-1.5 rounded-lg transition-colors ${question.userVote === 1 ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
              <ChevronUp className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{question.voteScore}</span>
            <button onClick={() => vote(-1)} className={`p-1.5 rounded-lg transition-colors ${question.userVote === -1 ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex-1">{question.title}</h1>
              {question.isAnswered && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <span key={tag.id} className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" />{tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{question.body}</div>

            {question.bountyAmount ? (
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">+{question.bountyAmount} bounty</span>
              </div>
            ) : isAuthor && (
              <div className="mt-4">
                {showBountyInput ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min={1}
                        value={bountyAmount}
                        onChange={(e) => setBountyAmount(e.target.value)}
                        placeholder="Amount"
                        className="pl-8 pr-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const amt = parseInt(bountyAmount, 10);
                        if (!amt || amt < 1) { toast.error('Enter a valid amount'); return; }
                        submitBounty(amt);
                      }}
                      disabled={addingBounty}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
                    >
                      {addingBounty ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                      Set Bounty
                    </button>
                    <button
                      onClick={() => { setShowBountyInput(false); setBountyAmount(''); }}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBountyInput(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    Add Bounty
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
              {question.author && <span>{getDisplayName(question.author)}</span>}
              <span>·</span>
              <span>{formatRelativeTime(question.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h2>

        <div className="space-y-4">
          {answers.map((ans) => {
            const isOwnAnswer = user?.id === ans.userId;
            const isEditing = editingId === ans.id;

            return (
              <div key={ans.id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 ${ans.isAccepted ? 'border-green-300 dark:border-green-700' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button onClick={() => voteAns({ id: ans.id, value: 1 })} className={`p-1.5 rounded-lg transition-colors ${ans.userVote === 1 ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className="text-base font-bold text-slate-900 dark:text-white">{ans.voteScore}</span>
                    <button onClick={() => voteAns({ id: ans.id, value: -1 })} className={`p-1.5 rounded-lg transition-colors ${ans.userVote === -1 ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    {isAuthor && (
                      <button
                        onClick={() => accept(ans.id)}
                        className={`mt-1 p-1.5 rounded-lg transition-colors ${ans.isAccepted ? 'text-green-600 bg-green-50' : 'text-slate-300 hover:text-green-600 hover:bg-green-50'}`}
                        title="Accept this answer"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {ans.isAccepted && (
                      <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold mb-2">
                        <CheckCircle className="w-4 h-4" />
                        Accepted Answer
                      </div>
                    )}

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={5}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => editAnswer({ id: ans.id, body: editBody })}
                            disabled={savingEdit || !editBody.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                          >
                            {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{ans.body}</div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {ans.author && <span>{getDisplayName(ans.author)}</span>}
                        <span>·</span>
                        <span>{formatRelativeTime(ans.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Award bounty button — visible to question owner when bounty is set */}
                        {isAuthor && question.bountyAmount && (
                          <button
                            onClick={() => award({ answerId: ans.userId })}
                            disabled={awarding}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-60"
                            title="Award bounty to this answer"
                          >
                            {awarding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                            Award Bounty
                          </button>
                        )}

                        {/* Edit & Delete — own answers only */}
                        {isOwnAnswer && !isEditing && (
                          <>
                            <button
                              onClick={() => { setEditingId(ans.id); setEditBody(ans.body); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit answer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { if (confirm('Delete this answer?')) delAnswer(ans.id); }}
                              disabled={deleting}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
                              title="Delete answer"
                            >
                              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post answer */}
      {user && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Your Answer</h2>
          <textarea
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            placeholder="Write your answer here…"
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
          <button
            onClick={() => postAnswer()}
            disabled={posting || !answerBody.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Answer
          </button>
        </div>
      )}
    </div>
  );
}
