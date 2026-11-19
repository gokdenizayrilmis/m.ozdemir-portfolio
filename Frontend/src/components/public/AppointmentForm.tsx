import ContactActionButtons from '@/components/public/ContactActionButtons';
import { Sparkles } from 'lucide-react';

interface AppointmentFormProps {
  sourcePageSlug?: string;
  defaultSubject?: string;
  className?: string;
}

export default function AppointmentForm({
  sourcePageSlug,
  defaultSubject = 'Randevu ve Bilgi Talebi',
  className = '',
}: AppointmentFormProps) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 sm:p-8 border border-bronze-200/80 shadow-md space-y-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-peach-50 border border-peach-200 flex items-center justify-center text-bronze-700 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-espresso-900">
            Muayene &amp; Bilgi Planlaması
          </h3>
          <p className="text-xs text-espresso-800/70">
            Prof. Dr. Mustafa Özdemir Kliniği • {defaultSubject}
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-espresso-800/80 leading-relaxed">
        Randevu oluşturmak veya tedavi süreçlerimiz hakkında bilgi almak için
        WhatsApp hattımızdan ya da telefonla doğrudan kliniğimize
        ulaşabilirsiniz.
      </p>

      <ContactActionButtons
        layout="grid"
        sourcePageSlug={sourcePageSlug}
        whatsappMessage={`Merhaba Prof. Dr. Mustafa Özdemir Kliniği, ${defaultSubject} hakkında bilgi ve randevu almak istiyorum.`}
      />
    </div>
  );
}
