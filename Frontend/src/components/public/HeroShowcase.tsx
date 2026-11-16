'use client';

import { m } from 'motion/react';
import { SiteSettings } from '@/types';
import { trackConversionClick } from '@/hooks/use-utm-tracker';
import { resolveMediaUrl } from '@/utils/cn';
import { Phone } from 'lucide-react';

interface HeroShowcaseProps {
  settings: SiteSettings | null;
}

export default function HeroShowcase({ settings }: HeroShowcaseProps) {
  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';

  // Full-bleed clinic reception photo with Prof. Dr. Mustafa Özdemir on the right
  const heroBgUrl = resolveMediaUrl(
    settings?.heroShowroomImageUrl,
    '/uploads/corporate/hero-showroom.jpg'
  );

  const handlePhoneClick = () => {
    trackConversionClick('PhoneClick', '/');
  };

  return (
    <section className="relative h-screen min-h-[680px] flex items-end lg:items-center overflow-hidden bg-espresso-950 pt-20 lg:pt-24 pb-14 lg:pb-16">
      {/* Background Photo */}
      {heroBgUrl && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroBgUrl}
            alt={settings?.doctorName || 'Prof. Dr. Mustafa Özdemir Kliniği'}
            className="w-full h-full object-cover object-[72%_20%] lg:object-[center_18%] brightness-[0.82]"
          />
          {/* Top subtle gradient so transparent navbar links and logo pop clearly */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#120c09]/70 to-transparent" />
          {/* Desktop Gradient: Rich dark left-to-right overlay */}
          <div className="hidden lg:block absolute inset-0 bg-[linear-gradient(90deg,rgba(18,12,9,0.92)_0%,rgba(18,12,9,0.76)_42%,rgba(18,12,9,0.38)_72%,rgba(18,12,9,0.25)_100%)]" />
          {/* Mobile Gradient */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-[#120c09]/95 via-[#120c09]/75 to-[#120c09]/35" />
        </div>
      )}

      {/* Foreground Content (Left Side on Desktop) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl lg:max-w-2xl space-y-5 sm:space-y-6"
        >
          {/* Main Two-Tone Editorial Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-sans font-extrabold tracking-tight leading-[1.12]">
            <span className="block text-white">Cildinize Değer</span>
            <span className="block text-white">Verin...</span>
            <span className="block text-bronze-400 mt-1">
              Sağlıklı ve Pürüzsüz
            </span>
            <span className="block text-bronze-400">
              Bir Cilt Hayal Değil!
            </span>
          </h1>

          {/* Welcoming Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-peach-100/90 leading-relaxed max-w-xl font-normal">
            En etkili ve güvenli dermatolojik tedavi yöntemleri, ileri lazer
            teknolojileri ve 30 yılı aşkın akademik tıp deneyimimiz ile
            İstanbul Ataköy kliniğimizde sizleri bekliyoruz...
          </p>

          {/* Doctor Signature Style Line */}
          <p className="font-serif italic text-2xl sm:text-3xl text-peach-200/90 tracking-wide pt-1">
            {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
          </p>

          {/* Pill Action Buttons (Matching Reference Site) */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <m.a
              href="#uzmanlik-alanlari"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-bronze-600 hover:bg-bronze-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-black/25 transition-colors"
            >
              Uzmanlık Alanları
            </m.a>

            <m.a
              href="#hakkimda"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/15 text-white border border-bronze-400/70 hover:border-bronze-300 text-xs sm:text-sm font-semibold backdrop-blur-sm transition-colors"
            >
              Hakkımda
            </m.a>

            <m.a
              href="#iletisim"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/15 text-white border border-bronze-400/70 hover:border-bronze-300 text-xs sm:text-sm font-semibold backdrop-blur-sm transition-colors"
            >
              İletişim
            </m.a>

            <m.a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              onClick={handlePhoneClick}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex sm:hidden items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-bronze-400" />
              <span>Hemen Ara</span>
            </m.a>
          </div>
        </m.div>
      </div>
    </section>
  );
}
