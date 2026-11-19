'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { trackConversionClick } from '@/hooks/use-utm-tracker';
import { cn, createWhatsAppUrl, formatPhoneNumber } from '@/utils/cn';

export interface ContactActionButtonsProps {
  phone?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  callLabel?: string;
  whatsappLabel?: string;
  layout?: 'centered' | 'grid' | 'sticky-bar' | 'stack';
  sourcePageSlug?: string;
  className?: string;
}

export const CALL_BUTTON_BASE_CLASS =
  'bg-[#B8864B] hover:bg-[#a6763f] active:bg-[#a6763f] text-white font-semibold rounded-xl shadow-md inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all';

export const WHATSAPP_BUTTON_BASE_CLASS =
  'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-700 text-white font-semibold rounded-xl shadow-md inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all';

export default function ContactActionButtons({
  phone = '+905522656436',
  whatsappNumber = '905522656436',
  whatsappMessage = 'Merhaba Prof. Dr. Mustafa Özdemir Kliniği, randevu ve tedavi süreçleri hakkında bilgi almak istiyorum.',
  callLabel = 'Bizi Arayın',
  whatsappLabel = 'WhatsApp ile İletişime Geçin',
  layout = 'centered',
  sourcePageSlug,
  className,
}: ContactActionButtonsProps) {
  const telUrl = `tel:${formatPhoneNumber(phone)}`;
  const whatsappUrl = createWhatsAppUrl(whatsappNumber, whatsappMessage);

  const handlePhoneClick = () => {
    trackConversionClick('PhoneClick', sourcePageSlug);
  };

  const handleWhatsAppClick = () => {
    trackConversionClick('WhatsAppClick', sourcePageSlug);
  };

  const isStickyBar = layout === 'sticky-bar';
  const isGrid = layout === 'grid';
  const isStack = layout === 'stack';

  const containerClass = cn(
    layout === 'centered' &&
      'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full max-w-md sm:max-w-[460px] mx-auto',
    isGrid && 'grid grid-cols-1 sm:grid-cols-2 gap-3 w-full',
    isStickyBar && 'grid grid-cols-2 gap-2 w-full',
    isStack && 'flex flex-col gap-2.5 w-full',
    className
  );

  const buttonSizeClass = isStickyBar
    ? 'w-full py-3 px-2 text-[11px] sm:text-xs whitespace-nowrap'
    : isGrid
      ? 'w-full py-3 px-3.5 text-xs whitespace-nowrap'
      : isStack
        ? 'w-full py-3 px-4 text-xs'
        : 'w-full py-3 px-4 text-xs sm:text-sm whitespace-nowrap';

  return (
    <div className={containerClass}>
      {/* Left Button: Call Us */}
      <a
        href={telUrl}
        onClick={handlePhoneClick}
        aria-label={`${callLabel}: ${phone}`}
        title={`${callLabel}: ${phone}`}
        className={cn(CALL_BUTTON_BASE_CLASS, buttonSizeClass)}
      >
        <Phone className="w-4 h-4 shrink-0 text-white" />
        <span>{callLabel}</span>
      </a>

      {/* Right Button: WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label={whatsappLabel}
        title={whatsappLabel}
        className={cn(WHATSAPP_BUTTON_BASE_CLASS, buttonSizeClass)}
      >
        <MessageCircle className="w-4 h-4 shrink-0 text-white" />
        <span>{whatsappLabel}</span>
      </a>
    </div>
  );
}
