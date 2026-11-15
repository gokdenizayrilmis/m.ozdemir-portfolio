'use client';

import { useState } from 'react';
import { leadService } from '@/services';
import { getStoredUtmData } from '@/hooks/use-utm-tracker';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setStatus('error');
      setErrorMessage('Lütfen Ad Soyad ve Telefon numaranızı giriniz.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    const utm = getStoredUtmData();
    const currentPath =
      sourcePageSlug ||
      (typeof window !== 'undefined' ? window.location.pathname : '/');

    const res = await leadService.createLead({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      subject: defaultSubject,
      message: message.trim() || 'Hasta randevu ve bilgi almak istiyor.',
      sourcePageSlug: currentPath,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
    });

    setIsSubmitting(false);

    if (res.isSuccess) {
      setStatus('success');
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } else {
      setStatus('error');
      setErrorMessage(res.message || 'Gönderim sırasında bir hata oluştu.');
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-md ${className}`}
    >
      <div className="mb-5">
        <h3 className="text-lg font-serif font-bold text-slate-900">
          Randevu & Bilgi Formu
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Bilgilerinizi bırakın, klinik asistanımız en kısa sürede size dönüş
          yapsın.
        </p>
      </div>

      {status === 'success' ? (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-semibold text-emerald-900 text-sm">
            Talebiniz Alındı
          </h4>
          <p className="text-xs text-emerald-700">
            Prof. Dr. Mustafa Özdemir Kliniği asistanı en kısa sürede sizinle
            iletişime geçecektir.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-3 text-xs font-semibold text-emerald-800 underline"
          >
            Yeni bir mesaj gönder
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {status === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Ayşe Yılmaz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telefon Numarası <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="05XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-Posta Adresi (İsteğe Bağlı)
            </label>
            <input
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              İletmek İstediğiniz Not
            </label>
            <textarea
              rows={3}
              placeholder="Tedavi veya muayene ile ilgili sormak istedikleriniz..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-400" />
                <span>Bilgi ve Randevu Talebi İlet</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-tight">
            Formu doldurarak KVKK aydınlatma metnini kabul etmiş olursunuz.
          </p>
        </form>
      )}
    </div>
  );
}

