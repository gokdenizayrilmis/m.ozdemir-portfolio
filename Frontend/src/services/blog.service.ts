import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { BlogPost, Result } from '@/types';
import { httpClient } from './http-client';

export const blogService = {
  async getAll(tag?: string, onlyPublished: boolean = true): Promise<BlogPost[]> {
    const res = await httpClient.get<BlogPost[]>(
      API_ENDPOINTS.BLOGS.LIST(tag, onlyPublished),
      { next: { revalidate: 3600 } }
    );
    return res.isSuccess && res.data ? res.data : [];
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const res = await httpClient.get<BlogPost>(
      API_ENDPOINTS.BLOGS.BY_SLUG(slug),
      { next: { revalidate: 3600 } }
    );
    return res.isSuccess && res.data ? res.data : null;
  },

  async create(blog: Partial<BlogPost>): Promise<Result<BlogPost>> {
    return httpClient.post<BlogPost>(API_ENDPOINTS.BLOGS.BASE, blog, {
      timeoutMs: 5000,
    });
  },

  async update(
    id: string,
    blog: Partial<BlogPost>
  ): Promise<Result<BlogPost>> {
    return httpClient.put<BlogPost>(API_ENDPOINTS.BLOGS.BY_ID(id), blog, {
      timeoutMs: 5000,
    });
  },

  async togglePublish(id: string): Promise<Result<BlogPost>> {
    return httpClient.patch<BlogPost>(
      API_ENDPOINTS.BLOGS.TOGGLE_PUBLISH(id),
      undefined,
      { timeoutMs: 5000 }
    );
  },

  async delete(id: string): Promise<Result> {
    return httpClient.delete(API_ENDPOINTS.BLOGS.BY_ID(id), {
      timeoutMs: 5000,
    });
  },
};

