import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User, LoginResponse } from '@/types/auth';
import { AxiosError } from 'axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  oauthLogin: (provider: 'google' | 'github', code: string, redirectUri: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post<LoginResponse>('/identity/login', { email, password });
          
          if (response.data.success) {
            const { data: user, tokens } = response.data;
            
            // Set cookies for API interceptors
            Cookies.set('accessToken', tokens.accessToken);
            Cookies.set('refreshToken', tokens.refreshToken);

            set({
              user,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isAuthenticated: true,
            });
            return { success: true };
          }
          return { success: false, message: response.data.message || 'Login failed' };
        } catch (error: unknown) {
          let errorMessage = 'An unexpected error occurred during login';
          if (error instanceof AxiosError) {
            const data = error.response?.data as Record<string, unknown>;
            errorMessage = (data?.message as string) || error.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          return {
            success: false,
            message: errorMessage,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      oauthLogin: async (provider, code, redirectUri) => {
        set({ isLoading: true });
        try {
          const response = await api.post(`/identity/oauth/${provider}`, { code, redirectUri });
          
          if (response.data && response.data.success && response.data.data) {
            const data = response.data.data;
            const user = data.user || data.User;
            const accessToken = data.accessToken || data.AccessToken;
            const refreshToken = data.refreshToken || data.RefreshToken;
            
            if (!accessToken || !user) {
              return { success: false, message: 'Invalid server response: Missing user data or tokens' };
            }

            Cookies.set('accessToken', accessToken);
            Cookies.set('refreshToken', refreshToken || '');

            set({
              user,
              accessToken,
              refreshToken: refreshToken || null,
              isAuthenticated: true,
            });
            return { success: true };
          }
          return { success: false, message: response.data?.message || `${provider} login failed` };
        } catch (error: unknown) {
          console.error('OAuth exchange error:', error);
          let errorMessage = 'OAuth login failed';
          if (error instanceof AxiosError) {
            const data = error.response?.data as Record<string, unknown>;
            errorMessage = (data?.message as string) || (error.response?.statusText) || error.message;
          }
          return { success: false, message: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updatedFields) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedFields } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
