import { resolveMediaUrl } from '@/utils/cn';
import { FadeIn } from '@/components/public/MotionPrimitives';
import ImageLightboxModal from '@/components/public/ImageLightboxModal';
import { ExternalLink, ShieldCheck, ZoomIn } from 'lucide-react';

const HEALTH_TURKIYE_URL =
  'https://www.healthturkiye.gov.tr/hospital/prof.-dr.-mustafa-ozdemir-muayenehanesi';

export default function HealthTourismSection() {
  const ministryCertUrl = resolveMediaUrl(
    '/uploads/corporate/ministry-certificate.jpeg'
  );
  const healthTurkiyeCertUrl = resolveMediaUrl(
    '/uploads/corporate/health-turkiye-certificate.jpeg'
  );

  return (
    <section
      id="saglik-turizmi"
      className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-10"
    >
      {/* Centered Header (Matching Reference Design & Site Typography) */}
      <FadeIn className="text-center max-w-3xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-bronze-700 shrink-0" />
          <span>Resmi Yetki &amp; Uluslararası Akreditasyon</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight text-espresso-900 leading-tight">
          Uluslararası Standartlarda, Bakanlık Onaylı Dermatoloji Kliniği
        </h2>
        <div className="w-14 h-1 bg-bronze-600 rounded-full mx-auto" />
        <p className="text-xs sm:text-sm text-espresso-800/75 leading-relaxed pt-1">
          Prof. Dr. Mustafa Özdemir Kliniği; T.C. Sağlık Bakanlığı tarafından
          verilen Uluslararası Sağlık Turizmi Yetki Belgesi&apos;ne sahip olup,
          hem Türkiye&apos;den hem de dünyanın dört bir yanından gelen
          hastalarına küresel tıp standartlarında tanı ve tedavi hizmeti
          sunmaktadır.
        </p>
      </FadeIn>

      {/* Two Equal Large Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {/* Left Card: Ministry Certificate (Zoomable) */}
        <div className="group bg-white rounded-3xl border border-bronze-200/80 shadow-sm hover:shadow-xl hover:shadow-bronze-900/10 hover:border-bronze-400/90 transition-all duration-300 overflow-hidden flex flex-col">
          <ImageLightboxModal
            title="T.C. Sağlık Bakanlığı Yetki Belgesi"
            subtitle="Uluslararası Sağlık Turizmi Yetki Belgesi (Belge No: ST-3619)"
            imageUrl={ministryCertUrl}
            triggerAriaLabel="T.C. Sağlık Bakanlığı Yetki Belgesini büyüt"
            triggerClassName="relative w-full h-64 sm:h-72 p-4 bg-white flex items-center justify-center cursor-zoom-in focus:outline-none"
            titleClassName="text-sm font-sans font-bold"
            footerLabel="T.C. Sağlık Bakanlığı Yetki Belgesi"
            footerActionLabel="Belgeyi İncele"
          >
            {ministryCertUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ministryCertUrl}
                alt="T.C. Sağlık Bakanlığı Uluslararası Sağlık Turizmi Yetki Belgesi"
                width={480}
                height={360}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-300"
              />
            )}
            <span className="absolute top-3.5 right-3.5 px-2.5 py-1.5 rounded-xl bg-espresso-900/75 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 backdrop-blur-sm">
              <ZoomIn className="w-3.5 h-3.5 text-peach-200" />
              <span>Büyüt</span>
            </span>
          </ImageLightboxModal>
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
                width={480}
                height={360}
                loading="lazy"
                decoding="async"
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
    </section>
  );
}
