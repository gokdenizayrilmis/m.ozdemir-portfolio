export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5145/api';

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  TREATMENTS: {
    BASE: '/treatments',
    LIST: (categorySlug?: string, onlyPublished: boolean = true) => {
      const params = new URLSearchParams();
      if (categorySlug) params.set('categorySlug', categorySlug);
      if (!onlyPublished) params.set('onlyPublished', 'false');
      const qs = params.toString();
      return qs ? `/treatments?${qs}` : '/treatments';
    },
    BY_SLUG: (slug: string) => `/treatments/${encodeURIComponent(slug)}`,
    BY_ID: (id: string) => `/treatments/${encodeURIComponent(id)}`,
    TOGGLE_PUBLISH: (id: string) =>
      `/treatments/${encodeURIComponent(id)}/toggle-publish`,
  },
  BLOGS: {
    BASE: '/blogs',
    LIST: (tag?: string, onlyPublished: boolean = true) => {
      const params = new URLSearchParams();
      if (tag) params.set('tag', tag);
      if (!onlyPublished) params.set('onlyPublished', 'false');
      const qs = params.toString();
      return qs ? `/blogs?${qs}` : '/blogs';
    },
    BY_SLUG: (slug: string) => `/blogs/${encodeURIComponent(slug)}`,
    BY_ID: (id: string) => `/blogs/${encodeURIComponent(id)}`,
    TOGGLE_PUBLISH: (id: string) =>
      `/blogs/${encodeURIComponent(id)}/toggle-publish`,
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_SLUG: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  },
  LEADS: {
    BASE: '/leads',
    TRACK_CLICK: '/leads/track-click',
    SUMMARY: (range: string = '30d') =>
      `/leads/summary?range=${encodeURIComponent(range)}`,
    LIST: (params?: {
      range?: string;
      type?: string;
      page?: number;
      pageSize?: number;
      search?: string;
    }) => {
      const search = new URLSearchParams();
      if (params?.range) search.set('range', params.range);
      if (params?.type && params.type !== 'all') search.set('type', params.type);
      if (params?.page) search.set('page', String(params.page));
      if (params?.pageSize) search.set('pageSize', String(params.pageSize));
      if (params?.search && params.search.trim()) {
        search.set('search', params.search.trim());
      }
      const qs = search.toString();
      return qs ? `/leads?${qs}` : '/leads';
    },
    EXPORT: (range: string = 'all', type?: string) => {
      const search = new URLSearchParams();
      search.set('range', range);
      if (type && type !== 'all') search.set('type', type);
      return `/leads/export?${search.toString()}`;
    },
  },
  SETTINGS: {
    BASE: '/settings',
  },
  MEDIA: {
    BASE: '/media',
    UPLOAD: (folder: string = 'general') =>
      `/media/upload?folder=${encodeURIComponent(folder)}`,
    DELETE: (fileUrl: string) =>
      `/media?fileUrl=${encodeURIComponent(fileUrl)}`,
  },
} as const;
