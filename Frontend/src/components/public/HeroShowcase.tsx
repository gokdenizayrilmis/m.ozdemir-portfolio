'use client';

import { m } from 'motion/react';
import { SiteSettings } from '@/types';
import { trackConversionClick } from '@/hooks/use-utm-tracker';
import { createWhatsAppUrl, resolveMediaUrl } from '@/utils/cn';
import { MessageCircle } from 'lucide-react';

interface HeroShowcaseProps {
  settings: SiteSettings | null;
}

export default function HeroShowcase({ settings }: HeroShowcaseProps) {
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const waUrl = createWhatsAppUrl(whatsappNumber);

  // Full-bleed clinic reception photo with Prof. Dr. Mustafa Özdemir on the right
  const heroBgUrl = resolveMediaUrl(
    settings?.heroShowroomImageUrl,
    '/uploads/corporate/hero-showroom.jpg'
  );

  const handleWhatsAppClick = () => {
    trackConversionClick('WhatsAppClick', '/');
  };

  return (
    <section className="relative h-screen min-h-[680px] flex flex-col justify-end pb-24 md:justify-center md:pb-0 md:pt-20 overflow-hidden bg-espresso-950">
      {/* Background Photo */}
      {heroBgUrl && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroBgUrl}
            alt={settings?.doctorName || 'Prof. Dr. Mustafa Özdemir Kliniği'}
            className="w-full h-full object-cover object-[72%_top] origin-[72%_0%] scale-[1.35] -translate-y-24 md:object-center md:origin-center md:scale-100 md:translate-y-0"
          />
          {/* Top subtle gradient so transparent navbar links and logo stay legible */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#120F0D]/55 to-transparent" />
          {/* Desktop Gradient: Left-to-right so text is crisp and doctor portrait stays bright */}
          <div className="hidden md:block absolute inset-0 md:bg-gradient-to-r md:from-[#120F0D]/95 md:via-[#120F0D]/65 md:to-transparent" />
          {/* Mobile Gradient: Bottom-to-top so doctor's face in upper half stays clear */}
          <div className="md:hidden absolute inset-0 bg-gradient-to-t from-[#120F0D] via-[#120F0D]/80 via-45% to-transparent" />
        </div>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5"
        >
          {/* Main Two-Tone Editorial Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-sans font-extrabold tracking-tight leading-[1.12]">
            <span className="block text-white">Cildinize <br className="sm:hidden" /> Değer Verin</span>
            <span className="block text-bronze-400 mt-1.5">
              Sağlıklı ve Pürüzsüz <br className="sm:hidden" />
              Bir 
              Cilt Hayal Değil
            </span>
          </h1>

          {/* Welcoming Subtitle */}
          <p className="text-sm md:text-base text-peach-100/90 leading-relaxed max-w-xl font-normal">
            En etkili ve güvenli dermatolojik tedavi yöntemleri, ileri lazer
            teknolojileri ve 30 yılı aşkın akademik tıp deneyimimiz ile
            İstanbul Ataköy kliniğimizde sizleri bekliyoruz.
          </p>

          {/* Doctor Signature Style Line */}
          <p className="font-serif italic text-xl sm:text-3xl text-peach-200/90 tracking-wide pt-0.5">
            {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
          </p>

          {/* Clean 2-Button CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <m.a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#B8864B] hover:bg-[#a6763f] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-black/25 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp ile Randevu Al</span>
            </m.a>

            <m.a
              href="#uzmanlik-alanlari"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-colors"
            >
              Tedavi &amp; Uzmanlık Alanlarımız ↓
            </m.a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
