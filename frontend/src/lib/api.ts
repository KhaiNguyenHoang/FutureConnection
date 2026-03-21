import axios from 'axios';
import { API_URL } from '@/constants';

const api = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (!refreshToken) {
        clearAuthStorage();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        if (res.data.success && res.data.data) {
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem('auth_token', accessToken);
          localStorage.setItem('refresh_token', newRefresh);
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          original.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return api(original);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthStorage();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  }
}

export default api;
