import { API_BASE_URL } from '@/constants/api-endpoints';
import { Result } from '@/types';

export const ADMIN_TOKEN_STORAGE_KEY = 'clinic_admin_token';
export const ADMIN_USER_STORAGE_KEY = 'clinic_admin_user';

export interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
}

class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  public async request<T>(
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<Result<T>> {
    const { timeoutMs = 400, ...fetchOptions } = options;
    const url = this.getFullUrl(endpoint);

    const headers = new Headers(fetchOptions.headers || {});
    if (
      !headers.has('Content-Type') &&
      !(fetchOptions.body instanceof FormData)
    ) {
      headers.set('Content-Type', 'application/json');
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out')), timeoutMs)
      );

      const fetchPromise = fetch(url, {
        ...fetchOptions,
        headers,
      }).then(async (res) => {
        const json = (await res.json()) as Result<T>;
        return json;
      });

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      return {
        isSuccess: false,
        message: 'Sunucuya bağlanırken bir hata oluştu.',
        errors: [(error as Error).message],
      };
    }
  }

  public get<T>(endpoint: string, options: HttpRequestOptions = {}): Promise<Result<T>> {
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
      body: body instanceof FormData ? body : JSON.stringify(body),
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
      body: body ? JSON.stringify(body) : undefined,
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

