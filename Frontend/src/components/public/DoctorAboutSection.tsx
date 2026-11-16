'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { SiteSettings } from '@/types';
import { resolveMediaUrl } from '@/utils/cn';
import {
  Award,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react';

interface DoctorAboutSectionProps {
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

const DEFAULT_BIO_PARAGRAPHS = [
  '11 Haziran 1970 tarihinde Yozgat’ta doğdu. İlk, orta ve lise öğrenimini Yozgat ve Kayseri’de tamamladı. 1995 yılında İstanbul Üniversitesi, Cerrahpaşa Tıp Fakültesi’nden mezun oldu.',
  'Dermatoloji uzmanlık eğitimini 1996-2000 yılları arasında yine Cerrahpaşa Tıp Fakültesi Dermatoloji Anabilim Dalı’nda “Vitiligo’da cerrahi tedavi yöntemlerinin karşılaştırılması ve basic fibroblast growth factor (bFGF) düzeyi” konulu teziyle tamamladı. Takiben Kıbrıs’ta Girne 200 yataklı Askeri Hastanesi’nde askerlik görevini yaptı.',
  'İstanbul’da özel bir hastanede 4 yıl dermatoloji uzmanı olarak çalıştıktan sonra 2005-2010 yıllarında Selçuk Üniversitesi Meram Tıp Fakültesi ve Selçuklu Tıp Fakültesi Dermatoloji Anabilim Dalı’nda Yardımcı Doçent olarak çalıştı. 2010 yılında Doçentlik unvanını kazandı. 2010-2012 yılları arasında Bezmialem Üniversitesi Tıp Fakültesi’nde çalıştı. 2012 tarihinde İstanbul Medipol Üniversitesi, Tıp Fakültesi, Deri ve Zührevi Hastalıklar AD, Kürsü Başkanı olarak atandı.',
  'Ağustos 2015 yılında Profesör oldu. Dermatoloji alanında ilgi alanları; Vitiligo, Behçet hastalığı, saç hastalıkları, alerjik deri hastalıkları, psoriasis, biyolojik tedaviler ve akne hastalığıdır. Kozmetik dermatoloji alanında botulinum toksini uygulamaları, dolgu maddeleri uygulamaları, lazerler, yüz ve cilt gençleştirme sistemleri, ip ile yüz germe, lipoliz ve mezoterapi ile ilgilenmektedir.',
  'Ulusal/uluslararası düzeyde birçok kongrede sunumlar yapmış ve makaleler yayınlamıştır. Editörlüğünü yapmış olduğu “Psoriasis güncel yaklaşımlar” ve “Dermatolojide klinik metrik ölçümler ve sınıflama kriterleri” adlı iki kitabı vardır. Ayrıca birçok kitapta bölüm yazarlığı yapmıştır. Birçok tıbbi derneğe üyeliği vardır ve iyi derecede İngilizce bilmektedir.',
];

export default function DoctorAboutSection({
  settings,
}: DoctorAboutSectionProps) {
  const [activeImage, setActiveImage] = useState<LightboxItem | null>(null);

  const portraitUrl = resolveMediaUrl(
    settings?.doctorPortraitUrl,
    '/uploads/corporate/doctor-portrait.jpg'
  );
  const healthTurkiyeCertUrl = resolveMediaUrl(
    settings?.healthTurkiyeCertificateUrl,
    '/uploads/corporate/health-turkiye-certificate.jpeg'
  );
  const ministryCertUrl = resolveMediaUrl(
    settings?.ministryCertificateUrl,
    '/uploads/corporate/ministry-certificate.jpeg'
  );

  const lightboxGallery: LightboxItem[] = [
    {
      id: 'portrait',
      title: settings?.doctorName || 'Prof. Dr. Mustafa Özdemir',
      subtitle: 'Dermatoloji (Deri ve Zührevi Hastalıkları) & Lazer Uzmanı',
      url: portraitUrl,
    },
    {
      id: 'health-turkiye',
      title: 'Health Türkiye Profilimiz',
      subtitle: 'T.C. Sağlık Bakanlığı Resmi Sağlık Turizmi Portalı',
      url: healthTurkiyeCertUrl,
      externalUrl: HEALTH_TURKIYE_URL,
    },
    {
      id: 'ministry-cert',
      title: 'T.C. Sağlık Bakanlığı Yetki Belgemiz',
      subtitle: 'Uluslararası Sağlık Turizmi Yetki Belgesi (Belge No: ST-3619)',
      url: ministryCertUrl,
    },
  ].filter((item) => Boolean(item.url));

  const hasCustomLongBio =
    settings?.doctorBio && settings.doctorBio.includes('11 Haziran 1970');

  return (
    <section
      id="hakkimda"
      className="scroll-mt-24 bg-gradient-to-b from-white via-clinic-canvas to-peach-100/40 py-16 sm:py-24 border-y border-bronze-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* LEFT COLUMN: Doctor Clinical Portrait + 2 Equal Certificate Cards Below */}
          <div className="lg:col-span-5 lg:mt-[46px] space-y-4">
            {/* 1. Doctor Portrait (Clickable to Zoom) */}
            {portraitUrl && (
              <button
                type="button"
                onClick={() => setActiveImage(lightboxGallery[0])}
                aria-label="Prof. Dr. Mustafa Özdemir fotoğrafını büyüt"
                className="group block w-full text-left relative rounded-3xl p-2 bg-gradient-to-br from-bronze-400/50 via-bronze-600/30 to-espresso-800/40 shadow-2xl shadow-espresso-900/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-600 cursor-zoom-in"
              >
                <div className="relative rounded-[22px] overflow-hidden bg-white border border-peach-200/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portraitUrl}
                    alt={settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
                    className="w-full h-auto block object-contain"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-xl bg-espresso-900/75 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 backdrop-blur-sm">
                    <ZoomIn className="w-3.5 h-3.5 text-peach-200" />
                    <span>Büyüt</span>
                  </div>
                </div>
              </button>
            )}

            {/* 2 & 3. Equal Side-by-Side Cards: Health Türkiye Profilimiz & Yetki Belgemiz */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Health Türkiye Card */}
              <div className="bg-white rounded-2xl border border-bronze-200/80 shadow-md hover:shadow-lg hover:border-bronze-400 transition-all overflow-hidden flex flex-col">
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage(
                      lightboxGallery.find((i) => i.id === 'health-turkiye') ||
                        null
                    )
                  }
                  className="group relative w-full h-28 sm:h-32 bg-white border-b border-bronze-100 p-2 flex items-center justify-center cursor-zoom-in focus:outline-none"
                  aria-label="Health Türkiye görselini büyüt"
                >
                  {healthTurkiyeCertUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={healthTurkiyeCertUrl}
                      alt="Health Türkiye Profilimiz"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                  <span className="absolute top-2 right-2 p-1 rounded-lg bg-espresso-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5 bg-clinic-canvas/50">
                  <div>
                    <h3 className="text-xs font-serif font-bold text-espresso-900">
                      Health Türkiye Profilimiz
                    </h3>
                    <p className="text-[11px] text-espresso-800/80 leading-snug mt-1">
                      Health Turkey Profilimiz;
                    </p>
                  </div>
                  <a
                    href={HEALTH_TURKIYE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 text-[10px] sm:text-[11px] font-medium text-bronze-700 hover:text-espresso-900 underline underline-offset-2 break-all transition"
                  >
                    <span>{HEALTH_TURKIYE_URL}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                  </a>
                </div>
              </div>

              {/* Yetki Belgemiz Card */}
              <div className="bg-white rounded-2xl border border-bronze-200/80 shadow-md hover:shadow-lg hover:border-bronze-400 transition-all overflow-hidden flex flex-col">
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage(
                      lightboxGallery.find((i) => i.id === 'ministry-cert') ||
                        null
                    )
                  }
                  className="group relative w-full h-28 sm:h-32 bg-white border-b border-bronze-100 p-1.5 flex items-center justify-center cursor-zoom-in focus:outline-none"
                  aria-label="Yetki Belgemiz görselini büyüt"
                >
                  {ministryCertUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ministryCertUrl}
                      alt="T.C. Sağlık Bakanlığı Yetki Belgemiz"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  )}
                  <span className="absolute top-2 right-2 p-1 rounded-lg bg-espresso-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5 bg-clinic-canvas/50">
                  <div>
                    <h3 className="text-xs font-serif font-bold text-espresso-900">
                      Yetki Belgemiz
                    </h3>
                    <p className="text-[11px] text-espresso-800/80 leading-snug mt-1">
                      T.C. Sağlık Bakanlığı onaylı Yetki Belgemize görselden
                      ulaşabilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage(
                        lightboxGallery.find((i) => i.id === 'ministry-cert') ||
                          null
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-bronze-700 hover:text-espresso-900 transition text-left"
                  >
                    <ZoomIn className="w-3 h-3 shrink-0" />
                    <span>Belgeyi Tam Boy İncele</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Academic Biography & Expertise */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
              <Award className="w-4 h-4 text-bronze-700 shrink-0" />
              <span>
                Hakkımda • 1995 Cerrahpaşa Tıp Mezuniyeti • 2015 Profesörlük Unvanı
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-espresso-900 tracking-tight leading-[1.12]">
                {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
              </h2>
              <p className="text-lg sm:text-xl font-serif font-semibold text-bronze-700 leading-snug">
                Dermatoloji (Deri ve Zührevi Hastalıkları) &amp; Lazer Uzmanı
              </p>
            </div>

            {/* Full 5-Paragraph Doctor Biography */}
            {hasCustomLongBio ? (
              <div
                className="space-y-3 text-sm sm:text-[15px] text-espresso-800/85 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: settings!.doctorBio }}
              />
            ) : (
              <div className="space-y-3 text-sm sm:text-[15px] text-espresso-800/85 leading-relaxed">
                {DEFAULT_BIO_PARAGRAPHS.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Academic Expertise 4-Card Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-bronze-200/70">
          <div className="p-6 bg-espresso-900 text-white rounded-2xl border border-bronze-700/50 space-y-2 shadow-md">
            <ShieldCheck className="w-7 h-7 text-peach-200" />
            <h4 className="font-semibold text-white text-base">
              Dermatoskopik Ben Taraması
            </h4>
            <p className="text-xs text-peach-100/75 leading-relaxed">
              Deri kanserlerinin ve melanomun erken teşhisi için ileri
              dermatoskopi cihazlarıyla haritalama.
            </p>
          </div>

          <div className="p-6 bg-espresso-900 text-white rounded-2xl border border-bronze-700/50 space-y-2 shadow-md">
            <Sparkles className="w-7 h-7 text-peach-200" />
            <h4 className="font-semibold text-white text-base">
              İleri Leke ve Lazer Protokolleri
            </h4>
            <p className="text-xs text-peach-100/75 leading-relaxed">
              Güneş lekesi, melazma ve dövme silmede çevre dokuya hasar vermeyen
              hedefli lazer atımları.
            </p>
          </div>

          <div className="p-6 bg-espresso-900 text-white rounded-2xl border border-bronze-700/50 space-y-2 shadow-md">
            <Award className="w-7 h-7 text-peach-200" />
            <h4 className="font-semibold text-white text-base">
              HPV &amp; Genital Siğil Tedavisi
            </h4>
            <p className="text-xs text-peach-100/75 leading-relaxed">
              Hasta mahremiyetine tam saygılı kriyoterapi, koterizasyon ve lazer
              ablasyon çözümleri.
            </p>
          </div>

          <div className="p-6 bg-espresso-900 text-white rounded-2xl border border-bronze-700/50 space-y-2 shadow-md">
            <MapPin className="w-7 h-7 text-peach-200" />
            <h4 className="font-semibold text-white text-base">
              Merkezi Konum (Ataköy Towers)
            </h4>
            <p className="text-xs text-peach-100/75 leading-relaxed">
              E-5 Yanyol üzerinde, metrobüs ve metroya yürüme mesafesinde, kolay
              otopark imkanı.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for All 3 Images */}
      <AnimatePresence>
        {activeImage && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 bg-espresso-950/85 backdrop-blur-sm flex items-center justify-center p-4"
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
                    <h3 className="text-sm font-serif font-bold">
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
                  className="max-h-[68vh] w-auto object-contain rounded-xl shadow-md"
                />
              </div>

              <div className="px-6 py-3 bg-white border-t border-bronze-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {lightboxGallery.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveImage(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        activeImage.id === item.id
                          ? 'bg-bronze-700 text-white'
                          : 'bg-peach-50 text-espresso-800 hover:bg-peach-100'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>

                {activeImage.externalUrl && (
                  <a
                    href={activeImage.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                  >
                    <span>Resmi Profili Aç</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
