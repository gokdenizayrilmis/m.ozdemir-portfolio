'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { SiteSettings } from '@/types';
import { resolveMediaUrl } from '@/utils/cn';
import { Award, ShieldCheck, X, ZoomIn } from 'lucide-react';

interface DoctorAboutSectionProps {
  settings: SiteSettings | null;
}

interface LightboxItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

const DEFAULT_BIO_PARAGRAPHS = [
  '11 Haziran 1970 tarihinde Yozgat’ta doğdu. İlk, orta ve lise öğrenimini Yozgat ve Kayseri’de tamamladı. 1995 yılında İstanbul Üniversitesi, Cerrahpaşa Tıp Fakültesi’nden mezun oldu.',
  'Dermatoloji uzmanlık eğitimini 1996-2000 yılları arasında yine Cerrahpaşa Tıp Fakültesi Dermatoloji Anabilim Dalı’nda “Vitiligo’da cerrahi tedavi yöntemlerinin karşılaştırılması ve basic fibroblast growth factor (bFGF) düzeyi” konulu teziyle tamamladı. Takiben Kıbrıs’ta Girne 200 yataklı Askeri Hastanesi’nde askerlik görevini yaptı.',
  'İstanbul’da özel bir hastanede 4 yıl dermatoloji uzmanı olarak çalıştıktan sonra 2005-2010 yıllarında Selçuk Üniversitesi Meram Tıp Fakültesi ve Selçuklu Tıp Fakültesi Dermatoloji Anabilim Dalı’nda Yardımcı Doçent olarak çalıştı. 2010 yılında Doçentlik unvanını kazandı. 2010-2012 yılları arasında Bezmialem Üniversitesi Tıp Fakültesi’nde çalıştı. 2012 tarihinde İstanbul Medipol Üniversitesi, Tıp Fakültesi, Deri ve Zührevi Hastalıklar AD, Kürsü Başkanı olarak atandı.',
  'Ağustos 2015 yılında Profesör oldu. Dermatoloji alanında ilgi alanları; Vitiligo, Behçet hastalığı, saç hastalıkları, alerjik deri hastalıkları, psoriasis, biyolojik tedaviler ve akne hastalığıdır. Kozmetik dermatoloji alanında botulinum toksini uygulamaları, dolgu maddeleri uygulamaları, lazerler, yüz ve cilt gençleştirme sistemleri, ip ile yüz germe, lipoliz ve mezoterapi ile ilgilenmektedir.',
  'Ulusal/uluslararası düzeyde birçok kongrede sunumlar yapmış ve makaleler yayınlamıştır. Editörlüğünü yapmış olduğu “Psoriasis güncel yaklaşımlar” ve “Dermatolojide klinik metrik ölçümler ve sınıflama kriterleri” adlı iki kitabı vardır. Ayrıca birçok kitapta bölüm yazarlığı yapmıştır. Birçok tıbbi derneğe üyeliği vardır ve iyi derecede İngilizce bilmektedir.',
];

const CLINIC_STATS = [
  {
    value: '30+',
    title: 'Yıllık Mesleki Tecrübe',
    description:
      '1995 Cerrahpaşa Tıp Fakültesi mezuniyetiyle başlayan; deri ve zührevi hastalıklar, lazer ve kozmetik dermatolojide 30 yılı aşkın akademik ve klinik deneyim.',
  },
  {
    value: '40+',
    title: 'Uzmanlık Alanı',
    description:
      'Klinik dermatoloji, ileri lazer tedavileri, dermatoskopik ben taraması, HPV tedavisi, saç hastalıkları ve medikal estetik uygulamalarında üst düzey birikim.',
  },
  {
    value: '%100',
    title: 'Kişiye Özel Tedavi',
    description:
      'Her danışanın cilt yapısı ve tıbbi ihtiyaçları farklıdır; tüm dermatolojik ve lazer uygulamalarımız tamamen size özel planlanır.'
  },
  {
    value: '10.000+',
    title: 'Mutlu Hasta',
    description:
      'Prof. Dr. Mustafa Özdemir ile kanıta dayalı tıbbi protokoller eşliğinde sağlıklı, estetik ve genç bir cilde kavuşan binlerce mutlu danışan.',
  }  
];

export default function DoctorAboutSection({
  settings,
}: DoctorAboutSectionProps) {
  const [activeImage, setActiveImage] = useState<LightboxItem | null>(null);

  const portraitUrl = resolveMediaUrl(
    settings?.doctorPortraitUrl,
    '/uploads/corporate/doctor-portrait.jpg'
  );

  const portraitLightboxItem: LightboxItem = {
    id: 'portrait',
    title: settings?.doctorName || 'Prof. Dr. Mustafa Özdemir',
    subtitle: 'Dermatoloji (Deri ve Zührevi Hastalıkları) & Lazer Uzmanı',
    url: portraitUrl,
  };

  const hasCustomLongBio =
    settings?.doctorBio && settings.doctorBio.includes('11 Haziran 1970');

  return (
    <section
      id="hakkimda"
      className="scroll-mt-24 bg-gradient-to-b from-white via-clinic-canvas to-peach-100/40 py-10 sm:py-14 border-y border-bronze-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Badge + Doctor Clinical Portrait */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
              <Award className="w-4 h-4 text-bronze-700 shrink-0" />
              <span>
                Hakkımda • 1995 Cerrahpaşa Tıp Mezuniyeti • 2015 Profesörlük Unvanı
              </span>
            </div>

            {/* Doctor Portrait (Clickable to Zoom) */}
            {portraitUrl && (
              <button
                type="button"
                onClick={() => setActiveImage(portraitLightboxItem)}
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
          </div>

          {/* RIGHT COLUMN: Academic Biography & Expertise */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-espresso-900 tracking-tight leading-[1.12]">
              {settings?.doctorName || 'Prof. Dr. Mustafa Özdemir'}
            </h2>

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

        {/* Light Luxury Medical UI — 4-Card Trust & Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-bronze-200/70">
          {CLINIC_STATS.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-2xl border border-stone-100 p-8 sm:p-9 text-center flex flex-col items-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-12px_rgba(180,131,91,0.18)] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-4xl md:text-5xl font-bold text-[#B8860B] tracking-tight">
                {stat.value}
              </span>
              <div className="w-8 h-0.5 bg-amber-600/60 my-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-3">
                {stat.title}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
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
