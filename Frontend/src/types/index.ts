export interface Result<T = void> {
  isSuccess: boolean;
  message: string;
  errors: string[];
  data?: T;
}

export interface SeoMetadata {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  focusKeywords: string[];
  noIndex: boolean;
  schemaType: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  displayOrder: number;
  seo: SeoMetadata;
  createdAt: string;
  updatedAt?: string;
}

export interface Treatment {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  summary: string;
  htmlContent: string;
  coverImageUrl: string;
  displayOrder: number;
  isPublished: boolean;
  faqs: FaqItem[];
  seo: SeoMetadata;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  htmlContent: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string;
  isPublished: boolean;
  tags: string[];
  seo: SeoMetadata;
  createdAt: string;
  updatedAt?: string;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  youTube?: string;
  linkedIn?: string;
  twitter?: string;
}

export interface SiteSettings {
  id: string;
  clinicName: string;
  address: string;
  phoneNumbers: string[];
  whatsAppNumber: string;
  email: string;
  workingHours: string;
  googleMapsEmbedUrl: string;
  socialMedia: SocialMediaLinks;
  googleTagManagerId?: string;
  googleAnalyticsId?: string;
  legalNotice: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  sourcePageSlug: string;
  conversionType: 'ContactForm' | 'WhatsAppClick' | 'PhoneClick';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type LeadRangeFilter = 'today' | '7d' | '30d' | 'month' | 'all';

export interface CampaignClickStat {
  campaign: string;
  count: number;
}

export interface PageClickStat {
  pageSlug: string;
  count: number;
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  whatsApp: number;
  phone: number;
  total: number;
}

export interface PreviousPeriodComparison {
  previousTotalClicks: number;
  previousWhatsAppClicks: number;
  previousPhoneClicks: number;
  totalChangePercent?: number | null;
  whatsAppChangePercent?: number | null;
  phoneChangePercent?: number | null;
}

export interface LeadsSummary {
  totalClicks: number;
  whatsAppClicks: number;
  phoneClicks: number;
  byCampaign: CampaignClickStat[];
  byPage: PageClickStat[];
  dailyTrend: DailyTrendPoint[];
  previousPeriod?: PreviousPeriodComparison | null;
  previousTotalClicks?: number | null;
  totalChangePercent?: number | null;
  whatsAppChangePercent?: number | null;
  phoneChangePercent?: number | null;
}

export interface PagedLeadsResponse {
  items: Lead[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminAuthResponse {
  token: string;
  accessToken?: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface TrackClickPayload {
  conversionType: 'WhatsAppClick' | 'PhoneClick';
  sourcePageSlug: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface UtmData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
