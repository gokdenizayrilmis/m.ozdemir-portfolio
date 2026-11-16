export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5145/api'
).replace('localhost', '127.0.0.1');

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
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
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_SLUG: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
    BY_ID: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },
  LEADS: {
    BASE: '/leads',
    LIST: (isRead?: boolean) =>
      typeof isRead === 'boolean' ? `/leads?isRead=${isRead}` : '/leads',
    TRACK_CLICK: '/leads/track-click',
    MARK_AS_READ: (id: string) => `/leads/${encodeURIComponent(id)}/read`,
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

