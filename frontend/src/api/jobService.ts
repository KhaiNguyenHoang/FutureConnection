import api from '@/lib/api';
import { ApiResponse, PagedResponse, Job, Application, JobType, Tag, CreateJobDto, ApplyJobDto } from '@/types';

export interface JobFilters {
  keyword?: string;
  locationType?: string;
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobTypeId?: string;
  tagIds?: string[];
  page?: number;
  pageSize?: number;
}

export const getJobs = (filters?: JobFilters) =>
  api.get<PagedResponse<Job>>('/jobs', { params: filters }).then((r) => r.data);

export const getJob = (id: string) =>
  api.get<ApiResponse<Job>>(`/jobs/${id}`).then((r) => r.data);

export const createJob = (dto: CreateJobDto) =>
  api.post<ApiResponse<Job>>('/jobs', dto).then((r) => r.data);

export const updateJob = (id: string, dto: Partial<CreateJobDto>) =>
  api.put<ApiResponse<Job>>(`/jobs/${id}`, dto).then((r) => r.data);

export const deleteJob = (id: string) =>
  api.delete<ApiResponse>(`/jobs/${id}`).then((r) => r.data);

export const getJobTags = (jobId: string) =>
  api.get<ApiResponse<Tag[]>>(`/jobs/${jobId}/job-tags`).then((r) => r.data);

export const addJobTag = (jobId: string, tagId: string) =>
  api.post<ApiResponse>(`/jobs/${jobId}/job-tags`, { tagId }).then((r) => r.data);

export const removeJobTag = (jobId: string, tagId: string) =>
  api.delete<ApiResponse>(`/jobs/${jobId}/job-tags/${tagId}`).then((r) => r.data);

export const applyForJob = (jobId: string, dto: ApplyJobDto) =>
  api.post<ApiResponse<Application>>(`/jobs/${jobId}/apply`, dto).then((r) => r.data);

export const getMyApplications = () =>
  api.get<ApiResponse<Application[]>>('/jobs/my-applications').then((r) => r.data);

export const getJobApplications = (jobId: string) =>
  api.get<ApiResponse<Application[]>>(`/jobs/${jobId}/applications`).then((r) => r.data);

export const updateApplicationStatus = (applicationId: string, status: string) =>
  api.put<ApiResponse<Application>>(`/jobs/applications/${applicationId}/status`, { status }).then((r) => r.data);

export const getJobTypes = () =>
  api.get<ApiResponse<JobType[]>>('/job-types').then((r) => r.data);

export const createJobType = (name: string) =>
  api.post<ApiResponse<JobType>>('/job-types', { name }).then((r) => r.data);

export const getTags = () =>
  api.get<ApiResponse<Tag[]>>('/tags').then((r) => r.data);

export const createTag = (name: string) =>
  api.post<ApiResponse<Tag>>('/tags', { name }).then((r) => r.data);
