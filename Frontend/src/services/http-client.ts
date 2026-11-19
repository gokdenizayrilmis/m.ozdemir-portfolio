import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api-endpoints';
import { AdminAuthResponse, Result } from '@/types';

export const ADMIN_TOKEN_STORAGE_KEY = 'clinic_admin_token';

let inMemoryAccessToken: string | null = null;

export interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
  _isRetry?: boolean;
}

class HttpClient {
  private readonly baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  public getAccessToken(): string | null {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    if (typeof window === 'undefined') return null;
    try {
      const stored = sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
      if (stored) {
        inMemoryAccessToken = stored;
        return stored;
      }
    } catch {
      // Ignore sessionStorage errors
    }
    return null;
  }

  public setSession(auth: AdminAuthResponse): void {
    const token = auth.accessToken || auth.token;
    inMemoryAccessToken = token;
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } catch {
      // Ignore sessionStorage errors
    }
  }

  public clearSession(): void {
    inMemoryAccessToken = null;
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  public async tryRefreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performSilentRefresh().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async performSilentRefresh(): Promise<string | null> {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), 5000);

    try {
      const url = this.getFullUrl(API_ENDPOINTS.AUTH.REFRESH);
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const json = (await res.json()) as Result<AdminAuthResponse>;
      if (json.isSuccess && json.data) {
        this.setSession(json.data);
        return json.data.accessToken || json.data.token;
      }

      this.clearSession();
      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timerId);
    }
  }

  public async request<T>(
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<Result<T>> {
    const { timeoutMs = 3500, _isRetry = false, ...fetchOptions } = options;
    const url = this.getFullUrl(endpoint);

    const headers = new Headers(fetchOptions.headers || {});
    if (
      !headers.has('Content-Type') &&
      !(fetchOptions.body instanceof FormData)
    ) {
      headers.set('Content-Type', 'application/json');
    }

    const isClient = typeof window !== 'undefined';
    if (isClient) {
      const token = this.getAccessToken();
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const isAuthBypassEndpoint =
      endpoint.startsWith(API_ENDPOINTS.AUTH.LOGIN) ||
      endpoint.startsWith(API_ENDPOINTS.AUTH.REFRESH) ||
      endpoint.startsWith(API_ENDPOINTS.AUTH.LOGOUT);

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: isClient ? 'include' : fetchOptions.credentials,
        signal: fetchOptions.signal ?? controller.signal,
      });

      // 429 Too Many Requests Handling (never trigger silent refresh)
      if (res.status === 429) {
        const retryAfterHeader = res.headers.get('Retry-After');
        const retrySeconds = retryAfterHeader
          ? parseInt(retryAfterHeader, 10)
          : NaN;
        let serverMessage = '';
        try {
          const json = (await res.json()) as Result<T>;
          serverMessage = json?.message || '';
        } catch {
          // Ignore non-JSON 429 body
        }

        const message =
          !Number.isNaN(retrySeconds) && retrySeconds > 0
            ? `Çok fazla işlem yaptınız. Lütfen ${retrySeconds} saniye sonra tekrar deneyin.`
            : serverMessage ||
              'Çok fazla işlem yaptınız. Lütfen birkaç saniye bekleyip tekrar deneyin.';

        return {
          isSuccess: false,
          message,
          errors: ['TooManyRequests'],
        };
      }

      // 401 Interceptor with Single Promise Lock
      if (res.status === 401 && isClient && !isAuthBypassEndpoint && !_isRetry) {
        const newAccessToken = await this.tryRefreshAccessToken();
        if (newAccessToken) {
          const retryHeaders = new Headers(fetchOptions.headers || {});
          if (
            !retryHeaders.has('Content-Type') &&
            !(fetchOptions.body instanceof FormData)
          ) {
            retryHeaders.set('Content-Type', 'application/json');
          }
          retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

          return this.request<T>(endpoint, {
            ...options,
            headers: retryHeaders,
            _isRetry: true,
          });
        }

        // Refresh failed -> clear session and redirect to login if inside admin panel
        this.clearSession();
        if (
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login'
        ) {
          window.location.href = '/admin/login';
        }

        return {
          isSuccess: false,
          message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapınız.',
          errors: ['Unauthorized'],
        };
      }

      const json = (await res.json()) as Result<T>;
      return json;
    } catch (error) {
      const err = error as Error;
      const message =
        err.name === 'AbortError'
          ? 'Sunucu yanıt süresi aşıldı.'
          : 'Sunucuya bağlanırken bir hata oluştu.';
      return {
        isSuccess: false,
        message,
        errors: [err.message],
      };
    } finally {
      clearTimeout(timerId);
    }
  }

  public get<T>(
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<Result<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options: HttpRequestOptions = {}
  ): Promise<Result<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body:
        body instanceof FormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options: HttpRequestOptions = {}
  ): Promise<Result<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options: HttpRequestOptions = {}
  ): Promise<Result<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = void>(
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<Result<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
