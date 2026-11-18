import { SiteSettings } from '@/types';
import ContactActionButtons from '@/components/public/ContactActionButtons';
import { FadeIn } from '@/components/public/MotionPrimitives';
import { Phone, Mail, MapPin, Clock, Info } from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings | null;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const secondPhone = settings?.phoneNumbers?.[1] || '0 553 794 26 00';
  const email = settings?.email || 'mustafaozdemir@yahoo.com';
  const address =
    settings?.address ||
    'Ataköy 7-8-9-10. Kısım Mah. Çobançeşme E-5 Yanyol Cad. Ataköy Towers B-Blok No:146, 34158 Bakırköy/İstanbul';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const mapEmbedUrl =
    settings?.googleMapsEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.660602418987!2d28.8315!3d40.9895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU5JzIyLjIiTiAyOMKwNDknNTMuNCJF!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str';

  return (
    <section
      id="iletisim"
      className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-10"
    >
      <FadeIn className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-bronze-700 shrink-0" />
          <span>Bize Ulaşın</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight text-espresso-900">
          İletişim &amp; Konum
        </h2>
        <p className="text-sm text-espresso-800/75 leading-relaxed">
          Prof. Dr. Mustafa Özdemir Kliniği&apos;ne telefonla ulaşabilir,
          WhatsApp üzerinden hızlıca randevu alabilir veya klinik konumumuzu
          haritada inceleyebilirsiniz.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Contact Details Card */}
        <div className="lg:col-span-5">
          <div className="h-full bg-white rounded-3xl p-6 sm:p-8 border border-bronze-200/80 shadow-sm flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-peach-50 rounded-xl text-bronze-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-espresso-900 text-sm">
                    Klinik Adresi
                  </h3>
                  <p className="text-xs text-espresso-800/75 mt-1 leading-relaxed">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-peach-50 rounded-xl text-bronze-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-espresso-900 text-sm">
                    Telefon Numaraları
                  </h3>
                  <p className="text-xs text-espresso-800/80">
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="hover:text-bronze-700 font-medium transition"
                    >
                      {phone}
                    </a>
                  </p>
                  <p className="text-xs text-espresso-800/80">
                    <a
                      href={`tel:${secondPhone.replace(/\s+/g, '')}`}
                      className="hover:text-bronze-700 font-medium transition"
                    >
                      {secondPhone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-peach-50 rounded-xl text-bronze-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-espresso-900 text-sm">
                    E-Posta
                  </h3>
                  <p className="text-xs text-espresso-800/75 mt-1">
                    <a
                      href={`mailto:${email}`}
                      className="hover:text-bronze-700 transition"
                    >
                      {email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-peach-50 rounded-xl text-bronze-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-espresso-900 text-sm">
                    Çalışma Saatleri
                  </h3>
                  <p className="text-xs text-espresso-800/75 mt-1 leading-relaxed">
                    Pazartesi - Cumartesi: 09:30 - 19:00 <br />
                    (Pazar günleri kapalıdır)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-peach-50/70 border border-peach-200/70 rounded-2xl p-3.5">
                <Info className="w-4 h-4 text-bronze-700 shrink-0 mt-0.5" />
                <p className="text-xs text-espresso-800/80 leading-relaxed">
                  Randevu ve bilgi talepleriniz için bize dilediğiniz zaman ulaşabilirsiniz. 
                  Ekibimiz, mesai saatleri içerisinde en kısa sürede sizinle iletişime geçecektir.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 border-t border-bronze-100">
              <ContactActionButtons
                phone={phone}
                whatsappNumber={whatsappNumber}
                layout="grid"
              />
            </div>
          </div>
        </div>

        {/* Right: Map Embed */}
        <div className="lg:col-span-7">
          <div className="h-full bg-white rounded-3xl p-4 sm:p-6 border border-bronze-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-4 px-1">
              <h3 className="font-sans font-bold text-espresso-900 text-lg tracking-tight">
                Haritada Kliniğimiz
              </h3>
              <span className="text-xs font-semibold text-bronze-700 bg-peach-50 border border-peach-200/70 px-3 py-1 rounded-full">
                Ataköy Towers
              </span>
            </div>
            <div className="w-full flex-1 min-h-[340px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-bronze-100">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Prof. Dr. Mustafa Özdemir Klinik Haritası"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
