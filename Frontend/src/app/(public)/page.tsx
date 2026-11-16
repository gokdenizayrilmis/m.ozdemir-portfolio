import Link from 'next/link';
import {
  categoryService,
  treatmentService,
  blogService,
  settingsService,
} from '@/services';
import TreatmentCard from '@/components/public/TreatmentCard';
import HeroShowcase from '@/components/public/HeroShowcase';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverLift,
} from '@/components/public/MotionPrimitives';
import {
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';

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
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. Split-Screen Dynamic Editorial Hero Showcase */}
      <HeroShowcase settings={settings} />

      {/* 2. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* 3. Featured Treatments */}
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

      {/* 4. Doctor Academic Profile Highlight (Logo Espresso Theme) */}
      <section className="bg-espresso-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-3 bg-bronze-500/15 border border-peach-200/25 text-peach-200 rounded-xl inline-block text-xs font-semibold uppercase tracking-wider">
                Akademik Kariyer & Uzmanlık
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
                Prof. Dr. Mustafa Özdemir
              </h2>
              <p className="text-sm text-peach-200 font-medium">
                Dermatoloji (Deri ve Zührevi Hastalıkları) Uzmanı
              </p>
              <div className="text-peach-100/80 text-sm leading-relaxed space-y-3">
                <p>
                  1995 yılında İstanbul Üniversitesi Cerrahpaşa Tıp
                  Fakültesi&apos;nden mezun oldu. Dermatoloji uzmanlık eğitimini
                  tamamladıktan sonra akademik araştırmalarını sürdürerek 2015
                  yılında <strong>Profesör</strong> unvanını aldı.
                </p>
                <p>
                  Ulusal ve uluslararası tıp dergilerinde yayımlanmış çok sayıda
                  bilimsel makalesi ve kitap bölümü bulunmaktadır. Lazer
                  tedavileri, dermatoskopi ile ben takibi ve klinik dermatolojide
                  hastalarına kanıta dayalı çözümler sunmaktadır.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/hakkimizda"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-peach-200 hover:text-white transition"
                >
                  <span>Özgeçmişin Tamamını Oku</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-espresso-800/80 rounded-2xl border border-bronze-700/50 space-y-2">
                <ShieldCheck className="w-8 h-8 text-peach-200" />
                <h4 className="font-semibold text-white text-base">
                  Dermatoskopik Ben Taraması
                </h4>
                <p className="text-xs text-peach-100/75 leading-relaxed">
                  Deri kanserlerinin ve melanomun erken teşhisi için ileri
                  dermatoskopi cihazlarıyla haritalama.
                </p>
              </div>

              <div className="p-6 bg-espresso-800/80 rounded-2xl border border-bronze-700/50 space-y-2">
                <Sparkles className="w-8 h-8 text-peach-200" />
                <h4 className="font-semibold text-white text-base">
                  İleri Leke ve Lazer Protokolleri
                </h4>
                <p className="text-xs text-peach-100/75 leading-relaxed">
                  Güneş lekesi, melazma ve dövme silmede çevre dokuya hasar
                  vermeyen hedefli lazer atımları.
                </p>
              </div>

              <div className="p-6 bg-espresso-800/80 rounded-2xl border border-bronze-700/50 space-y-2">
                <Award className="w-8 h-8 text-peach-200" />
                <h4 className="font-semibold text-white text-base">
                  HPV & Genital Siğil Tedavisi
                </h4>
                <p className="text-xs text-peach-100/75 leading-relaxed">
                  Hasta mahremiyetine tam saygılı kriyoterapi, koterizasyon ve
                  lazer ablasyon çözümleri.
                </p>
              </div>

              <div className="p-6 bg-espresso-800/80 rounded-2xl border border-bronze-700/50 space-y-2">
                <MapPin className="w-8 h-8 text-peach-200" />
                <h4 className="font-semibold text-white text-base">
                  Merkezi Konum (Ataköy Towers)
                </h4>
                <p className="text-xs text-peach-100/75 leading-relaxed">
                  E-5 Yanyol üzerinde, metrobüs ve metroya yürüme mesafesinde,
                  kolay otopark imkanı.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest Blog Posts */}
      {latestBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-bronze-700 font-bold">
                Dermatoloji Rehberi
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-900 mt-1">
                Güncel Tıbbi Makaleler & Yazılar
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold text-bronze-700 hover:text-espresso-900 flex items-center gap-1.5"
            >
              <span>Tüm Makaleleri Oku</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogs.map((b) => (
              <article
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-bronze-200/80 hover:shadow-md transition flex flex-col justify-between"
              >
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

