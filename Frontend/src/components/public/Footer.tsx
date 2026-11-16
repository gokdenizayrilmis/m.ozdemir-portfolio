import Link from 'next/link';
import { Category, SiteSettings } from '@/types';
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  categories: Category[];
  settings: SiteSettings | null;
}

export default function Footer({ categories, settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const email = settings?.email || 'mustafaozdemir@yahoo.com';
  const address =
    settings?.address ||
    'Ataköy 7-8-9-10. Kısım Mah. Çobançeşme E-5 Yanyol Cad. Ataköy Towers B-Blok No:146, 34158 Bakırköy/İstanbul';

  return (
    <footer className="bg-espresso-950 text-peach-100/75 text-sm border-t border-espresso-900 pb-20 lg:pb-0">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-bold text-white tracking-tight">
            Prof. Dr. Mustafa Özdemir
          </h3>
          <p className="text-xs uppercase tracking-widest text-bronze-400 font-semibold">
            Dermatoloji Uzmanı
          </p>
          <p className="text-peach-100/70 text-xs leading-relaxed">
            1995 Cerrahpaşa Tıp mezunu, 2015 Profesör. Klinik dermatoloji, lazer
            tedavileri, ben taraması ve estetik dermatolojide kanıta dayalı,
            hasta odaklı tıp yaklaşımı.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-peach-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>T.C. Sağlık Bakanlığı Onaylı Muayenehane</span>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm tracking-wide uppercase">
            Tedavi Alanları
          </h4>
          <ul className="space-y-2 text-xs">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="hover:text-peach-200 transition"
                >
                  {cat.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className="hover:text-peach-200 transition">
                Dermatoloji Blog & Makaleler
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm tracking-wide uppercase">
            Kurumsal & Bilgi
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/hakkimizda" className="hover:text-peach-200 transition">
                Prof. Dr. Mustafa Özdemir Özgeçmiş
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className="hover:text-peach-200 transition">
                Klinik Konumu & Ulaşım
              </Link>
            </li>
            <li>
              <Link href="/kvkk" className="hover:text-peach-200 transition">
                KVKK & Aydınlatma Metni
              </Link>
            </li>
            <li>
              <Link href="/kvkk" className="hover:text-peach-200 transition">
                Çerez Politikası
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-bronze-400 transition text-[10px]">
                Yönetici Girişi
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm tracking-wide uppercase">
            İletişim & Randevu
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-bronze-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-bronze-400 shrink-0" />
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition">
                {phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-bronze-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white transition">
                {email}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-bronze-400 shrink-0" />
              <span>Pazartesi - Cumartesi: 09:30 - 19:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Health Ministry Legal Notice */}
      <div className="bg-espresso-900/90 border-t border-espresso-800 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-peach-100/60 leading-relaxed">
          <p>
            {settings?.legalNotice ||
              'T.C. Sağlık Bakanlığı mevzuatı ve Tabip Odası kuralları gereğince sitemizde işlem fiyatları belirtilmemektedir. Sitede yer alan tüm içerikler yalnızca ziyaretçileri bilgilendirme amaçlı hazırlanmıştır. Tanı ve tedavi işlemleri için mutlaka hekiminize başvurunuz.'}
          </p>
          <div className="mt-4 pt-4 border-t border-espresso-800 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>
              © {currentYear} Prof. Dr. Mustafa Özdemir. Tüm Hakları Saklıdır.
            </span>
            <span className="text-bronze-400/70">
              Ataköy Towers, Bakırköy / İstanbul • Klinik CMS Altyapısı
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

