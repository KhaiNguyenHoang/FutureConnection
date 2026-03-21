import api from '@/lib/api';
import { ApiResponse, CreateUserDto, LoginDto, LoginResponse, OAuthResponse, TokenResponse, User, UpdateUserDto } from '@/types';
import { OAUTH_REDIRECT } from '@/constants';

// ── Registration & Login ──────────────────────────────────────────────────────

export const register = (dto: CreateUserDto) =>
  api.post<ApiResponse<User>>('/auth/register', dto).then((r) => r.data);

export const login = (dto: LoginDto) =>
  api.post<LoginResponse>('/auth/login', dto).then((r) => r.data);

export const refreshToken = (token: string) =>
  api.post<ApiResponse<TokenResponse>>('/auth/refresh-token', { refreshToken: token }).then((r) => r.data);

export const logout = (userId: string) =>
  api.post<ApiResponse>('/auth/logout', { userId }).then((r) => r.data);

// ── Email Verification ────────────────────────────────────────────────────────

export const verifyEmail = (token: string) =>
  api.get<ApiResponse>('/auth/verify-email', { params: { token } }).then((r) => r.data);

export const resendVerification = (email: string) =>
  api.post<ApiResponse>('/auth/resend-verification', { email }).then((r) => r.data);

// ── Forgot / Reset Password ───────────────────────────────────────────────────

export const forgotPassword = (email: string) =>
  api.post<ApiResponse>('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token: string, newPassword: string) =>
  api.post<ApiResponse>('/auth/reset-password', { token, newPassword }).then((r) => r.data);

// ── Change Password (OTP flow) ────────────────────────────────────────────────

export const requestChangePasswordOtp = () =>
  api.post<ApiResponse>('/auth/change-password/request-otp').then((r) => r.data);

export const verifyChangePasswordOtp = (otp: string) =>
  api.post<ApiResponse>('/auth/change-password/verify-otp', { otp }).then((r) => r.data);

export const changePassword = (userId: string, currentPassword: string, newPassword: string) =>
  api.post<ApiResponse>('/auth/change-password', { userId, currentPassword, newPassword }).then((r) => r.data);

// ── OAuth2 ────────────────────────────────────────────────────────────────────

export const oauthGitHub = (code: string) =>
  api.post<OAuthResponse>('/auth/oauth/github', { code, redirectUri: OAUTH_REDIRECT.github }).then((r) => r.data);

export const oauthGoogle = (code: string) =>
  api.post<OAuthResponse>('/auth/oauth/google', { code, redirectUri: OAUTH_REDIRECT.google }).then((r) => r.data);

// ── User Management ───────────────────────────────────────────────────────────

export const getUser = (id: string) =>
  api.get<ApiResponse<User>>(`/auth/users/${id}`).then((r) => r.data);

export const getAllUsers = () =>
  api.get<ApiResponse<User[]>>('/auth/users').then((r) => r.data);

export const updateUser = (id: string, dto: UpdateUserDto) =>
  api.put<ApiResponse<User>>(`/auth/users/${id}`, dto).then((r) => r.data);

export const uploadAvatar = (id: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<ApiResponse<User>>(`/auth/users/${id}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const deleteUser = (id: string) =>
  api.delete<ApiResponse>(`/auth/users/${id}`).then((r) => r.data);

export const checkEmail = (email: string) =>
  api.get<ApiResponse<boolean>>('/auth/check-email', { params: { email } }).then((r) => r.data);
