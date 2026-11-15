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

