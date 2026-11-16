import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Result, SiteSettings } from '@/types';
import { httpClient } from './http-client';

export const FALLBACK_SETTINGS: SiteSettings = {
  id: 'default-settings',
  clinicName: 'Prof. Dr. Mustafa Özdemir Dermatoloji & Lazer Kliniği',
  doctorName: 'Prof. Dr. Mustafa Özdemir',
  doctorTitle: 'Dermatoloji (Deri ve Zührevi Hastalıkları) Uzmanı',
  doctorBio:
    '<p>11 Haziran 1970 tarihinde Yozgat’ta doğdu. İlk, orta ve lise öğrenimini Yozgat ve Kayseri’de tamamladı. 1995 yılında İstanbul Üniversitesi, Cerrahpaşa Tıp Fakültesi’nden mezun oldu.</p><p>Dermatoloji uzmanlık eğitimini 1996-2000 yılları arasında yine Cerrahpaşa Tıp Fakültesi Dermatoloji Anabilim Dalı’nda “Vitiligo’da cerrahi tedavi yöntemlerinin karşılaştırılması ve basic fibroblast growth factor (bFGF) düzeyi” konulu teziyle tamamladı. Takiben Kıbrıs’ta Girne 200 yataklı Askeri Hastanesi’nde askerlik görevini yaptı.</p><p>İstanbul’da özel bir hastanede 4 yıl dermatoloji uzmanı olarak çalıştıktan sonra 2005-2010 yıllarında Selçuk Üniversitesi Meram Tıp Fakültesi ve Selçuklu Tıp Fakültesi Dermatoloji Anabilim Dalı’nda Yardımcı Doçent olarak çalıştı. 2010 yılında Doçentlik unvanını kazandı. 2010-2012 yılları arasında Bezmialem Üniversitesi Tıp Fakültesi’nde çalıştı. 2012 tarihinde İstanbul Medipol Üniversitesi, Tıp Fakültesi, Deri ve Zührevi Hastalıklar AD, Kürsü Başkanı olarak atandı.</p><p>Ağustos 2015 yılında Profesör oldu. Dermatoloji alanında ilgi alanları; Vitiligo, Behçet hastalığı, saç hastalıkları, alerjik deri hastalıkları, psoriasis, biyolojik tedaviler ve akne hastalığıdır. Kozmetik dermatoloji alanında botulinum toksini uygulamaları, dolgu maddeleri uygulamaları, lazerler, yüz ve cilt gençleştirme sistemleri, ip ile yüz germe, lipoliz ve mezoterapi ile ilgilenmektedir.</p><p>Ulusal/uluslararası düzeyde birçok kongrede sunumlar yapmış ve makaleler yayınlamıştır. Editörlüğünü yapmış olduğu “Psoriasis güncel yaklaşımlar” ve “Dermatolojide klinik metrik ölçümler ve sınıflama kriterleri” adlı iki kitabı vardır. Ayrıca birçok kitapta bölüm yazarlığı yapmıştır. Birçok tıbbi derneğe üyeliği vardır ve iyi derecede İngilizce bilmektedir.</p>',
  logoUrl: '/uploads/corporate/logo.png',
  doctorPortraitUrl: '/uploads/corporate/doctor-portrait.jpg',
  heroShowroomImageUrl: '/uploads/corporate/hero-showroom.jpg',
  heroVideoUrl: '',
  healthTurkiyeCertificateUrl: '/uploads/corporate/health-turkiye-certificate.jpeg',
  ministryCertificateUrl: '/uploads/corporate/ministry-certificate.jpeg',
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

