import api from '@/lib/api';
import { ApiResponse, Profile, CV, Certificate, PersonalProject, OpenSourceContribution, SocialMedia, Endorsement } from '@/types';

export const getProfile = (id: string) =>
  api.get<ApiResponse<Profile>>(`/profiles/${id}`).then((r) => r.data);

export const updateProfile = (id: string, dto: Partial<Profile>) =>
  api.put<ApiResponse<Profile>>(`/profiles/${id}`, dto).then((r) => r.data);

// CVs
export const getCVs = (profileId: string) =>
  api.get<ApiResponse<CV[]>>(`/profiles/${profileId}/cvs`).then((r) => r.data);

export const uploadCV = (profileId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<ApiResponse<CV>>(`/profiles/${profileId}/cvs`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const deleteCV = (cvId: string) =>
  api.delete<ApiResponse>(`/profiles/cvs/${cvId}`).then((r) => r.data);

// Certificates
export const getCertificates = (profileId: string) =>
  api.get<ApiResponse<Certificate[]>>(`/profiles/${profileId}/certificates`).then((r) => r.data);

export const addCertificate = (profileId: string, dto: Omit<Certificate, 'id' | 'profileId'>) =>
  api.post<ApiResponse<Certificate>>(`/profiles/${profileId}/certificates`, dto).then((r) => r.data);

export const updateCertificate = (certId: string, dto: Partial<Certificate>) =>
  api.put<ApiResponse<Certificate>>(`/profiles/certificates/${certId}`, dto).then((r) => r.data);

export const deleteCertificate = (certId: string) =>
  api.delete<ApiResponse>(`/profiles/certificates/${certId}`).then((r) => r.data);

// Personal Projects
export const getProjects = (profileId: string) =>
  api.get<ApiResponse<PersonalProject[]>>(`/profiles/${profileId}/projects`).then((r) => r.data);

export const addProject = (profileId: string, dto: Omit<PersonalProject, 'id' | 'profileId'>) =>
  api.post<ApiResponse<PersonalProject>>(`/profiles/${profileId}/projects`, dto).then((r) => r.data);

export const updateProject = (projectId: string, dto: Partial<PersonalProject>) =>
  api.put<ApiResponse<PersonalProject>>(`/profiles/projects/${projectId}`, dto).then((r) => r.data);

export const deleteProject = (projectId: string) =>
  api.delete<ApiResponse>(`/profiles/projects/${projectId}`).then((r) => r.data);

// Open Source
export const getOpenSource = (profileId: string) =>
  api.get<ApiResponse<OpenSourceContribution[]>>(`/profiles/${profileId}/open-source`).then((r) => r.data);

export const addOpenSource = (profileId: string, dto: Omit<OpenSourceContribution, 'id' | 'profileId'>) =>
  api.post<ApiResponse<OpenSourceContribution>>(`/profiles/${profileId}/open-source`, dto).then((r) => r.data);

export const deleteOpenSource = (id: string) =>
  api.delete<ApiResponse>(`/profiles/open-source/${id}`).then((r) => r.data);

// Social Media
export const getSocialMedia = (profileId: string) =>
  api.get<ApiResponse<SocialMedia[]>>(`/profiles/${profileId}/social-media`).then((r) => r.data);

export const addSocialMedia = (profileId: string, dto: Omit<SocialMedia, 'id' | 'profileId'>) =>
  api.post<ApiResponse<SocialMedia>>(`/profiles/${profileId}/social-media`, dto).then((r) => r.data);

export const updateSocialMedia = (id: string, dto: Partial<SocialMedia>) =>
  api.put<ApiResponse<SocialMedia>>(`/profiles/social-media/${id}`, dto).then((r) => r.data);

// Endorsements
export const getEndorsements = (profileId: string) =>
  api.get<ApiResponse<Endorsement[]>>(`/profiles/${profileId}/endorsements`).then((r) => r.data);

export const addEndorsement = (profileId: string, skill: string) =>
  api.post<ApiResponse<Endorsement>>(`/profiles/${profileId}/endorsements`, { skill }).then((r) => r.data);
