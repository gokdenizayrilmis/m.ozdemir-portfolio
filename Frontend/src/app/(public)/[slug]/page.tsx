import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { treatmentService, settingsService } from '@/services';
import JsonLdSchema from '@/components/public/JsonLdSchema';
import FaqAccordion from '@/components/public/FaqAccordion';
import TreatmentCard from '@/components/public/TreatmentCard';
import {
  Phone,
  MessageCircle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { createWhatsAppUrl, resolveMediaUrl } from '@/utils/cn';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
  const [treatment, settings] = await Promise.all([
    treatmentService.getBySlug(slug),
    settingsService.getSettings(),
  ]);

  if (!treatment) {
    notFound();
  }

  const allTreatments = await treatmentService.getAll(treatment.categorySlug);
  const relatedTreatments = allTreatments
    .filter((t) => t.id !== treatment.id)
    .slice(0, 4);

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const waUrl = createWhatsAppUrl(
    whatsappNumber,
    `Merhaba Prof. Dr. Mustafa Özdemir Kliniği, '${treatment.title}' hakkında bilgi ve randevu almak istiyorum.`
  );
  const imageUrl = resolveMediaUrl(
    treatment.coverImageUrl,
    '/uploads/corporate/hero-showroom.jpg'
  );

  return (
    <div className="bg-clinic-canvas min-h-screen py-8 sm:py-12">
      <JsonLdSchema type="Treatment" treatment={treatment} settings={settings} />

      {/* Top Section: Breadcrumb + 2-Column Editorial Hero (Text Left, Large Square Photo Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 sm:mb-8 flex flex-wrap items-center gap-2 text-xs text-espresso-800/65 font-medium"
        >
          <Link href="/" className="hover:text-bronze-700 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-bronze-400 shrink-0" />
          <Link
            href={`/kategori/${treatment.categorySlug}`}
            className="hover:text-bronze-700 transition capitalize"
          >
            {treatment.categorySlug.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-bronze-400 shrink-0" />
          <span className="text-espresso-900 font-semibold truncate">
            {treatment.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Persuasive Intro + Callout Box + Action Buttons */}
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3.5 py-1 rounded-full bg-peach-50 text-bronze-800 border border-peach-200/80 text-xs font-bold uppercase tracking-wider">
              {treatment.categorySlug.replace('-', ' ')} • Prof. Dr. Mustafa Özdemir Kliniği
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-sans font-extrabold tracking-tight text-espresso-900 leading-tight">
              {treatment.title} — Prof. Dr. Mustafa Özdemir Kliniği
            </h1>

            <p className="text-sm sm:text-base text-espresso-800/85 leading-relaxed">
              {treatment.summary}
            </p>

            <div className="bg-white border border-bronze-200/80 border-l-4 border-l-bronze-600 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-espresso-800/90 leading-relaxed shadow-sm">
              Prof. Dr. Mustafa Özdemir muayenehanesinde tanı ve tedavi
              süreçleri, cilt yapınıza ve klinik bulgularınıza özel kanıta
              dayalı dermatolojik protokollerle planlanır.
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-bronze-600 hover:bg-bronze-500 text-white text-xs sm:text-sm font-bold shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Doktora Danış (WhatsApp)</span>
              </a>

              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-peach-50 text-espresso-900 border border-espresso-900/25 text-xs sm:text-sm font-bold transition"
              >
                <Phone className="w-4 h-4 text-bronze-700" />
                <span>Randevu &amp; Bilgi: {phone}</span>
              </a>
            </div>
          </div>

          {/* Right: Large Rounded Square/4:3 Treatment Image */}
          <div className="lg:col-span-5">
            {imageUrl && (
              <div className="relative aspect-[4/3] sm:aspect-square w-full max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-xl border border-bronze-200/80 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={treatment.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Bronze/Gold CTA Strip (Matching Reference Design) */}
      <div className="my-10 sm:my-14 bg-gradient-to-r from-bronze-700 via-bronze-600 to-bronze-700 text-white py-7 sm:py-8 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-base sm:text-xl font-sans font-bold tracking-tight">
            {treatment.title} Hakkında Detaylı Bilgi ve Muayene Planlaması İçin
            Kliniğimize Ulaşabilirsiniz!
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center px-7 py-3 rounded-full bg-white hover:bg-peach-50 text-espresso-900 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            Bilgi Al
          </a>
        </div>
      </div>

      {/* Bottom Section: Detailed Medical Content + FAQ + Related Visual Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        <article className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-bronze-200/80 shadow-sm prose-medical">
          <div dangerouslySetInnerHTML={{ __html: treatment.htmlContent }} />
        </article>

        {treatment.faqs && treatment.faqs.length > 0 && (
          <FaqAccordion
            faqs={treatment.faqs}
            title={`${treatment.title} Hakkında Merak Edilenler`}
          />
        )}

        <div className="p-5 bg-peach-50/70 border border-peach-200/80 rounded-2xl flex items-start gap-3.5 text-xs text-espresso-800/85 leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-bronze-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-espresso-900">
              T.C. Sağlık Bakanlığı Bilgilendirmesi:
            </strong>
            <p className="mt-1">
              Mevzuat gereği sitemizde işlem fiyatları yer almamaktadır.
              Sayfadaki bilgiler genel bilgilendirme amaçlıdır; kesin tanı ve
              tedavi için mutlaka Prof. Dr. Mustafa Özdemir&apos;e başvurunuz.
            </p>
          </div>
        </div>
      </div>

      {/* Related Treatments in the Same Category */}
      {relatedTreatments.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 sm:mt-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-sans font-extrabold tracking-tight text-espresso-900">
              Bu Uzmanlık Alanındaki Diğer Tedavilerimiz
            </h2>
            <div className="w-12 h-1 bg-bronze-600 rounded-full mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {relatedTreatments.map((rt) => (
              <TreatmentCard key={rt.id} treatment={rt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
