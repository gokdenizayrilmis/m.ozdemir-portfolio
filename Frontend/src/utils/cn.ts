import { BACKEND_ORIGIN } from '@/constants/api-endpoints';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function createWhatsAppUrl(
  phone: string,
  message: string = 'Merhaba Prof. Dr. Mustafa Özdemir Kliniği, randevu ve bilgi almak istiyorum.'
): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export function resolveMediaUrl(url?: string, fallback: string = ''): string {
  const raw = (url || fallback || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }
  if (raw.startsWith('/uploads/')) {
    return `${BACKEND_ORIGIN}${raw}`;
  }
  return raw;
}

