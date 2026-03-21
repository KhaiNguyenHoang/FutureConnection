import api from '@/lib/api';
import { ApiResponse, Agency, AgencyMember } from '@/types';

export const getAgencies = () =>
  api.get<ApiResponse<Agency[]>>('/agencies').then((r) => r.data);

export const getAgency = (id: string) =>
  api.get<ApiResponse<Agency>>(`/agencies/${id}`).then((r) => r.data);

export const createAgency = (dto: Omit<Agency, 'id' | 'ownerId' | 'memberCount'>) =>
  api.post<ApiResponse<Agency>>('/agencies', dto).then((r) => r.data);

export const updateAgency = (id: string, dto: Partial<Agency>) =>
  api.put<ApiResponse<Agency>>(`/agencies/${id}`, dto).then((r) => r.data);

export const deleteAgency = (id: string) =>
  api.delete<ApiResponse>(`/agencies/${id}`).then((r) => r.data);

export const addAgencyMember = (agencyId: string, userId: string) =>
  api.post<ApiResponse<AgencyMember>>(`/agencies/${agencyId}/members`, { userId }).then((r) => r.data);

export const removeAgencyMember = (agencyId: string, memberId: string) =>
  api.delete<ApiResponse>(`/agencies/${agencyId}/members/${memberId}`).then((r) => r.data);
