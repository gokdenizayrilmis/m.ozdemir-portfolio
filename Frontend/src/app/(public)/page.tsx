import Link from 'next/link';
import {
  categoryService,
  treatmentService,
  blogService,
} from '@/services';
import TreatmentCard from '@/components/public/TreatmentCard';
import AppointmentForm from '@/components/public/AppointmentForm';
import {
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

export default async function HomePage() {
  const [categories, treatments, blogs] = await Promise.all([
    categoryService.getAll(),
    treatmentService.getAll(),
    blogService.getAll(),
  ]);

  const featuredTreatments = treatments.slice(0, 6);
  const latestBlogs = blogs.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAF8F5] to-slate-100/60 pt-10 sm:pt-16 pb-16 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <Award className="w-4 h-4 text-amber-700" />
                <span>1995 Cerrahpaşa Tıp • 2015 Profesörlük</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.15]">
                Bilimsel ve Güvenilir <br className="hidden sm:inline" />
                <span className="text-amber-800">Dermatoloji & Lazer</span>{' '}
                Tedavileri
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Prof. Dr. Mustafa Özdemir Kliniği’nde; akne, lazerle leke
                tedavisi, dermatoskopik ben taraması, HPV genital siğil ve
                kozmetik dermatoloji alanlarında kanıta dayalı akademik tıp
                yaklaşımı.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30+ Yıllık Tıbbi Deneyim</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>İleri Teknoloji Lazerler</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ataköy Towers Bakırköy</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-sm font-semibold shadow-lg shadow-slate-900/10 transition"
                >
                  <CalendarCheck className="w-4 h-4 text-amber-400" />
                  <span>Muayene Randevusu Al</span>
                </Link>
                <Link
                  href="/hakkimizda"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-4 rounded-xl text-sm font-semibold transition"
                >
                  <span>Prof. Dr. Özdemir&apos;i Tanıyın</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Right Card / Fast Appointment */}
            <div className="lg:col-span-5">
              <AppointmentForm
                defaultSubject="Genel Randevu ve Bilgi Talebi"
                className="shadow-xl border-amber-200/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
            Hizmet Alanlarımız
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">
            Dermatolojik Uzmanlık Branşları
          </h2>
          <p className="text-sm text-slate-600">
            Cilt sağlığınızı korumak ve iyileştirmek için modern dermatolojinin
            tüm olanakları bir arada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-amber-800 transition">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Tedavileri Gör</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Treatments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
              Öne Çıkan Klinik Tedaviler
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
              En Sık Başvurulan Tedavi Başlıkları
            </h2>
          </div>
          <Link
            href="/kategori/dermatoloji"
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1.5"
          >
            <span>Tüm Tedavileri İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTreatments.map((t) => (
            <TreatmentCard key={t.id} treatment={t} />
          ))}
        </div>
      </section>

      {/* 4. Doctor Academic Profile Highlight */}
      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl inline-block text-xs font-semibold uppercase tracking-wider">
                Akademik Kariyer & Uzmanlık
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
                Prof. Dr. Mustafa Özdemir
              </h2>
              <p className="text-sm text-amber-300 font-medium">
                Dermatoloji (Deri ve Zührevi Hastalıkları) Uzmanı
              </p>
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
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
                  className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                >
                  <span>Özgeçmişin Tamamını Oku</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                <ShieldCheck className="w-8 h-8 text-amber-500" />
                <h4 className="font-semibold text-white text-base">
                  Dermatoskopik Ben Taraması
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deri kanserlerinin ve melanomun erken teşhisi için ileri
                  dermatoskopi cihazlarıyla haritalama.
                </p>
              </div>

              <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500" />
                <h4 className="font-semibold text-white text-base">
                  İleri Leke ve Lazer Protokolleri
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Güneş lekesi, melazma ve dövme silmede çevre dokuya hasar
                  vermeyen hedefli lazer atımları.
                </p>
              </div>

              <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                <Award className="w-8 h-8 text-amber-500" />
                <h4 className="font-semibold text-white text-base">
                  HPV & Genital Siğil Tedavisi
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hasta mahremiyetine tam saygılı kriyoterapi, koterizasyon ve
                  lazer ablasyon çözümleri.
                </p>
              </div>

              <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                <MapPin className="w-8 h-8 text-amber-500" />
                <h4 className="font-semibold text-white text-base">
                  Merkezi Konum (Ataköy Towers)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
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
              <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                Dermatoloji Rehberi
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
                Güncel Tıbbi Makaleler & Yazılar
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1.5"
            >
              <span>Tüm Makaleleri Oku</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogs.map((b) => (
              <article
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {b.tags?.[0] && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                        {b.tags[0]}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      Prof. Dr. Mustafa Özdemir
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-900 hover:text-amber-800 transition line-clamp-2 mb-2">
                    <Link href={`/blog/${b.slug}`}>{b.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {b.summary}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href={`/blog/${b.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
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

