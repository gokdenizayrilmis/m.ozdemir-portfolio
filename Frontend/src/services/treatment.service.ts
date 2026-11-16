import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Result, Treatment } from '@/types';
import { httpClient } from './http-client';

export const FALLBACK_TREATMENTS: Treatment[] = [
  {
    id: 't-1',
    title: 'Lazerle Leke Tedavisi',
    slug: 'lazerle-leke-tedavisi',
    categoryId: 'cat-1',
    categorySlug: 'dermatoloji',
    summary:
      'Güneş lekeleri, melazma ve yaşlılık lekelerinde hedefli lazer protokolleri ile güvenli leke tedavisi.',
    htmlContent:
      '<h2>Lazerle Leke Tedavisi</h2><p>Lazerle leke tedavisi cildin melanin pigmentini hedef alarak çevre dokuya zarar vermeden lekelerin açılmasını sağlar.</p>',
    coverImageUrl: '/uploads/treatments/lazerle-leke-tedavisi.jpg',
    displayOrder: 1,
    isPublished: true,
    faqs: [
      {
        question: 'Lazerle leke tedavisi kaç seans sürer?',
        answer: 'Lekenin derinliğine göre ortalama 3-6 seans arası planlanmaktadır.',
      },
    ],
    seo: {
      metaTitle: 'Lazerle Leke Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir',
      metaDescription: 'Bakırköy Ataköy\'de lazerle leke tedavisi.',
      focusKeywords: ['lazerle leke tedavisi'],
      noIndex: false,
      schemaType: 'MedicalWebPage',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Akne (Sivilce) Tedavisi',
    slug: 'akne-sivilce-tedavisi',
    categoryId: 'cat-1',
    categorySlug: 'dermatoloji',
    summary:
      'Ergenlik ve yetişkin dönemi akne problemlerinde kalıcı iz oluşumunu engelleyen dermatolojik tedaviler.',
    htmlContent:
      '<h2>Akne ve Sivilce Tedavisi</h2><p>Akne tedavisinde topikal ve medikal ajanlarla sebum dengesi sağlanır.</p>',
    coverImageUrl: '/uploads/treatments/akne-sivilce-tedavisi.png',
    displayOrder: 2,
    isPublished: true,
    faqs: [
      {
        question: 'Akne tedavisinde ne zaman sonuç alınır?',
        answer: 'Genellikle 4-6. haftalarda ilk belirgin iyileşmeler başlar.',
      },
    ],
    seo: {
      metaTitle: 'Akne (Sivilce) Tedavisi Bakırköy | Prof. Dr. Mustafa Özdemir',
      metaDescription: 'Kişiye özel akne ve sivilce izi tedavileri.',
      focusKeywords: ['akne tedavisi'],
      noIndex: false,
      schemaType: 'MedicalWebPage',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'HPV – Genital Siğil Tedavisi',
    slug: 'hpv-genital-sigil-tedavisi',
    categoryId: 'cat-1',
    categorySlug: 'dermatoloji',
    summary:
      'HPV kaynaklı genital siğil (kondilom) lezyonlarında hasta mahremiyetine tam saygılı kriyoterapi ve lazer tedavisi.',
    htmlContent:
      '<h2>HPV ve Genital Siğil Tedavisi</h2><p>Hasta mahremiyetine tam saygı gösterilerek kriyoterapi ve koterizasyon yöntemleri uygulanır.</p>',
    coverImageUrl: '/uploads/treatments/hpv-genital-sigil-tedavisi.png',
    displayOrder: 3,
    isPublished: true,
    faqs: [
      {
        question: 'İşlem sırasında ağrı hissedilir mi?',
        answer: 'Lokal anestezi sayesinde hasta işlem sırasında ağrı hissetmez.',
      },
    ],
    seo: {
      metaTitle: 'HPV ve Genital Siğil Tedavisi | Prof. Dr. Mustafa Özdemir',
      metaDescription: 'Bakırköy Ataköy\'de HPV genital siğil tedavisi.',
      focusKeywords: ['hpv tedavisi', 'genital siğil'],
      noIndex: false,
      schemaType: 'MedicalWebPage',
    },
    createdAt: new Date().toISOString(),
  },
];

export const treatmentService = {
  async getAll(
    categorySlug?: string,
    onlyPublished: boolean = true
  ): Promise<Treatment[]> {
    const res = await httpClient.get<Treatment[]>(
      API_ENDPOINTS.TREATMENTS.LIST(categorySlug, onlyPublished),
      { next: { revalidate: 3600 } }
    );

    if (res.isSuccess && res.data && res.data.length > 0) {
      return res.data;
    }

    if (categorySlug) {
      return FALLBACK_TREATMENTS.filter((t) => t.categorySlug === categorySlug);
    }
    return FALLBACK_TREATMENTS;
  },

  async getBySlug(slug: string): Promise<Treatment | null> {
    const res = await httpClient.get<Treatment>(
      API_ENDPOINTS.TREATMENTS.BY_SLUG(slug),
      { next: { revalidate: 3600 } }
    );

    if (res.isSuccess && res.data) {
      return res.data;
    }

    return FALLBACK_TREATMENTS.find((t) => t.slug === slug) || null;
  },

  async create(treatment: Partial<Treatment>): Promise<Result<Treatment>> {
    return httpClient.post<Treatment>(
      API_ENDPOINTS.TREATMENTS.BASE,
      treatment,
      { timeoutMs: 5000 }
    );
  },

  async update(
    id: string,
    treatment: Partial<Treatment>
  ): Promise<Result<Treatment>> {
    return httpClient.put<Treatment>(
      API_ENDPOINTS.TREATMENTS.BY_ID(id),
      treatment,
      { timeoutMs: 5000 }
    );
  },

  async delete(id: string): Promise<Result> {
    return httpClient.delete(API_ENDPOINTS.TREATMENTS.BY_ID(id), {
      timeoutMs: 5000,
    });
  },
};

