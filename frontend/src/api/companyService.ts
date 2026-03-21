import api from '@/lib/api';
import { ApiResponse, Company, Job, User } from '@/types';

export const getCompanies = () =>
  api.get<ApiResponse<Company[]>>('/companies').then((r) => r.data);

export const getCompany = (id: string) =>
  api.get<ApiResponse<Company>>(`/companies/${id}`).then((r) => r.data);

export const createCompany = (dto: Omit<Company, 'id' | 'ownerId' | 'followerCount' | 'isFollowing'>) =>
  api.post<ApiResponse<Company>>('/companies', dto).then((r) => r.data);

export const updateCompany = (id: string, dto: Partial<Company>) =>
  api.put<ApiResponse<Company>>(`/companies/${id}`, dto).then((r) => r.data);

export const getCompanyJobs = (companyId: string) =>
  api.get<ApiResponse<Job[]>>(`/companies/${companyId}/jobs`).then((r) => r.data);

export const getCompanyFollowers = (companyId: string) =>
  api.get<ApiResponse<User[]>>(`/companies/${companyId}/followers`).then((r) => r.data);

export const followCompany = (companyId: string) =>
  api.post<ApiResponse>(`/companies/${companyId}/follow`).then((r) => r.data);

export const unfollowCompany = (companyId: string) =>
  api.delete<ApiResponse>(`/companies/${companyId}/follow`).then((r) => r.data);

export const deleteCompany = (id: string) =>
  api.delete<ApiResponse>(`/companies/${id}`).then((r) => r.data);
