'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { SiteSettings } from '@/types';
import { trackConversionClick } from '@/hooks/use-utm-tracker';
import { createWhatsAppUrl, resolveMediaUrl } from '@/utils/cn';
import {
  Award,
  CheckCircle2,
  MessageCircle,
  Phone,
  ShieldCheck,
  ZoomIn,
  X,
} from 'lucide-react';

interface HeroShowcaseProps {
  settings: SiteSettings | null;
}

export default function HeroShowcase({ settings }: HeroShowcaseProps) {
  const [activeCertificate, setActiveCertificate] = useState<{
    title: string;
    subtitle: string;
    url: string;
  } | null>(null);

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const waUrl = createWhatsAppUrl(whatsappNumber);

  const portraitUrl = resolveMediaUrl(
    settings?.doctorPortraitUrl || settings?.heroShowroomImageUrl,
    '/uploads/corporate/doctor-portrait.jpg'
  );
  const ministryCertUrl = resolveMediaUrl(
    settings?.ministryCertificateUrl,
    '/uploads/corporate/ministry-certificate.jpeg'
  );
  const healthTurkiyeCertUrl = resolveMediaUrl(
    settings?.healthTurkiyeCertificateUrl,
    '/uploads/corporate/health-turkiye-certificate.jpeg'
  );

  const certificates = [
    {
      title: 'T.C. Sağlık Bakanlığı Yetki Belgesi',
      subtitle: 'Resmi Ruhsatlı Dermatoloji & Lazer Kliniği',
      url: ministryCertUrl,
    },
    {
      title: 'Health Türkiye Sertifikası',
      subtitle: 'Uluslararası Sağlık Turizmi Yetki Belgesi',
      url: healthTurkiyeCertUrl,
    },
  ].filter((c) => Boolean(c.url));

  const handleWhatsAppClick = () => {
    trackConversionClick('WhatsAppClick', '/');
  };

  const handlePhoneClick = () => {
    trackConversionClick('PhoneClick', '/');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-clinic-canvas to-peach-100/50 pt-8 sm:pt-14 pb-16 sm:pb-24 border-b border-bronze-200/60">
      {/* Subtle Ambient Logo-Peach Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-peach-200/35 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* LEFT COLUMN (Appears FIRST on mobile): Dynamic Doctor Portrait & Official Certificates */}
          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Logo Bronze & Espresso Framed Showcase Card */}
              <div className="relative rounded-3xl p-2 bg-gradient-to-br from-bronze-400/50 via-bronze-600/30 to-espresso-800/40 shadow-2xl shadow-espresso-900/15">
                <div className="relative rounded-[22px] overflow-hidden bg-espresso-900 aspect-[4/5] border border-peach-200/50">
                  {portraitUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portraitUrl}
                      alt={settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
                      className="w-full h-full object-cover object-top"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/15 to-transparent" />

                  {/* Bottom Doctor Caption inside Portrait */}
                  <div className="absolute bottom-5 sm:bottom-12 left-5 right-5 text-white">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-bronze-700/70 border border-peach-200/40 text-peach-100 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      Dermatoloji & Lazer Uzmanı
                    </span>
                    <p className="font-serif font-bold text-lg sm:text-xl leading-tight">
                      {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Corner Official Certificates Badge Card */}
              {certificates.length > 0 && (
                <m.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-4 sm:mt-0 sm:absolute sm:-bottom-7 sm:-right-4 sm:left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border-2 border-bronze-300/80 shadow-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-peach-50 border border-peach-200 text-bronze-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-espresso-900 leading-tight">
                        T.C. Sağlık Bakanlığı & Health Türkiye Yetkili Klinik
                      </p>
                      <p className="text-[11px] text-bronze-700 truncate mt-0.5">
                        Resmi yetki belgelerini büyütmek için tıklayın
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {certificates.map((cert, idx) => (
                      <m.button
                        key={idx}
                        type="button"
                        whileHover={{ scale: 1.07, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setActiveCertificate(cert)}
                        title={cert.title}
                        className="group relative w-12 h-12 rounded-xl overflow-hidden border border-bronze-300 hover:border-bronze-700 shadow-sm transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cert.url}
                          alt={cert.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-espresso-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </m.button>
                    ))}
                  </div>
                </m.div>
              )}
            </div>
          </m.div>

          {/* RIGHT COLUMN: Academic Authority & Fast Conversion Actions */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 pt-2 lg:pt-0"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
              <Award className="w-4 h-4 text-bronze-700 shrink-0" />
              <span>1995 Cerrahpaşa Tıp Mezuniyeti • 2015 Profesörlük Unvanı</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-espresso-900 tracking-tight leading-[1.12]">
                {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-bronze-700 leading-snug">
                Bilimsel, Güvenilir Dermatoloji & Lazer Tedavileri
              </p>
            </div>

            <p className="text-base sm:text-lg text-espresso-800/80 leading-relaxed max-w-2xl">
              İstanbul Ataköy Towers kliniğimizde; lazerle leke tedavisi, akne
              ve sivilce izleri, dermatoskopik ben taraması, HPV genital siğil
              tedavisi ve kozmetik dermatoloji alanlarında 30 yılı aşkın
              akademik tıp deneyimiyle kişiye özel çözümler sunuyoruz.
            </p>

            {/* Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-espresso-800 font-semibold">
              <div className="flex items-center gap-2 bg-white/90 px-3.5 py-2.5 rounded-xl border border-bronze-200/70 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30+ Yıllık Klinik Deneyim</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 px-3.5 py-2.5 rounded-xl border border-bronze-200/70 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>FDA Onaylı Lazer Sistemleri</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 px-3.5 py-2.5 rounded-xl border border-bronze-200/70 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ataköy Towers Bakırköy</span>
              </div>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row gap-4">
              <m.a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp ile Hemen Randevu Al</span>
              </m.a>

              <m.a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                onClick={handlePhoneClick}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-peach-50 text-espresso-900 border-2 border-bronze-400/70 hover:border-bronze-700 px-7 py-4 rounded-2xl text-sm font-bold shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-bronze-700" />
                <span>Kliniği Ara: {phone}</span>
              </m.a>
            </div>
          </m.div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Official Certificates */}
      <AnimatePresence>
        {activeCertificate && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveCertificate(null)}
            className="fixed inset-0 z-50 bg-espresso-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <m.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-bronze-300 flex flex-col"
            >
              <div className="px-6 py-4 bg-espresso-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-peach-200" />
                  <div>
                    <h3 className="text-sm font-serif font-bold">
                      {activeCertificate.title}
                    </h3>
                    <p className="text-[11px] text-peach-100/80">
                      {activeCertificate.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCertificate(null)}
                  className="p-1.5 rounded-lg text-peach-100 hover:text-white hover:bg-espresso-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 bg-clinic-canvas flex-1 overflow-y-auto flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCertificate.url}
                  alt={activeCertificate.title}
                  className="max-h-[68vh] w-auto object-contain rounded-xl shadow-md"
                />
              </div>

              {certificates.length > 1 && (
                <div className="px-6 py-3 bg-white border-t border-bronze-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-espresso-800">
                    Resmi Yetki Belgelerimiz:
                  </span>
                  <div className="flex items-center gap-2">
                    {certificates.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveCertificate(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          activeCertificate.url === c.url
                            ? 'bg-bronze-700 text-white'
                            : 'bg-peach-50 text-espresso-800 hover:bg-peach-100'
                        }`}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
