import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { AdminAuthResponse, Result } from '@/types';
import {
  ADMIN_TOKEN_STORAGE_KEY,
  ADMIN_USER_STORAGE_KEY,
  httpClient,
} from './http-client';

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<Result<AdminAuthResponse>> {
    const res = await httpClient.post<AdminAuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password },
      { timeoutMs: 5000 }
    );

    if (res.isSuccess && res.data && typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, res.data.token);
      localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(res.data));
    }

    return res;
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  },

  getUser(): AdminAuthResponse | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AdminAuthResponse) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};

