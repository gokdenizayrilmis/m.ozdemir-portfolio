import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categoryService, treatmentService } from '@/services';
import TreatmentCard from '@/components/public/TreatmentCard';
import { ChevronRight, Sparkles } from 'lucide-react';

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

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium"
        >
          <Link href="/" className="hover:text-amber-800 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{category.title}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Klinik Uzmanlık Alanı</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
            {category.title} Tedavileri
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            {category.description}
          </p>
        </div>

        {/* Treatments List in Category */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Bu Kategorideki Klinik Tedavi Başlıkları ({treatments.length})
          </h2>

          {treatments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-sm text-slate-500">
              Bu kategoride henüz yayınlanmış tedavi bulunmamaktadır.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treatments.map((t) => (
                <TreatmentCard key={t.id} treatment={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

