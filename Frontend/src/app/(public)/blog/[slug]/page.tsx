import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogService, settingsService } from '@/services';
import JsonLdSchema from '@/components/public/JsonLdSchema';
import AppointmentForm from '@/components/public/AppointmentForm';
import { ChevronRight, Calendar, User, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await blogService.getBySlug(slug);

  if (!blog) {
    return {
      title: 'Makale Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı.',
    };
  }

  const title =
    blog.seo?.metaTitle || `${blog.title} | Prof. Dr. Mustafa Özdemir`;
  const description = blog.seo?.metaDescription || blog.summary;

  return {
    title,
    description,
    keywords: blog.seo?.focusKeywords?.join(', '),
    alternates: {
      canonical: `https://drmustafaozdemir.com/blog/${blog.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://drmustafaozdemir.com/blog/${blog.slug}`,
      publishedTime: blog.publishedAt,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [blog, settings] = await Promise.all([
    blogService.getBySlug(slug),
    settingsService.getSettings(),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <div className="bg-clinic-canvas min-h-screen py-8 sm:py-12">
      <JsonLdSchema type="Blog" blog={blog} settings={settings} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-espresso-800/65 font-medium"
        >
          <Link href="/" className="hover:text-bronze-700 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-bronze-400" />
          <Link href="/blog" className="hover:text-bronze-700 transition">
            Makaleler
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-bronze-400" />
          <span className="text-espresso-900 font-semibold truncate">
            {blog.title}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-800/75 hover:text-bronze-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tüm Makalelere Dön</span>
          </Link>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-12 border border-bronze-200/80 shadow-sm space-y-8">
          {/* Header Info */}
          <div className="space-y-4 border-b border-bronze-100 pb-8">
            <div className="flex flex-wrap items-center gap-3 text-xs text-espresso-800/65">
              <span className="flex items-center gap-1.5 font-medium text-espresso-800">
                <User className="w-3.5 h-3.5 text-bronze-700" />
                {blog.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bronze-400" />
                {new Date(blog.publishedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-espresso-900 leading-tight">
              {blog.title}
            </h1>

            <p className="text-sm sm:text-base text-espresso-800/80 leading-relaxed italic bg-peach-50/70 p-4 rounded-xl border-l-4 border-bronze-600">
              {blog.summary}
            </p>
          </div>

          {/* HTML Content */}
          <div
            className="prose-medical"
            dangerouslySetInnerHTML={{ __html: blog.htmlContent }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-bronze-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-espresso-800/65">
                Etiketler:
              </span>
              {blog.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-full bg-peach-50 border border-peach-200/70 text-bronze-800 font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Bottom Appointment CTA */}
        <div className="mt-12">
          <AppointmentForm
            defaultSubject={`Blog Makale Randevu: ${blog.title}`}
            sourcePageSlug={`blog/${blog.slug}`}
            className="shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}

