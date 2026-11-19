import { Metadata } from 'next';
import AppointmentForm from '@/components/public/AppointmentForm';
import { resolveMediaUrl } from '@/utils/cn';
import { Award, GraduationCap, Building2, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkımızda | Prof. Dr. Mustafa Özdemir Dermatoloji Uzmanı',
  description:
    'Prof. Dr. Mustafa Özdemir akademik özgeçmişi, Cerrahpaşa Tıp Fakültesi mezuniyeti, profesörlük unvanı, bilimsel yayınları ve Bakırköy Ataköy kliniği.',
  alternates: {
    canonical: 'https://drmustafaozdemir.com/hakkimizda',
  },
};

export default function AboutPage() {
  const portraitUrl = resolveMediaUrl('/uploads/corporate/doctor-portrait.jpg');

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Hero Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-amber-700" />
              <span>Akademik ve Klinik Özgeçmiş</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
              Prof. Dr. Mustafa Özdemir
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Dermatoloji (Deri ve Zührevi Hastalıklar) Uzmanı • Akademisyen • Klinik Araştırmacı
            </p>
          </div>
          {portraitUrl && (
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <div className="w-48 h-60 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portraitUrl}
                  alt="Prof. Dr. Mustafa Özdemir"
                  width={192}
                  height={240}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Academic Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
            <div className="prose-medical">
              <h2>Eğitim ve Akademik Kariyer</h2>
              <p>
                <strong>Prof. Dr. Mustafa Özdemir</strong>, 1995 yılında
                Türkiye&apos;nin en köklü tıp kurumlarından biri olan{' '}
                <strong>
                  İstanbul Üniversitesi Cerrahpaşa Tıp Fakültesi
                </strong>
                &apos;nden tıp doktoru olarak mezun olmuştur.
              </p>
              <p>
                Dermatoloji (Deri ve Zührevi Hastalıklar) anabilim dalında
                uzmanlık eğitimini başarıyla tamamladıktan sonra yurt içi ve yurt
                dışı akademik çalışmalara imza atmıştır. Bilimsel çalışmaları ve
                klinik deneyimi neticesinde 2015 yılında{' '}
                <strong>Profesör</strong> unvanını almıştır.
              </p>

              <h2>Uzmanlık ve İlgi Alanları</h2>
              <p>Kariyeri boyunca özellikle şu alanlarda yoğunlaşmıştır:</p>
              <ul>
                <li>
                  <strong>Klinik Dermatoloji:</strong> Akne (sivilce), rozasea
                  (gül hastalığı), sedef (psoriasis), vitiligo, egzama ve atopik
                  dermatit tedavileri.
                </li>
                <li>
                  <strong>Dermatoskopi & Ben Taraması:</strong> Ben haritalama,
                  displastik nevuslar ve melanom erken teşhisi.
                </li>
                <li>
                  <strong>Lazer Tedavileri:</strong> Lazerle leke tedavisi
                  (melazma, lentigo), dövme silme, kılcal damar ve akne skarı
                  ablasyonu.
                </li>
                <li>
                  <strong>Genito-Üriner Dermatoloji:</strong> HPV ve genital
                  siğil (kondilom) tanı ve cerrahi/kriyo tedavileri.
                </li>
                <li>
                  <strong>Kozmetik Dermatoloji:</strong> Ameliyatsız ip askısı,
                  mezoterapi, kimyasal peeling ve aşırı terleme (hiperhidroz)
                  enjeksiyonları.
                </li>
              </ul>

              <h2>Klinik Felsefesi</h2>
              <p>
                Prof. Dr. Mustafa Özdemir Kliniği&apos;nde tüm tanı ve tedavi
                süreçleri &quot;kanıta dayalı tıp&quot; ilkeleri doğrultusunda,
                ticari kaygılardan uzak ve hasta odaklı yürütülür. Her hastanın
                cilt yapısı benzersizdir; bu nedenle tedavi protokolleri tamamen
                kişiye özel planlanır.
              </p>
            </div>

            {/* Badges Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <Award className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-bold text-slate-900 block">
                  1995 Mezunu
                </span>
                <span className="text-[11px] text-slate-500">
                  Cerrahpaşa Tıp Fakültesi
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <BookOpen className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-bold text-slate-900 block">
                  2015 Profesör
                </span>
                <span className="text-[11px] text-slate-500">
                  Dermatoloji Anabilim Dalı
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <Building2 className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-bold text-slate-900 block">
                  Ataköy Towers
                </span>
                <span className="text-[11px] text-slate-500">
                  Özel Klinik Muayenehane
                </span>
              </div>
            </div>
          </div>

          {/* Right Column Fast Appointment Form */}
          <div className="lg:col-span-4 space-y-6">
            <AppointmentForm
              defaultSubject="Prof. Dr. Mustafa Özdemir Muayene Randevusu"
              className="shadow-xl border-amber-200/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

