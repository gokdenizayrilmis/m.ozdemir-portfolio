import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categoryService, treatmentService } from '@/services';
import TreatmentCard from '@/components/public/TreatmentCard';
import { ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryService.getBySlug(slug);

  if (!category) {
    return {
      title: 'Kategori Bulunamadı',
      description: 'İlgili dermatoloji kategorisi bulunamadı.',
    };
  }

  const title =
    category.seo?.metaTitle ||
    `${category.title} Tedavileri | Prof. Dr. Mustafa Özdemir`;
  const description = category.seo?.metaDescription || category.description;

  return {
    title,
    description,
    keywords: category.seo?.focusKeywords?.join(', '),
    alternates: {
      canonical: `https://drmustafaozdemir.com/kategori/${category.slug}`,
    },
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, treatments] = await Promise.all([
    categoryService.getBySlug(slug),
    treatmentService.getAll(slug),
  ]);

  if (!category) {
    notFound();
  }

  const sortedTreatments = [...treatments].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  return (
    <div className="bg-clinic-canvas min-h-screen py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-espresso-800/65 font-medium"
        >
          <Link href="/" className="hover:text-bronze-700 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-bronze-400" />
          <span className="text-espresso-900 font-semibold">
            {category.title}
          </span>
        </nav>

        {/* Centered Category Heading (Matching Reference Design) */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
            <span>Klinik Uzmanlık Alanı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight text-espresso-900 leading-tight">
            {category.title} Tedavilerimiz — Modern Yöntemler ve Kişiselleştirilmiş Çözümler
          </h1>
          <div className="w-14 h-1 bg-bronze-600 rounded-full mx-auto" />
          <p className="text-espresso-800/80 text-xs sm:text-base leading-relaxed pt-1">
            {category.description}
          </p>
        </div>

        {/* 4-Column Visual Treatments Grid */}
        {sortedTreatments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-bronze-200/80 text-sm text-espresso-800/70">
            Bu kategoride henüz yayınlanmış tedavi bulunmamaktadır.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {sortedTreatments.map((t) => (
              <TreatmentCard key={t.id} treatment={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
