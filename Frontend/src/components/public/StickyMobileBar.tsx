'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { trackConversionClick } from '@/hooks/use-utm-tracker';
import { createWhatsAppUrl } from '@/utils/cn';

interface StickyMobileBarProps {
  phone: string;
  whatsappNumber: string;
}

export default function StickyMobileBar({
  phone,
  whatsappNumber,
}: StickyMobileBarProps) {
  const waUrl = createWhatsAppUrl(whatsappNumber);

  const handlePhoneClick = () => {
    trackConversionClick('PhoneClick', window.location.pathname);
  };

  const handleWhatsAppClick = () => {
    trackConversionClick('WhatsAppClick', window.location.pathname);
  };

  return (
    <aside
      aria-label="Hızlı İletişim Çubuğu"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-2xl flex items-center gap-2 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
    >
      {/* Call Button */}
      <a
        href={`tel:${phone.replace(/\s+/g, '')}`}
        onClick={handlePhoneClick}
        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 active:bg-slate-800 text-white py-3 px-3 rounded-xl font-semibold text-xs tracking-wide shadow-sm transition"
      >
        <Phone className="w-4 h-4 text-amber-400" />
        <span>Hemen Ara</span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        className="flex-[1.2] flex items-center justify-center gap-2 bg-emerald-600 active:bg-emerald-700 text-white py-3 px-3 rounded-xl font-semibold text-xs tracking-wide shadow-sm transition"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp Randevu</span>
      </a>
    </aside>
  );
}

