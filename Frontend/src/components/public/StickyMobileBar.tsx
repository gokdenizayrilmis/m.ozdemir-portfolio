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
    <>
      {/* Desktop Floating Pulsing WhatsApp Button (Bottom Right, Matching Reference Site) */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label="WhatsApp ile Hemen İletişime Geçin"
        title="WhatsApp Randevu Hattı"
        className="hidden lg:flex fixed bottom-7 right-7 z-50 items-center justify-center w-16 h-16 group focus:outline-none"
      >
        {/* Outer Soft Green Halo */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/25 scale-125 group-hover:scale-135 transition-transform duration-300" />
        {/* Pulsing Ping Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/55 animate-ping [animation-duration:2.2s]" />
        {/* Main Green Circle with Official WhatsApp Icon */}
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-xl shadow-[#25D366]/40 transition-transform duration-200 group-hover:scale-105">
          <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            className="w-7 h-7"
            aria-hidden="true"
          >
            <path d="M16.004 3.2c-7.068 0-12.8 5.732-12.8 12.8 0 2.256.588 4.46 1.706 6.404L3.09 28.8l6.556-1.72c1.88.996 3.992 1.522 6.154 1.522h.006c7.066 0 12.796-5.732 12.796-12.8 0-3.42-1.332-6.636-3.75-9.054A12.715 12.715 0 0 0 16.004 3.2zm0 23.242h-.004a10.62 10.62 0 0 1-5.414-1.482l-.388-.23-3.89 1.02 1.038-3.792-.252-.402a10.618 10.618 0 0 1-1.63-5.656c0-5.868 4.774-10.642 10.644-10.642 2.842 0 5.514 1.108 7.524 3.118a10.57 10.57 0 0 1 3.116 7.526c0 5.87-4.776 10.64-10.744 10.64zm5.838-7.968c-.32-.16-1.892-.934-2.186-1.04-.292-.106-.506-.16-.72.16-.212.32-.826 1.04-1.012 1.252-.186.214-.374.24-.694.08-.32-.16-1.35-.498-2.572-1.586-.95-.848-1.592-1.896-1.778-2.216-.186-.32-.02-.492.14-.652.144-.144.32-.374.48-.56.16-.186.212-.32.32-.534.106-.212.054-.4-.026-.56-.08-.16-.72-1.732-.986-2.372-.26-.624-.524-.538-.72-.548l-.612-.01c-.214 0-.56.08-.854.4-.292.32-1.12 1.092-1.12 2.666 0 1.572 1.146 3.092 1.306 3.306.16.212 2.256 3.444 5.464 4.83.764.33 1.36.526 1.824.674.766.244 1.464.21 2.016.128.614-.092 1.892-.774 2.158-1.52.266-.746.266-1.386.186-1.52-.08-.134-.292-.214-.612-.374z" />
          </svg>
        </span>
      </a>

      {/* Mobile Sticky Bottom Action Bar */}
      <aside
        aria-label="Hızlı İletişim Çubuğu"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-bronze-200 px-3 py-2.5 shadow-2xl flex items-center gap-2 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
      >
        {/* Call Button */}
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          onClick={handlePhoneClick}
          className="flex-1 flex items-center justify-center gap-2 bg-espresso-900 active:bg-espresso-800 text-white py-3 px-3 rounded-xl font-semibold text-xs tracking-wide shadow-sm transition"
        >
          <Phone className="w-4 h-4 text-bronze-400" />
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
    </>
  );
}
