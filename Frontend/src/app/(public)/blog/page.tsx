import { Metadata } from 'next';
import Link from 'next/link';
import { blogService } from '@/services';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dermatoloji Blog & Makaleler | Prof. Dr. Mustafa Özdemir',
  description:
    'Prof. Dr. Mustafa Özdemir tarafından kaleme alınan güncel dermatoloji makaleleri, leke tedavileri, ben takibi, akne ve cilt sağlığı rehberi.',
  alternates: {
    canonical: 'https://drmustafaozdemir.com/blog',
  },
};

export default async function BlogIndexPage() {
  const blogs = await blogService.getAll();

  return (
    <div className="bg-clinic-canvas min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-50 text-bronze-800 border border-peach-200/80 text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-bronze-700" />
            <span>Bilimsel Dermatoloji Yazıları</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-espresso-900 tracking-tight">
            Sağlık Rehberi &amp; Makaleler
          </h1>
          <p className="text-sm sm:text-base text-espresso-800/75 leading-relaxed">
            Dermatoloji Uzmanı Prof. Dr. Mustafa Özdemir&apos;in hazırladığı
            kanıta dayalı bilgilendirici rehberler.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-bronze-200/80 text-sm text-espresso-800/70">
            Henüz blog yazısı yayınlanmamıştır.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((b) => (
              <article
                key={b.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-bronze-200/80 hover:border-bronze-500/70 hover:shadow-xl hover:shadow-bronze-900/5 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {b.tags?.[0] && (
                      <span className="text-[11px] font-semibold text-bronze-800 bg-peach-50 px-2.5 py-0.5 rounded-full border border-peach-200/70">
                        {b.tags[0]}
                      </span>
                    )}
                    <span className="text-[11px] text-bronze-500">
                      {new Date(b.publishedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="text-lg font-serif font-bold text-espresso-900 hover:text-bronze-700 transition line-clamp-2 mb-3">
                    <Link href={`/blog/${b.slug}`}>{b.title}</Link>
                  </h2>

                  <p className="text-xs text-espresso-800/75 leading-relaxed line-clamp-3">
                    {b.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-bronze-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-espresso-800/65">
                    {b.author}
                  </span>
                  <Link
                    href={`/blog/${b.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-bronze-700 hover:text-espresso-900"
                  >
                    <span>Makaleyi Oku</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

