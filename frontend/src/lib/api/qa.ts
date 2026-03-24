import api from '../api';
import { QuestionDto, CreateQuestionDto, AnswerDto, CreateAnswerDto } from '@/types/community';

export const QuestionService = {
  getQuestions: (page = 1, pageSize = 10, keyword?: string) => 
    api.get(`/questions?page=${page}\u0026pageSize=${pageSize}${keyword ? `\u0026keyword=${keyword}` : ''}`),
  
  getQuestion: (id: string) => 
    api.get(`/questions/${id}`),
  
  askQuestion: (data: CreateQuestionDto | FormData) => 
    api.post('/questions', data),
  
  updateQuestion: (id: string, dto: any) => 
    api.put(`/questions/${id}`, dto),
  
  deleteQuestion: (id: string) => 
    api.delete(`/questions/${id}`),
  
  getAnswers: (questionId: string) => 
    api.get(`/questions/${questionId}/answers`),
  
  postAnswer: (questionId: string, data: CreateAnswerDto | FormData) => 
    api.post(`/questions/${questionId}/answers`, data),
  
  acceptAnswer: (answerId: string) => 
    api.put(`/questions/answers/${answerId}/accept`),
  
  voteQuestion: (questionId: string, type: number) => 
    api.post(`/questions/${questionId}/vote`, { type }),
  
  voteAnswer: (answerId: string, type: number) => 
    api.post(`/questions/answers/${answerId}/vote`, { type }),
};
