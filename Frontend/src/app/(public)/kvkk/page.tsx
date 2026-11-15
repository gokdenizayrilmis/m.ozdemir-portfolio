import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KVKK, Çerez Politikası & Yasal Uyarı | Prof. Dr. Mustafa Özdemir',
  description:
    'Prof. Dr. Mustafa Özdemir Muayenehanesi KVKK aydınlatma metni, çerez politikası ve T.C. Sağlık Bakanlığı yasal bilgilendirmeleri.',
};

export default function KvkkPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                KVKK & Yasal Aydınlatma Metni
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kişisel Verilerin Korunması, Çerezler ve Sağlık Bakanlığı
                Mevzuatı
              </p>
            </div>
          </div>

          <div className="prose-medical text-sm leading-relaxed space-y-6">
            <section>
              <h2>1. Veri Sorumlusu</h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
                uyarınca, Prof. Dr. Mustafa Özdemir Muayenehanesi (“Klinik”)
                olarak, veri sorumlusu sıfatıyla tarafımıza iletilen kişisel
                verileriniz işbu metin kapsamında işlenmektedir.
              </p>
            </section>

            <section>
              <h2>2. Kişisel Verilerin İşlenme Amacı</h2>
              <p>
                Web sitemizde yer alan randevu formları, telefon veya WhatsApp
                iletişim hatları aracılığıyla paylaştığınız ad, soyad, telefon
                numarası, e-posta adresi gibi kişisel verileriniz;
              </p>
              <ul>
                <li>Muayene ve danışmanlık randevularınızın oluşturulması,</li>
                <li>
                  Talep ettiğiniz klinik hizmet hakkında bilgilendirme
                  yapılması,
                </li>
                <li>
                  Randevu hatırlatma ve hasta iletişim süreçlerinin yürütülmesi,
                </li>
              </ul>
              <p>amaçlarıyla sınırlı olarak işlenmektedir.</p>
            </section>

            <section>
              <h2>3. T.C. Sağlık Bakanlığı Zorunlu Yasal Uyarısı</h2>
              <p>
                Sağlık Hizmetlerinde Tanıtım ve Bilgilendirme Faaliyetleri
                Hakkında Yönetmelik hükümleri uyarınca; sitemizde tedavi
                fiyatları belirtilmemektedir ve sunulan bilgiler hiçbir şekilde
                hekim muayenesi yerine geçmez. Sitede yer alan metin ve
                görseller yalnızca genel tıbbi bilgilendirme amacı taşımaktadır.
              </p>
            </section>

            <section>
              <h2>4. Çerez (Cookie) Politikası</h2>
              <p>
                Web sitemizde ziyaretçi deneyimini iyileştirmek, Google Core Web
                Vitals hız metriklerini izlemek ve reklam dönüşümlerini (Google
                Ads / Analytics) analiz etmek amacıyla teknik çerezler
                kullanılmaktadır.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

