import { create } from 'zustand';
import api from '@/lib/api';
import { RegisterResponse } from '@/types/auth';
import { AxiosError } from 'axios';

interface RegisterState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: string;
  isLoading: boolean;
  error: string | null;
  setField: (name: string, value: string) => void;
  reset: () => void;
  submit: () => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string }>;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleId: '', // Default empty, will handle in UI
  isLoading: false,
  error: null,

  setField: (name, value) => {
    set((state) => ({ ...state, [name]: value }));
  },

  reset: () => {
    set({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      isLoading: false,
      error: null,
    });
  },

  submit: async () => {
    const { firstName, lastName, email, password, confirmPassword, roleId } = get();
    
    if (password !== confirmPassword) {
      set({ error: 'Passwords do not match' });
      return { success: false, message: 'Passwords do not match' };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await api.post<RegisterResponse>('/identity/register', {
        firstName,
        lastName,
        email,
        password,
        roleId: roleId || undefined, // Send undefined if empty to let backend handle default
      });

      if (response.data.success) {
        set({ isLoading: false });
        return { success: true };
      }
      
      const message = response.data.message || 'Registration failed';
      set({ isLoading: false, error: message });
      return { success: false, message };
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof AxiosError) {
        const data = error.response?.data as Record<string, unknown>;
        errorMessage = (data?.message as string) || error.message;
      }
      set({ isLoading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/identity/forgot-password', { email });
      set({ isLoading: false });
      return { success: response.data.success, message: response.data.message };
    } catch (error: unknown) {
      let errorMessage = 'Failed to send reset email';
      if (error instanceof AxiosError) {
        const data = error.response?.data as Record<string, unknown>;
        errorMessage = (data?.message as string) || error.message;
      }
      set({ isLoading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/identity/resend-verification', { email });
      set({ isLoading: false });
      return { success: response.data.success, message: response.data.message };
    } catch (error: unknown) {
      let errorMessage = 'Failed to resend verification email';
      if (error instanceof AxiosError) {
        const data = error.response?.data as Record<string, unknown>;
        errorMessage = (data?.message as string) || error.message;
      }
      set({ isLoading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/identity/verify-email?token=${token}`);
      set({ isLoading: false });
      return { success: response.data.success, message: response.data.message };
    } catch (error: unknown) {
      let errorMessage = 'Verification failed';
      if (error instanceof AxiosError) {
        const data = error.response?.data as Record<string, unknown>;
        errorMessage = (data?.message as string) || error.message;
      }
      set({ isLoading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },
}));
