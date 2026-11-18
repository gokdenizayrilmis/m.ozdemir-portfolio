'use client';

import { SiteSettings } from '@/types';
import { resolveMediaUrl } from '@/utils/cn';
import ContactActionButtons from '@/components/public/ContactActionButtons';
import { FadeIn } from '@/components/public/MotionPrimitives';
import {
  Award,
  BookOpenCheck,
  Eye,
  FilePenLine,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface ClinicHighlightsSectionProps {
  settings: SiteSettings | null;
}

const LEFT_FEATURES = [
  {
    title: 'Dermatoskopik Değerlendirme',
    description:
      'Deri hastalıkları ve ben taramalarında yüksek çözünürlüklü dermatoskopik analiz ile erken ve doğru teşhis.',
    icon: Eye,
  },
  {
    title: 'Kişiye Özel Tedavi Protokolü',
    description:
      'Her hastanın cilt yapısı, lezyon tipi ve klinik geçmişine özel olarak kurgulanan bilimsel tedavi planlaması.',
    icon: FilePenLine,
  },
  {
    title: 'Birebir Uzman Hekim Takibi',
    description:
      'Tüm muayene, tanı ve uygulama süreçlerinde Prof. Dr. Mustafa Özdemir tarafından doğrudan klinik değerlendirme.',
    icon: UserCheck,
  },
];

const RIGHT_FEATURES = [
  {
    title: 'Yeni Nesil Lazer Teknolojileri',
    description:
      'Leke, dövme silme, damar ve skar tedavilerinde çevre dokuya zarar vermeyen FDA onaylı lazer sistemleri.',
    icon: Sparkles,
  },
  {
    title: 'Akademik & Kanıta Dayalı Yaklaşım',
    description:
      'Ulusal ve uluslararası dermatoloji kılavuzlarının önerdiği güncel ve güvenilir tıp uygulamaları.',
    icon: BookOpenCheck,
  },
  {
    title: 'Uluslararası Akreditasyon',
    description:
      'T.C. Sağlık Bakanlığı ve Health Türkiye onaylı standartlarda steril, konforlu ve mahremiyete saygılı klinik hizmeti.',
    icon: ShieldCheck,
  },
];

export default function ClinicHighlightsSection({
  settings,
}: ClinicHighlightsSectionProps) {
  const doctorName = settings?.doctorName || 'Prof. Dr. Mustafa Özdemir';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const phoneNumber = settings?.phoneNumbers?.[0] || '+905522656436';

  const centerImageUrl = resolveMediaUrl(
    '/uploads/corporate/doctor-treatment-showcase.jpg'
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
      {/* 1. Top Centered Header */}
      <FadeIn className="text-center max-w-4xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
          <Award className="w-3.5 h-3.5 text-bronze-700 shrink-0" />
          <span>Klinik &amp; Akademik Dermatoloji</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight text-espresso-900 leading-tight">
          Kanıta Dayalı Tıp ve İleri Teknoloji: {doctorName}
        </h2>

        {/* Decorative Gold Divider Line + Dash */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-8 h-0.5 bg-[#B8924A] rounded-full" />
          <span className="w-2 h-0.5 bg-[#B8924A]/60 rounded-full" />
        </div>

        <p className="text-xs sm:text-sm md:text-[15px] text-espresso-800/75 leading-relaxed max-w-3xl mx-auto pt-0.5">
          Prof. Dr. Mustafa Özdemir Kliniği; 30 yılı aşkın akademik birikim ve
          ileri teknoloji lazer donanımıyla, klinik ve estetik dermatoloji
          alanında uluslararası kılavuzlara uygun, güvenilir ve kişiye özel
          tedavi protokolleri sunmaktadır.
        </p>
      </FadeIn>

      {/* 2. 3-Column Feature & Center Portrait Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center max-w-6xl mx-auto">
        {/* Left Column: Tanı & Planlama (Right-Aligned on Desktop) */}
        <div className="lg:col-span-4 relative space-y-8 sm:space-y-10">
          {/* Vertical Connecting Line on Desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute right-7 top-8 bottom-8 w-px bg-[#B8924A]/30"
          />

          {LEFT_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex flex-row-reverse lg:flex-row items-center justify-end gap-4 sm:gap-5"
              >
                <div className="flex-1 text-left lg:text-right space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-espresso-900 group-hover:text-[#9E7A36] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-espresso-800/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="relative z-10 w-14 h-14 rounded-full bg-[#B8924A] text-white flex items-center justify-center shrink-0 shadow-[0_8px_20px_-4px_rgba(184,146,74,0.5)] ring-4 ring-[#B8924A]/15 group-hover:scale-105 group-hover:bg-[#a4803c] transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Column: Rounded Clinical Image */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[4/5] rounded-[28px] overflow-hidden bg-white shadow-[0_22px_50px_-12px_rgba(24,19,16,0.22)] border border-bronze-200/70">
            {centerImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={centerImageUrl}
                alt={`${doctorName} Klinik Uygulama`}
                loading="lazy"
                className="w-full h-full object-cover object-center hover:scale-[1.03] transition-transform duration-500"
              />
            )}
          </div>
        </div>

        {/* Right Column: Teknoloji & Standartlar (Left-Aligned) */}
        <div className="lg:col-span-4 relative space-y-8 sm:space-y-10">
          {/* Vertical Connecting Line on Desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-7 top-8 bottom-8 w-px bg-[#B8924A]/30"
          />

          {RIGHT_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex items-center justify-start gap-4 sm:gap-5"
              >
                <div className="relative z-10 w-14 h-14 rounded-full bg-[#B8924A] text-white flex items-center justify-center shrink-0 shadow-[0_8px_20px_-4px_rgba(184,146,74,0.5)] ring-4 ring-[#B8924A]/15 group-hover:scale-105 group-hover:bg-[#a4803c] transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 text-left space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-espresso-900 group-hover:text-[#9E7A36] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-espresso-800/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Contact & Action Block */}
      <div className="text-center pt-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-bronze-700">
          Bize Ulaşın
        </p>
        <div className="w-16 h-0.5 bg-bronze-300 mx-auto my-3" />

        <ContactActionButtons
          phone={phoneNumber}
          whatsappNumber={whatsappNumber}
          layout="centered"
          sourcePageSlug="/"
          className="pt-1"
        />

        <p className="text-xs text-stone-500 mt-3">
          * Mesai saatleri içerisinde klinik asistanımız tarafından en kısa
          sürede dönüş sağlanmaktadır.
        </p>
      </div>
    </section>
  );
}
