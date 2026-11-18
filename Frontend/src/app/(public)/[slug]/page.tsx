import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categoryService, treatmentService, settingsService } from '@/services';
import JsonLdSchema from '@/components/public/JsonLdSchema';
import FaqAccordion from '@/components/public/FaqAccordion';
import ContactActionButtons from '@/components/public/ContactActionButtons';
import TreatmentMobileCategoryMenu from '@/components/public/TreatmentMobileCategoryMenu';
import {
  ChevronRight,
  Layers,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { resolveMediaUrl } from '@/utils/cn';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  dermatoloji: 'Dermatoloji',
  'kozmetik-dermatoloji': 'Kozmetik Dermatoloji',
  'sac-hastaliklari': 'Saç Hastalıkları',
  lazer: 'Lazer',
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const treatment = await treatmentService.getBySlug(slug);

  if (!treatment) {
    return {
      title: 'Tedavi Sayfası Bulunamadı',
      description: 'Aradığınız tedavi veya dermatoloji sayfası bulunamadı.',
    };
  }

  const seo = treatment.seo;
  const title =
    seo?.metaTitle || `${treatment.title} | Prof. Dr. Mustafa Özdemir`;
  const description = seo?.metaDescription || treatment.summary;

  return {
    title,
    description,
    keywords: seo?.focusKeywords?.join(', '),
    alternates: {
      canonical: `https://drmustafaozdemir.com/${treatment.slug}`,
    },
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noIndex,
    },
    openGraph: {
      title,
      description,
      url: `https://drmustafaozdemir.com/${treatment.slug}`,
      siteName: 'Prof. Dr. Mustafa Özdemir Kliniği',
      locale: 'tr_TR',
      type: 'article',
    },
  };
}

export default async function TreatmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [treatment, settings, categories] = await Promise.all([
    treatmentService.getBySlug(slug),
    settingsService.getSettings(),
    categoryService.getAll(),
  ]);

  if (!treatment) {
    notFound();
  }

  const allCategoryTreatments = await treatmentService.getAll(
    treatment.categorySlug
  );
  const sortedCategoryTreatments = [...allCategoryTreatments].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const matchedCategory = categories.find(
    (c) => c.slug === treatment.categorySlug
  );
  const categoryLabel =
    matchedCategory?.title ||
    CATEGORY_LABELS[treatment.categorySlug] ||
    treatment.categorySlug.replace(/-/g, ' ');

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const whatsappMessage = `Merhaba Prof. Dr. Mustafa Özdemir Kliniği, '${treatment.title}' hakkında bilgi ve randevu almak istiyorum.`;

  const imageUrl = resolveMediaUrl(
    treatment.coverImageUrl,
    '/uploads/corporate/hero-showroom.jpg'
  );

  return (
    <div className="bg-clinic-canvas min-h-screen py-8 sm:py-10">
      <JsonLdSchema type="Treatment" treatment={treatment} settings={settings} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* 1. Top Breadcrumb Only */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-espresso-800/65 font-medium"
        >
          <Link href="/" className="hover:text-bronze-700 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-bronze-400 shrink-0" />
          <Link
            href={`/kategori/${treatment.categorySlug}`}
            className="hover:text-bronze-700 transition"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-bronze-400 shrink-0" />
          <span className="text-espresso-900 font-semibold truncate">
            {treatment.title}
          </span>
        </nav>

        {/* Mobile Collapsible Category Switcher (lg:hidden) */}
        <TreatmentMobileCategoryMenu
          categoryLabel={categoryLabel}
          treatments={sortedCategoryTreatments}
          activeSlug={treatment.slug}
        />

        {/* Unified 2-Column Layout Directly Below Breadcrumb */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 2. LEFT COLUMN: Sticky Category Menu + Contact Card */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            {/* In-Category Quick Navigation Card */}
            <div className="bg-white rounded-3xl border border-bronze-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-peach-50/90 via-clinic-canvas to-peach-50/50 border-b border-bronze-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-bronze-600/10 border border-bronze-300/60 flex items-center justify-center text-bronze-700 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-bronze-700">
                      Uzmanlık Branşı
                    </span>
                    <h2 className="text-base font-sans font-extrabold text-espresso-900 truncate">
                      {categoryLabel}
                    </h2>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-bronze-200 text-[11px] font-bold text-bronze-800">
                  {sortedCategoryTreatments.length} Tedavi
                </span>
              </div>

              <nav
                aria-label={`${categoryLabel} Tedavileri`}
                className="max-h-[460px] overflow-y-auto divide-y divide-bronze-100/70"
              >
                {sortedCategoryTreatments.map((item) => {
                  const isActive = item.slug === treatment.slug;
                  return (
                    <Link
                      key={item.id}
                      href={`/${item.slug}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex items-center justify-between gap-3 px-5 py-3.5 text-xs sm:text-[13.5px] transition-all ${
                        isActive
                          ? 'border-l-4 border-l-bronze-600 bg-peach-50/90 font-bold text-espresso-900'
                          : 'border-l-4 border-l-transparent text-espresso-800/80 hover:bg-peach-50/40 hover:text-espresso-900 font-medium'
                      }`}
                    >
                      <span className="leading-snug">{item.title}</span>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive
                            ? 'text-bronze-700 translate-x-0.5'
                            : 'text-bronze-300 group-hover:text-bronze-600 group-hover:translate-x-0.5'
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mini Quick Contact Card */}
            <div className="bg-white rounded-3xl p-6 border border-bronze-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-peach-50 border border-peach-200 flex items-center justify-center text-bronze-700 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-extrabold text-espresso-900">
                    Muayene &amp; Bilgi Planlaması
                  </h3>
                  <p className="text-[11px] text-espresso-800/70">
                    Prof. Dr. Mustafa Özdemir Kliniği
                  </p>
                </div>
              </div>

              <p className="text-xs text-espresso-800/80 leading-relaxed">
                <strong>{treatment.title}</strong> uygulaması ve kişiye özel
                tedavi protokollerimiz hakkında bilgi almak için kliniğimizle
                doğrudan iletişime geçebilirsiniz.
              </p>

              <ContactActionButtons
                phone={phone}
                whatsappNumber={whatsappNumber}
                whatsappMessage={whatsappMessage}
                callLabel="Kliniği Arayın"
                whatsappLabel="WhatsApp Randevu"
                layout="stack"
                sourcePageSlug={`/${treatment.slug}`}
              />
            </div>
          </aside>

          {/* 3. RIGHT COLUMN: Unified Main Treatment Card + FAQ + Ministry Notice */}
          <div className="lg:col-span-8 space-y-6">
            {/* Unified Main Treatment Card (Title + Image + Medical Content) */}
            <article className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
              {/* Top Header Area */}
              <div className="p-6 sm:p-8 pb-4 space-y-3">
                <span className="inline-block px-3.5 py-1 rounded-full bg-peach-50 text-bronze-800 border border-peach-200/80 text-xs font-bold uppercase tracking-wider">
                  {categoryLabel} • Prof. Dr. Mustafa Özdemir
                </span>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight text-espresso-900 leading-tight">
                  {treatment.title}
                </h1>

                {treatment.summary && (
                  <p className="text-sm sm:text-base text-espresso-800/80 leading-relaxed">
                    {treatment.summary}
                  </p>
                )}
              </div>

              {/* Middle Treatment Visual */}
              {imageUrl && (
                <div className="px-6 sm:px-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={treatment.title}
                    className="aspect-[16/9] max-h-[380px] w-full object-cover rounded-2xl border border-stone-200/60 shadow-sm"
                  />
                </div>
              )}

              {/* Bottom Detailed Medical Content */}
              <div className="p-6 sm:p-8 pt-6 prose-medical">
                <div
                  dangerouslySetInnerHTML={{ __html: treatment.htmlContent }}
                />
              </div>
            </article>

            {/* FAQ Accordion Card */}
            {treatment.faqs && treatment.faqs.length > 0 && (
              <FaqAccordion
                faqs={treatment.faqs}
                title={`${treatment.title} Hakkında Merak Edilenler`}
              />
            )}

            {/* T.C. Ministry of Health Information Box */}
            <div className="p-5 bg-peach-50/70 border border-peach-200/80 rounded-2xl flex items-start gap-3.5 text-xs text-espresso-800/85 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-bronze-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-espresso-900">
                  T.C. Sağlık Bakanlığı Bilgilendirmesi:
                </strong>
                <p className="mt-1">
                  Mevzuat gereği sitemizde işlem fiyatları yer almamaktadır.
                  Sayfadaki bilgiler genel bilgilendirme amaçlıdır; kesin tanı
                  ve tedavi için mutlaka doktorunuza
                  başvurunuz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
