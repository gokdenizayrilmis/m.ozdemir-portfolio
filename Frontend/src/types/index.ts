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
  doctorName: string;
  doctorTitle: string;
  doctorBio: string;
  logoUrl: string;
  doctorPortraitUrl: string;
  heroShowroomImageUrl: string;
  heroVideoUrl?: string;
  healthTurkiyeCertificateUrl: string;
  ministryCertificateUrl: string;
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

export interface CreateLeadPayload {
  fullName: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  sourcePageSlug: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface AdminAuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
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

