'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getContract, getMilestones, addMilestone, completeMilestone, payMilestone,
  getReviews, addReview, getTransactions, raiseDispute, updateContractStatus,
} from '@/api/contractService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate, formatRelativeTime, getDisplayName, getInitials } from '@/lib/utils';
import {
  FileText, CheckCircle, DollarSign, PlusCircle, Loader2, ArrowLeft,
  AlertTriangle, Star, Clock, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ContractStatus, Milestone, CreateMilestoneDto } from '@/types';

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [contractId, setContractId] = useState('');
  if (!contractId) { params.then(({ id }) => setContractId(id)); return null; }
  return <ContractContent contractId={contractId} />;
}

const statusColors: Record<ContractStatus, string> = {
  PendingSignature: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Completed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Disputed: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Cancelled: 'bg-slate-100 text-slate-500',
};

function ContractContent({ contractId }: { contractId: string }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState<CreateMilestoneDto>({ title: '', amount: 0 });
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data: contractData, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => getContract(contractId),
  });
  const { data: milestonesData } = useQuery({
    queryKey: ['milestones', contractId],
    queryFn: () => getMilestones(contractId),
  });
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', contractId],
    queryFn: () => getReviews(contractId),
  });
  const { data: transactionsData } = useQuery({
    queryKey: ['transactions', contractId],
    queryFn: () => getTransactions(contractId),
  });

  const { mutate: addMs, isPending: addingMs } = useMutation({
    mutationFn: () => addMilestone(contractId, milestoneForm),
    onSuccess: () => {
      toast.success('Milestone added');
      setShowMilestoneForm(false);
      setMilestoneForm({ title: '', amount: 0 });
      qc.invalidateQueries({ queryKey: ['milestones', contractId] });
    },
    onError: () => toast.error('Failed to add milestone'),
  });

  const { mutate: completeMs } = useMutation({
    mutationFn: (id: string) => completeMilestone(id),
    onSuccess: () => { toast.success('Milestone marked complete'); qc.invalidateQueries({ queryKey: ['milestones', contractId] }); },
    onError: () => toast.error('Failed to complete milestone'),
  });

  const { mutate: payMs } = useMutation({
    mutationFn: (id: string) => payMilestone(id),
    onSuccess: () => {
      toast.success('Milestone paid!');
      qc.invalidateQueries({ queryKey: ['milestones', contractId] });
      qc.invalidateQueries({ queryKey: ['transactions', contractId] });
    },
    onError: () => toast.error('Failed to pay milestone'),
  });

  const { mutate: openDispute, isPending: openingDispute } = useMutation({
    mutationFn: () => raiseDispute(contractId, disputeReason),
    onSuccess: () => {
      toast.success('Dispute raised');
      setShowDisputeForm(false);
      setDisputeReason('');
      qc.invalidateQueries({ queryKey: ['contract', contractId] });
    },
    onError: () => toast.error('Failed to raise dispute'),
  });

  const { mutate: submitReview, isPending: submittingReview } = useMutation({
    mutationFn: () => addReview(contractId, reviewRating, reviewComment),
    onSuccess: () => {
      toast.success('Review submitted!');
      setShowReviewForm(false);
      qc.invalidateQueries({ queryKey: ['reviews', contractId] });
    },
    onError: () => toast.error('Failed to submit review'),
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: (status: ContractStatus) => updateContractStatus(contractId, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['contract', contractId] }); },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  const contract = contractData?.data;
  if (!contract) return <div className="p-8 text-center text-slate-500">Contract not found</div>;

  const milestones = milestonesData?.data ?? [];
  const reviews = reviewsData?.data ?? [];
  const transactions = transactionsData?.data ?? [];

  const isEmployer = user?.id === contract.clientId;
  const isFreelancer = user?.id === contract.freelancerId;
  const isParty = isEmployer || isFreelancer;
  const isActive = contract.status === 'Active';
  const isCompleted = contract.status === 'Completed';

  const paidAmount = milestones.filter((m: Milestone) => m.status === 'Paid').reduce((sum: number, m: Milestone) => sum + m.amount, 0);
  const completedCount = milestones.filter((m: Milestone) => m.status !== 'Pending').length;
  const other = isEmployer ? contract.freelancer : contract.client;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Link href="/contracts" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Contracts
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {contract.title || 'Contract'}
              </h1>
              {other && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {isEmployer ? 'Freelancer' : 'Client'}: {getDisplayName(other)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[contract.status]}`}>
              {contract.status.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(contract.budget)}</span>
          </div>
        </div>

        {contract.description && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{contract.description}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
          {contract.startDate && (
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Started {formatDate(contract.startDate)}</span>
          )}
          {contract.endDate && (
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />Due {formatDate(contract.endDate)}</span>
          )}
        </div>

        {/* Progress bar */}
        {milestones.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>{completedCount}/{milestones.length} milestones done</span>
              <span>{formatCurrency(paidAmount)} paid</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${milestones.length ? (completedCount / milestones.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {isParty && isActive && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {isEmployer && (
              <button
                onClick={() => changeStatus('Completed')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
            )}
            <button
              onClick={() => setShowDisputeForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Raise Dispute
            </button>
          </div>
        )}

        {isParty && isCompleted && reviews.every((r) => r.reviewerId !== user?.id) && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              <Star className="w-4 h-4" />
              Leave a Review
            </button>
          </div>
        )}
      </div>

      {/* Dispute form */}
      {showDisputeForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Raise a Dispute
          </h2>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Describe the issue in detail…"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowDisputeForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => openDispute()}
              disabled={openingDispute || !disputeReason.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {openingDispute && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Dispute
            </button>
          </div>
        </div>
      )}

      {/* Review form */}
      {showReviewForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Leave a Review
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${star <= reviewRating ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-300 hover:text-amber-400'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowReviewForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => submitReview()}
              disabled={submittingReview}
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Milestones</h2>
          {isEmployer && isActive && (
            <button
              onClick={() => setShowMilestoneForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>

        {showMilestoneForm && (
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Initial Prototype"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount (USD) *</label>
                <input
                  type="number"
                  value={milestoneForm.amount || ''}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                  placeholder="500"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  value={milestoneForm.description || ''}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional details…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={milestoneForm.dueDate || ''}
                  onChange={(e) => setMilestoneForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowMilestoneForm(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => addMs()}
                disabled={addingMs || !milestoneForm.title || !milestoneForm.amount}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {addingMs && <Loader2 className="w-3 h-3 animate-spin" />}
                Add Milestone
              </button>
            </div>
          </div>
        )}

        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((ms: Milestone) => (
              <div
                key={ms.id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  ms.status === 'Paid' ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' :
                  ms.status === 'Completed' ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10' :
                  'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  ms.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30' :
                  ms.status === 'Completed' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {ms.status === 'Paid' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                   ms.status === 'Completed' ? <TrendingUp className="w-4 h-4 text-blue-600" /> :
                   <Clock className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{ms.title}</p>
                  {ms.description && <p className="text-xs text-slate-400 truncate">{ms.description}</p>}
                  {ms.dueDate && <p className="text-xs text-slate-400">Due: {formatDate(ms.dueDate)}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{formatCurrency(ms.amount)}</p>
                  <span className={`text-xs font-medium ${
                    ms.status === 'Paid' ? 'text-green-600' :
                    ms.status === 'Completed' ? 'text-blue-600' :
                    'text-slate-400'
                  }`}>{ms.status}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {isFreelancer && ms.status === 'Pending' && isActive && (
                    <button
                      onClick={() => completeMs(ms.id)}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  {isEmployer && ms.status === 'Completed' && (
                    <button
                      onClick={() => payMs(ms.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      <DollarSign className="w-3 h-3" />
                      Pay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No milestones yet</p>
        )}
      </div>

      {/* Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Transactions</h2>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {tx.description || 'Payment'}
                  </p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(tx.createdAt)}</p>
                </div>
                <span className="font-semibold text-green-600">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                  {review.reviewer ? getInitials(review.reviewer.firstName, review.reviewer.lastName, review.reviewer.email) : '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {review.reviewer ? getDisplayName(review.reviewer) : 'Reviewer'}
                    </p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-slate-500 mt-1">{review.comment}</p>}
                  <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(review.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
