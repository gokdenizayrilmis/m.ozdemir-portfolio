import { Metadata } from 'next';
import { settingsService } from '@/services';
import AppointmentForm from '@/components/public/AppointmentForm';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { createWhatsAppUrl } from '@/utils/cn';

export const metadata: Metadata = {
  title: 'İletişim & Randevu | Prof. Dr. Mustafa Özdemir Ataköy Towers',
  description:
    'Prof. Dr. Mustafa Özdemir Kliniği iletişim bilgileri, telefon, WhatsApp randevu hattı, çalışma saatleri ve Bakırköy Ataköy Towers harita konumu.',
  alternates: {
    canonical: 'https://drmustafaozdemir.com/iletisim',
  },
};

export default async function ContactPage() {
  const settings = await settingsService.getSettings();

  const phone = settings?.phoneNumbers?.[0] || '+90 552 265 64 36';
  const secondPhone = settings?.phoneNumbers?.[1] || '0 553 794 26 00';
  const email = settings?.email || 'mustafaozdemir@yahoo.com';
  const address =
    settings?.address ||
    'Ataköy 7-8-9-10. Kısım Mah. Çobançeşme E-5 Yanyol Cad. Ataköy Towers B-Blok No:146, 34158 Bakırköy/İstanbul';
  const whatsappNumber = settings?.whatsAppNumber || '905522656436';
  const waUrl = createWhatsAppUrl(whatsappNumber);
  const mapEmbedUrl =
    settings?.googleMapsEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.660602418987!2d28.8315!3d40.9895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU5JzIyLjIiTiAyOMKwNDknNTMuNCJF!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str';

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
            Bize Ulaşın
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            İletişim & Randevu
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Prof. Dr. Mustafa Özdemir Kliniği&apos;ne telefonla ulaşabilir,
            WhatsApp üzerinden anında randevu oluşturabilir veya formu
            doldurabilirsiniz.
          </p>
        </div>

        {/* 2-Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Details & Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Klinik Adresi
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Telefon Numaraları
                  </h4>
                  <p className="text-xs text-slate-600">
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="hover:text-amber-800 font-medium"
                    >
                      {phone}
                    </a>
                  </p>
                  <p className="text-xs text-slate-600">
                    <a
                      href={`tel:${secondPhone.replace(/\s+/g, '')}`}
                      className="hover:text-amber-800 font-medium"
                    >
                      {secondPhone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    WhatsApp Randevu Hattı
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      Mesaj Göndermek İçin Tıklayın
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    E-Posta
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    <a href={`mailto:${email}`} className="hover:text-amber-800">
                      {email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Çalışma Saatleri
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Pazartesi - Cumartesi: 09:30 - 19:00 <br />
                    (Pazar günleri kapalıdır)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <AppointmentForm
              defaultSubject="İletişim Sayfası Randevu Talebi"
              className="shadow-xl"
            />
          </div>
        </div>

        {/* Map Embed Section */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm overflow-hidden">
          <h3 className="font-serif font-bold text-slate-900 text-lg mb-4 px-2">
            Haritada Kliniğimiz (Ataköy Towers)
          </h3>
          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-100">
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
  );
}

