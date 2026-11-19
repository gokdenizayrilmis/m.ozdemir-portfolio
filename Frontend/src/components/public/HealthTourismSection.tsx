'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { SiteSettings } from '@/types';
import { resolveMediaUrl } from '@/utils/cn';
import { FadeIn } from '@/components/public/MotionPrimitives';
import { ExternalLink, ShieldCheck, X, ZoomIn } from 'lucide-react';

interface HealthTourismSectionProps {
  settings: SiteSettings | null;
}

interface LightboxItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  externalUrl?: string;
}

const HEALTH_TURKIYE_URL =
  'https://www.healthturkiye.gov.tr/hospital/prof.-dr.-mustafa-ozdemir-muayenehanesi';

export default function HealthTourismSection() {
  const [activeImage, setActiveImage] = useState<LightboxItem | null>(null);

  const ministryCertUrl = resolveMediaUrl(
    '/uploads/corporate/ministry-certificate.jpeg'
  );
  const healthTurkiyeCertUrl = resolveMediaUrl(
    '/uploads/corporate/health-turkiye-certificate.jpeg'
  );

  const ministryLightboxItem: LightboxItem = {
    id: 'ministry-cert',
    title: 'T.C. Sağlık Bakanlığı Yetki Belgesi',
    subtitle: 'Uluslararası Sağlık Turizmi Yetki Belgesi (Belge No: ST-3619)',
    url: ministryCertUrl,
  };

  return (
    <section
      id="saglik-turizmi"
      className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-10"
    >
      {/* Centered Header (Matching Reference Design & Site Typography) */}
      <FadeIn className="text-center max-w-3xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-bronze-700 shrink-0" />
          <span>Resmi Yetki & Uluslararası Akreditasyon</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight text-espresso-900 leading-tight">
          Uluslararası Standartlarda, Bakanlık Onaylı Dermatoloji Kliniği
        </h2>
        <div className="w-14 h-1 bg-bronze-600 rounded-full mx-auto" />
        <p className="text-xs sm:text-sm text-espresso-800/75 leading-relaxed pt-1">
          Prof. Dr. Mustafa Özdemir Kliniği; T.C. Sağlık Bakanlığı tarafından verilen Uluslararası Sağlık Turizmi Yetki Belgesi'ne sahip olup, hem Türkiye'den hem de dünyanın dört bir yanından gelen hastalarına küresel tıp standartlarında tanı ve tedavi hizmeti sunmaktadır.
        </p>
      </FadeIn>

      {/* Two Equal Large Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {/* Left Card: Ministry Certificate (Zoomable) */}
        <div className="group bg-white rounded-3xl border border-bronze-200/80 shadow-sm hover:shadow-xl hover:shadow-bronze-900/10 hover:border-bronze-400/90 transition-all duration-300 overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={() => setActiveImage(ministryLightboxItem)}
            aria-label="T.C. Sağlık Bakanlığı Yetki Belgesini büyüt"
            className="relative w-full h-64 sm:h-72 p-4 bg-white flex items-center justify-center cursor-zoom-in focus:outline-none"
          >
            {ministryCertUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ministryCertUrl}
                alt="T.C. Sağlık Bakanlığı Uluslararası Sağlık Turizmi Yetki Belgesi"
                loading="lazy"
                className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-300"
              />
            )}
            <span className="absolute top-3.5 right-3.5 px-2.5 py-1.5 rounded-xl bg-espresso-900/75 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 backdrop-blur-sm">
              <ZoomIn className="w-3.5 h-3.5 text-peach-200" />
              <span>Büyüt</span>
            </span>
          </button>

          <div className="px-5 py-4 bg-clinic-canvas/60 border-t border-bronze-100 flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-bold text-espresso-900">
              T.C. Sağlık Bakanlığı Yetki Belgesi
            </span>
            <button
              type="button"
              onClick={() => setActiveImage(ministryLightboxItem)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-peach-50 border border-bronze-200 text-bronze-700 hover:text-espresso-900 text-xs font-semibold transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Belgeyi İncele</span>
            </button>
          </div>
        </div>

        {/* Right Card: Health Türkiye Official Portal */}
        <div className="group bg-white rounded-3xl border border-bronze-200/80 shadow-sm hover:shadow-xl hover:shadow-bronze-900/10 hover:border-bronze-400/90 transition-all duration-300 overflow-hidden flex flex-col">
          <a
            href={HEALTH_TURKIYE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Health Türkiye Resmi Profilini Görüntüle"
            className="relative w-full h-64 sm:h-72 p-6 sm:p-8 bg-white flex items-center justify-center focus:outline-none"
          >
            {healthTurkiyeCertUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={healthTurkiyeCertUrl}
                alt="Health Türkiye Resmi Sağlık Turizmi Portalı"
                loading="lazy"
                className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
              />
            )}
          </a>

          <div className="px-5 py-4 bg-clinic-canvas/60 border-t border-bronze-100 flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-bold text-espresso-900">
              Health Türkiye Resmi Profilimiz
            </span>
            <a
              href={HEALTH_TURKIYE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-bronze-600 hover:bg-bronze-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <span>Profili Görüntüle</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Certificate Zoom */}
      <AnimatePresence>
        {activeImage && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-espresso-950/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-bronze-300 flex flex-col"
            >
              <div className="px-6 py-4 bg-espresso-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-peach-200 shrink-0" />
                  <div>
                    <h3 className="text-sm font-sans font-bold">
                      {activeImage.title}
                    </h3>
                    <p className="text-[11px] text-peach-100/80">
                      {activeImage.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveImage(null)}
                  className="p-1.5 rounded-lg text-peach-100 hover:text-white hover:bg-espresso-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 bg-clinic-canvas flex-1 overflow-y-auto flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className="max-h-[72vh] w-auto object-contain rounded-xl shadow-md"
                />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
