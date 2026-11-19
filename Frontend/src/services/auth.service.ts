import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { AdminAuthResponse, ChangePasswordPayload, Result } from '@/types';
import { httpClient } from './http-client';

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

    if (res.isSuccess && res.data) {
      httpClient.setSession(res.data);
    }

    return res;
  },

  async refreshSession(): Promise<boolean> {
    const newToken = await httpClient.tryRefreshAccessToken();
    return Boolean(newToken);
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT, undefined, {
        timeoutMs: 3000,
      });
    } catch {
      // Even if network fails, clear client state
    } finally {
      httpClient.clearSession();
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<Result> {
    const res = await httpClient.post<void>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
      { timeoutMs: 5000 }
    );
    if (res.isSuccess) {
      httpClient.clearSession();
    }
    return res;
  },

  getToken(): string | null {
    return httpClient.getAccessToken();
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
