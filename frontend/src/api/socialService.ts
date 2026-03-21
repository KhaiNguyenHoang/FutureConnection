import api from '@/lib/api';
import { ApiResponse, PagedResponse, Post, Comment, Connection, CreatePostDto } from '@/types';

// Posts
export const getFeed = (page = 1, pageSize = 20) =>
  api.get<PagedResponse<Post>>('/posts', { params: { page, pageSize } }).then((r) => r.data);

export const getPost = (id: string) =>
  api.get<ApiResponse<Post>>(`/posts/${id}`).then((r) => r.data);

export const createPost = (dto: CreatePostDto) => {
  const form = new FormData();
  // Backend requires Title — use first 100 chars of content
  form.append('title', dto.content.slice(0, 100));
  form.append('content', dto.content);
  dto.tagIds?.forEach((id) => form.append('tagIds', id));
  return api.post<ApiResponse<Post>>('/posts', form).then((r) => r.data);
};

export const updatePost = (id: string, dto: Partial<CreatePostDto>) =>
  api.put<ApiResponse<Post>>(`/posts/${id}`, dto).then((r) => r.data);

export const deletePost = (id: string) =>
  api.delete<ApiResponse>(`/posts/${id}`).then((r) => r.data);

export const reactToPost = (postId: string, reactionType: string) =>
  api.post<ApiResponse>(`/posts/${postId}/reactions`, { type: reactionType }).then((r) => r.data);

// Comments
export const getComments = (postId: string) =>
  api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`).then((r) => r.data);

export const addComment = (postId: string, content: string) => {
  const form = new FormData();
  form.append('content', content);
  return api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, form).then((r) => r.data);
};

export const updateComment = (commentId: string, content: string) =>
  api.put<ApiResponse<Comment>>(`/comments/${commentId}`, { content }).then((r) => r.data);

export const deleteComment = (commentId: string) =>
  api.delete<ApiResponse>(`/comments/${commentId}`).then((r) => r.data);

export const reactToComment = (commentId: string, reactionType: string) =>
  api.post<ApiResponse>(`/comments/${commentId}/reactions`, { reactionType }).then((r) => r.data);

// Connections
export const getConnections = () =>
  api.get<ApiResponse<Connection[]>>('/connections').then((r) => r.data);

export const getPendingConnections = () =>
  api.get<ApiResponse<Connection[]>>('/connections/pending').then((r) => r.data);

export const sendConnectionRequest = (receiverId: string) =>
  api.post<ApiResponse<Connection>>('/connections', null, { params: { addresseeId: receiverId } }).then((r) => r.data);

export const respondToConnection = (connectionId: string, accepted: boolean) =>
  api.put<ApiResponse<Connection>>(`/connections/${connectionId}/respond`, null, {
    params: { status: accepted ? 'Accepted' : 'Rejected' },
  }).then((r) => r.data);

export const removeConnection = (connectionId: string) =>
  api.delete<ApiResponse>(`/connections/${connectionId}`).then((r) => r.data);
