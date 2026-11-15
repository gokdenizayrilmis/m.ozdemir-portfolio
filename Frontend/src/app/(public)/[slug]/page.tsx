import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { treatmentService, settingsService } from '@/services';
import JsonLdSchema from '@/components/public/JsonLdSchema';
import FaqAccordion from '@/components/public/FaqAccordion';
import AppointmentForm from '@/components/public/AppointmentForm';
import {
  Phone,
  MessageCircle,
  ChevronRight,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';
import { createWhatsAppUrl } from '@/utils/cn';

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

  // Fetch related treatments from same category
  const allTreatments = await treatmentService.getAll(treatment.categorySlug);
  const relatedTreatments = allTreatments
    .filter((t) => t.id !== treatment.id)
    .slice(0, 5);

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const waUrl = createWhatsAppUrl(
    whatsappNumber,
    `Merhaba Prof. Dr. Mustafa Özdemir Kliniği, '${treatment.title}' hakkında bilgi ve randevu almak istiyorum.`
  );

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 sm:py-12">
      <JsonLdSchema type="Treatment" treatment={treatment} settings={settings} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium"
        >
          <Link href="/" className="hover:text-amber-800 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/kategori/${treatment.categorySlug}`}
            className="hover:text-amber-800 transition capitalize"
          >
            {treatment.categorySlug.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate">
            {treatment.title}
          </span>
        </nav>

        {/* Hero Header for Landing Page */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
              {treatment.categorySlug.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Uzman Dermatolog Kontrolü
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
            {treatment.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl">
            {treatment.summary}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Content (Left Column - 8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Rich HTML Content */}
            <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm prose-medical">
              <div
                dangerouslySetInnerHTML={{ __html: treatment.htmlContent }}
              />
            </article>

            {/* Google FAQ Accordion */}
            {treatment.faqs && treatment.faqs.length > 0 && (
              <FaqAccordion
                faqs={treatment.faqs}
                title={`${treatment.title} Hakkında Merak Edilenler`}
              />
            )}

            {/* Legal Notice Box */}
            <div className="p-5 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>T.C. Sağlık Bakanlığı Bilgilendirmesi:</strong>
                <p className="mt-1">
                  Mevzuat gereği sitemizde işlem fiyatları yer almamaktadır.
                  Sayfadaki bilgiler genel bilgilendirme amaçlıdır; kesin tanı
                  ve tedavi için mutlaka Prof. Dr. Mustafa Özdemir&apos;e
                  başvurunuz.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Right Column - 4 Cols) */}
          <aside
            aria-label="Randevu ve İletişim Yan Menüsü"
            className="lg:col-span-4 space-y-6 lg:sticky lg:top-24"
          >
            {/* Quick Fast Appointment Form */}
            <AppointmentForm
              sourcePageSlug={treatment.slug}
              defaultSubject={`${treatment.title} Bilgi & Randevu Talebi`}
              className="border-amber-200/50 shadow-lg"
            />

            {/* Direct Contact Action Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Hızlı İletişim</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {treatment.title} hakkında doğrudan kliniğimize soru sormak veya
                randevu planlamak için:
              </p>
              <div className="space-y-2.5 pt-1">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-xs font-semibold transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp ile Bilgi Al</span>
                </a>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl text-xs font-semibold transition"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>{phone}</span>
                </a>
              </div>
            </div>

            {/* Same Category Related Treatments */}
            {relatedTreatments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="font-serif font-bold text-slate-900 text-sm">
                  Diğer İlgili Tedaviler
                </h4>
                <ul className="space-y-2 text-xs">
                  {relatedTreatments.map((rt) => (
                    <li key={rt.id}>
                      <Link
                        href={`/${rt.slug}`}
                        className="block py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-slate-50 transition font-medium"
                      >
                        • {rt.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

