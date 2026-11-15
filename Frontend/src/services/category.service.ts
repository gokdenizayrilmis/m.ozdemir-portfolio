import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Category, Result } from '@/types';
import { httpClient } from './http-client';

export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    title: 'Dermatoloji',
    slug: 'dermatoloji',
    description:
      'Akne, rozasea, egzama, sedef, vitiligo, HPV genital siğil ve ben taraması.',
    displayOrder: 1,
    seo: {
      metaTitle: 'Klinik Dermatoloji Tedavileri | Prof. Dr. Mustafa Özdemir',
      metaDescription:
        'İstanbul Bakırköy Ataköy\'de klinik dermatoloji tanı ve tedavileri.',
      focusKeywords: ['dermatoloji', 'bakırköy dermatolog'],
      noIndex: false,
      schemaType: 'MedicalWebPage',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    title: 'Kozmetik Dermatoloji',
    slug: 'kozmetik-dermatoloji',
    description:
      'Ameliyatsız ip askısı, peeling, leke tedavileri, aşırı terleme ve mezoterapi.',
    displayOrder: 2,
    seo: {
      metaTitle: 'Kozmetik Dermatoloji | Prof. Dr. Mustafa Özdemir',
      metaDescription:
        'Uzman dermatolog kontrolünde estetik dermatoloji uygulamaları.',
      focusKeywords: ['kozmetik dermatoloji'],
      noIndex: false,
      schemaType: 'MedicalWebPage',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    title: 'Saç Hastalıkları',
    slug: 'sac-hastaliklari',
    description:
      'Saç dökülmesi, saç kıran (alopesi) ve saç mezoterapisi protokolleri.',
    displayOrder: 3,
    seo: {
      metaTitle: 'Saç Hastalıkları ve Tedavisi | Prof. Dr. Mustafa Özdemir',
      metaDescription: 'Saç dökülmesi ve saç mezoterapisi tedavileri.',
      focusKeywords: ['saç dökülmesi', 'saç mezoterapisi'],
      noIndex: false,
      schemaType: 'MedicalWebPage',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    title: 'Lazer Tedavileri',
    slug: 'lazer',
    description:
      'Lazerle leke tedavisi, dövme silme, kılcal damar ve cilt yenileme.',
    displayOrder: 4,
    seo: {
      metaTitle: 'Lazerle Cilt ve Leke Tedavileri | Prof. Dr. Mustafa Özdemir',
      metaDescription:
        'İleri teknoloji lazer sistemleri ile leke ve dövme silme.',
      focusKeywords: ['lazer tedavisi'],
      noIndex: false,
      schemaType: 'MedicalWebPage',
    },
    createdAt: new Date().toISOString(),
  },
];

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await httpClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE, {
      next: { revalidate: 3600 },
    });
    return res.isSuccess && res.data && res.data.length > 0
      ? res.data
      : FALLBACK_CATEGORIES;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const res = await httpClient.get<Category>(
      API_ENDPOINTS.CATEGORIES.BY_SLUG(slug),
      { next: { revalidate: 3600 } }
    );
    if (res.isSuccess && res.data) {
      return res.data;
    }
    return FALLBACK_CATEGORIES.find((c) => c.slug === slug) || null;
  },

  async create(category: Partial<Category>): Promise<Result<Category>> {
    return httpClient.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, category, {
      timeoutMs: 5000,
    });
  },

  async update(
    id: string,
    category: Partial<Category>
  ): Promise<Result<Category>> {
    return httpClient.put<Category>(
      API_ENDPOINTS.CATEGORIES.BY_ID(id),
      category,
      { timeoutMs: 5000 }
    );
  },

  async delete(id: string): Promise<Result> {
    return httpClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id), {
      timeoutMs: 5000,
    });
  },
};

