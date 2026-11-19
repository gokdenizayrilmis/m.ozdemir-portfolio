import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Result, SiteSettings } from '@/types';
import { httpClient } from './http-client';

export const FALLBACK_SETTINGS: SiteSettings = {
  id: 'default-settings',
  clinicName: 'Prof. Dr. Mustafa Özdemir Dermatoloji & Lazer Kliniği',
  address:
    'Ataköy 7-8-9-10. Kısım Mah. Çobançeşme E-5 Yanyol Cad. Ataköy Towers B-Blok No:146, 34158 Bakırköy/İstanbul',
  phoneNumbers: ['+90 552 265 64 36', '0 553 794 26 00'],
  whatsAppNumber: '905522656436',
  email: 'mustafaozdemir@yahoo.com',
  workingHours: 'Pazartesi - Cumartesi: 09:30 - 19:00',
  googleMapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.660602418987!2d28.8315!3d40.9895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU5JzIyLjIiTiAyOMKwNDknNTMuNCJF!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str',
  socialMedia: {
    instagram: 'https://www.instagram.com/prof.dr.mustafaozdemir',
    facebook: 'https://www.facebook.com/drmustafaozdemir',
  },
  legalNotice:
    'T.C. Sağlık Bakanlığı mevzuatı gereğince sitemizde işlem fiyatları belirtilmemektedir. İçerikler yalnızca bilgilendirme amaçlıdır.',
  createdAt: new Date().toISOString(),
};

export const settingsService = {
  async getSettings(): Promise<SiteSettings | null> {
    const res = await httpClient.get<SiteSettings>(
      API_ENDPOINTS.SETTINGS.BASE,
      { next: { revalidate: 3600 } }
    );
    return res.isSuccess && res.data ? res.data : FALLBACK_SETTINGS;
  },

  async updateSettings(
    settings: Partial<SiteSettings>
  ): Promise<Result<SiteSettings>> {
    return httpClient.put<SiteSettings>(
      API_ENDPOINTS.SETTINGS.BASE,
      settings,
      { timeoutMs: 5000 }
    );
  },
};

