import Link from 'next/link';
import {
  categoryService,
  treatmentService,
  blogService,
  settingsService,
} from '@/services';
import TreatmentCard from '@/components/public/TreatmentCard';
import HeroShowcase from '@/components/public/HeroShowcase';
import DoctorAboutSection from '@/components/public/DoctorAboutSection';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverLift,
} from '@/components/public/MotionPrimitives';
import { Sparkles, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const [categories, treatments, blogs, settings] = await Promise.all([
    categoryService.getAll(),
    treatmentService.getAll(),
    blogService.getAll(),
    settingsService.getSettings(),
  ]);

  const featuredTreatments = treatments.slice(0, 6);
  const latestBlogs = blogs.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Açılış Sayfası: Tam Ekran Klinik Görseli & Hoş Geldiniz Alanı + Gold CTA Şeridi */}
      <HeroShowcase settings={settings} />

      {/* 2. Hizmet Alanlarımız — Dermatolojik Uzmanlık Branşları */}
      <section
        id="uzmanlik-alanlari"
        className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6"
      >
        <FadeIn className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-widest text-bronze-700 font-bold">
            Hizmet Alanlarımız
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-espresso-900">
            Dermatolojik Uzmanlık Branşları
          </h2>
          <p className="text-sm text-espresso-800/75">
            Cilt sağlığınızı korumak ve iyileştirmek için modern dermatolojinin
            tüm olanakları bir arada.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <StaggerItem key={cat.id} className="h-full">
              <HoverLift className="h-full">
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="group h-full bg-white rounded-2xl p-6 border border-bronze-200/80 hover:border-bronze-500/70 hover:shadow-xl hover:shadow-bronze-900/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-peach-50 text-bronze-700 flex items-center justify-center group-hover:bg-bronze-700 group-hover:text-white transition">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-espresso-900 group-hover:text-bronze-700 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-espresso-800/75 leading-relaxed line-clamp-3">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-bronze-100 flex items-center justify-between text-xs font-semibold text-bronze-700">
                    <span>Tedavileri Gör</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 3. Öne Çıkan Klinik Tedaviler — En Sık Başvurulan Tedavi Başlıkları */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-bronze-700 font-bold">
              Öne Çıkan Klinik Tedaviler
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-900 mt-1">
              En Sık Başvurulan Tedavi Başlıkları
            </h2>
          </div>
          <Link
            href="/kategori/dermatoloji"
            className="text-xs font-semibold text-bronze-700 hover:text-espresso-900 flex items-center gap-1.5"
          >
            <span>Tüm Tedavileri İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTreatments.map((t) => (
            <StaggerItem key={t.id} className="h-full">
              <HoverLift className="h-full">
                <TreatmentCard treatment={t} />
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* 4. Hakkımda Alanı — Akademik Kariyer & Uzmanlık + Resmi Belgeler */}
      <DoctorAboutSection settings={settings} />

      {/* 5. Dermatoloji Rehberi — Güncel Tıbbi Makaleler & Yazılar */}
      {latestBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-bronze-700 font-bold">
                Dermatoloji Rehberi
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-900 mt-1">
                Güncel Tıbbi Makaleler &amp; Yazılar
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold text-bronze-700 hover:text-espresso-900 flex items-center gap-1.5"
            >
              <span>Tüm Makaleleri Oku</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogs.map((b) => (
              <StaggerItem key={b.id} className="h-full">
                <HoverLift className="h-full">
                  <article className="h-full bg-white rounded-2xl p-6 border border-bronze-200/80 hover:border-bronze-500/70 hover:shadow-xl transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {b.tags?.[0] && (
                          <span className="text-[11px] font-semibold text-bronze-800 bg-peach-50 border border-peach-200/70 px-2.5 py-0.5 rounded-full">
                            {b.tags[0]}
                          </span>
                        )}
                        <span className="text-[11px] text-bronze-500">
                          Prof. Dr. Mustafa Özdemir
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-espresso-900 hover:text-bronze-700 transition line-clamp-2 mb-2">
                        <Link href={`/blog/${b.slug}`}>{b.title}</Link>
                      </h3>
                      <p className="text-xs text-espresso-800/75 line-clamp-3 leading-relaxed">
                        {b.summary}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-bronze-100">
                      <Link
                        href={`/blog/${b.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-bronze-700 hover:text-espresso-900"
                      >
                        <span>Yazının Devamı</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}
    </div>
  );
}
