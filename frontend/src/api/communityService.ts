import api from '@/lib/api';
import { ApiResponse, PagedResponse, Question, Answer, Badge, Reputation, Tag, CreateQuestionDto, CreateAnswerDto } from '@/types';

// Questions
export const getQuestions = (params?: { page?: number; pageSize?: number; tagId?: string; keyword?: string }) =>
  api.get<PagedResponse<Question>>('/questions', { params }).then((r) => r.data);

export const getQuestion = (id: string) =>
  api.get<ApiResponse<Question>>(`/questions/${id}`).then((r) => r.data);

export const createQuestion = (dto: CreateQuestionDto) =>
  api.post<ApiResponse<Question>>('/questions', dto).then((r) => r.data);

export const updateQuestion = (id: string, dto: Partial<CreateQuestionDto>) =>
  api.put<ApiResponse<Question>>(`/questions/${id}`, dto).then((r) => r.data);

export const deleteQuestion = (id: string) =>
  api.delete<ApiResponse>(`/questions/${id}`).then((r) => r.data);

export const addQuestionTag = (questionId: string, tagId: string) =>
  api.post<ApiResponse>(`/questions/${questionId}/tags`, { tagId }).then((r) => r.data);

export const voteQuestion = (questionId: string, value: 1 | -1) =>
  api.post<ApiResponse>(`/questions/${questionId}/vote`, { value }).then((r) => r.data);

// Answers
export const getAnswers = (questionId: string) =>
  api.get<ApiResponse<Answer[]>>(`/questions/${questionId}/answers`).then((r) => r.data);

export const addAnswer = (questionId: string, dto: CreateAnswerDto) =>
  api.post<ApiResponse<Answer>>(`/questions/${questionId}/answers`, dto).then((r) => r.data);

export const updateAnswer = (answerId: string, body: string) =>
  api.put<ApiResponse<Answer>>(`/questions/answers/${answerId}`, { body }).then((r) => r.data);

export const deleteAnswer = (answerId: string) =>
  api.delete<ApiResponse>(`/questions/answers/${answerId}`).then((r) => r.data);

export const voteAnswer = (answerId: string, value: 1 | -1) =>
  api.post<ApiResponse>(`/questions/answers/${answerId}/vote`, { value }).then((r) => r.data);

export const acceptAnswer = (answerId: string) =>
  api.put<ApiResponse>(`/questions/answers/${answerId}/accept`).then((r) => r.data);

// Bounties
export const addBounty = (questionId: string, amount: number) =>
  api.post<ApiResponse>(`/questions/${questionId}/bounties`, { amount }).then((r) => r.data);

export const awardBounty = (bountyId: string, winnerId: string) =>
  api.post<ApiResponse>(`/questions/bounties/${bountyId}/award`, { winnerId }).then((r) => r.data);

// Reputation & Badges
export const getReputation = (userId: string) =>
  api.get<ApiResponse<Reputation>>(`/questions/reputation/${userId}`).then((r) => r.data);

export const getBadges = () =>
  api.get<ApiResponse<Badge[]>>('/badges').then((r) => r.data);

export const createBadge = (dto: Omit<Badge, 'id'>) =>
  api.post<ApiResponse<Badge>>('/badges', dto).then((r) => r.data);
