export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roleId: string;
  role?: string;
  isOnboarded: boolean;
  isEmailVerified: boolean;
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiryDate: string;
}

export interface LoginResponse {
  success: boolean;
  data: User;
  tokens: TokenResult;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
