import api from '@/lib/api';
import { ApiResponse, Contract, Milestone, Dispute, Review, Transaction, CreateContractDto, CreateMilestoneDto } from '@/types';

export const getContracts = () =>
  api.get<ApiResponse<Contract[]>>('/contracts').then((r) => r.data);

export const getContract = (id: string) =>
  api.get<ApiResponse<Contract>>(`/contracts/${id}`).then((r) => r.data);

export const createContract = (dto: CreateContractDto) =>
  api.post<ApiResponse<Contract>>('/contracts', dto).then((r) => r.data);

export const updateContractStatus = (id: string, status: string) =>
  api.put<ApiResponse<Contract>>(`/contracts/${id}/status`, { status }).then((r) => r.data);

// Milestones
export const getMilestones = (contractId: string) =>
  api.get<ApiResponse<Milestone[]>>(`/contracts/${contractId}/milestones`).then((r) => r.data);

export const addMilestone = (contractId: string, dto: CreateMilestoneDto) =>
  api.post<ApiResponse<Milestone>>(`/contracts/${contractId}/milestones`, dto).then((r) => r.data);

export const completeMilestone = (milestoneId: string) =>
  api.put<ApiResponse<Milestone>>(`/contracts/milestones/${milestoneId}/complete`).then((r) => r.data);

export const payMilestone = (milestoneId: string) =>
  api.put<ApiResponse<Milestone>>(`/contracts/milestones/${milestoneId}/pay`).then((r) => r.data);

// Reviews
export const getReviews = (contractId: string) =>
  api.get<ApiResponse<Review[]>>(`/contracts/${contractId}/reviews`).then((r) => r.data);

export const addReview = (contractId: string, rating: number, comment?: string) =>
  api.post<ApiResponse<Review>>(`/contracts/${contractId}/reviews`, { rating, comment }).then((r) => r.data);

// Transactions
export const getTransactions = (contractId: string) =>
  api.get<ApiResponse<Transaction[]>>(`/contracts/${contractId}/transactions`).then((r) => r.data);

// Disputes
export const raiseDispute = (contractId: string, reason: string) =>
  api.post<ApiResponse<Dispute>>(`/contracts/${contractId}/disputes`, { reason }).then((r) => r.data);

export const getAllDisputes = () =>
  api.get<ApiResponse<Dispute[]>>('/contracts/disputes').then((r) => r.data);

export const resolveDispute = (disputeId: string, status: string) =>
  api.put<ApiResponse<Dispute>>(`/contracts/disputes/${disputeId}/resolve`, null, { params: { status } }).then((r) => r.data);
