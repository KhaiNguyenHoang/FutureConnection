import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  oauthProvider: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  updateTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

function loadFromStorage() {
  if (typeof window === 'undefined') return { user: null, token: null, refreshToken: null };
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null') as User | null;
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return { user, token, refreshToken };
  } catch {
    return { user: null, token: null, refreshToken: null };
  }
}

const { user: storedUser, token: storedToken, refreshToken: storedRefresh } = loadFromStorage();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser,
  token: storedToken,
  refreshToken: storedRefresh,
  isAuthenticated: !!storedToken,
  isEmailVerified: storedUser?.isEmailVerified ?? false,
  oauthProvider: storedUser?.externalProvider ?? null,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      user,
      token,
      refreshToken,
      isAuthenticated: true,
      isEmailVerified: user.isEmailVerified,
      oauthProvider: user.externalProvider ?? null,
    });
  },

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem('auth_user', JSON.stringify(updated));
    set({
      user: updated,
      isEmailVerified: updated.isEmailVerified,
      oauthProvider: updated.externalProvider ?? null,
    });
  },

  updateTokens: (token, refreshToken) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    set({ token, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isEmailVerified: false, oauthProvider: null });
    window.location.href = '/login';
  },
}));
