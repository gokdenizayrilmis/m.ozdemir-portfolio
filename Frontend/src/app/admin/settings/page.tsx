'use client';

import { useEffect, useState } from 'react';
import { settingsService } from '@/services';
import { SiteSettings } from '@/types';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaved(false);

    const res = await settingsService.updateSettings(settings);
    setSaving(false);

    if (res.isSuccess) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(res.message || 'Ayarlar kaydedilemedi.');
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Klinik ayarları yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Genel Klinik Yapılandırması
        </span>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
          Klinik & İletişim Ayarları
        </h1>
        <p className="text-xs text-slate-500">
          Telefon numaraları, WhatsApp randevu hattı, GTM/GA4 kimlikleri ve
          hekim özgeçmişi
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold">
            Klinik ayarları başarıyla güncellendi ve Next.js ISR önbelleği
            yenilendi!
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            İletişim ve Adres Bilgileri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Klinik Adı
              </label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) =>
                  setSettings({ ...settings, clinicName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Numarası (Ülke kodu ile)
              </label>
              <input
                type="text"
                value={settings.whatsAppNumber}
                onChange={(e) =>
                  setSettings({ ...settings, whatsAppNumber: e.target.value })
                }
                placeholder="905522656436"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Birincil Telefon (Hemen Ara Butonu)
              </label>
              <input
                type="text"
                value={settings.phoneNumbers?.[0] || ''}
                onChange={(e) => {
                  const phones = [...(settings.phoneNumbers || [])];
                  phones[0] = e.target.value;
                  setSettings({ ...settings, phoneNumbers: phones });
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                İkincil Telefon (Klinik Santral)
              </label>
              <input
                type="text"
                value={settings.phoneNumbers?.[1] || ''}
                onChange={(e) => {
                  const phones = [...(settings.phoneNumbers || [])];
                  phones[1] = e.target.value;
                  setSettings({ ...settings, phoneNumbers: phones });
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Klinik Adresi
            </label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Google Maps Embed URL
            </label>
            <input
              type="text"
              value={settings.googleMapsEmbedUrl}
              onChange={(e) =>
                setSettings({ ...settings, googleMapsEmbedUrl: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Analytics & GTM ID Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Google Analytics & Tag Manager (GTM) Entegrasyonu
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                placeholder="GTM-XXXXXXX"
                value={settings.googleTagManagerId || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googleTagManagerId: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Analytics 4 (GA4) ID
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googleAnalyticsId: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Doctor Bio Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Prof. Dr. Mustafa Özdemir Biyografi Metni
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hekim Adı
              </label>
              <input
                type="text"
                value={settings.doctorName}
                onChange={(e) =>
                  setSettings({ ...settings, doctorName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unvan
              </label>
              <input
                type="text"
                value={settings.doctorTitle}
                onChange={(e) =>
                  setSettings({ ...settings, doctorTitle: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Biyografi (HTML Destekli)
            </label>
            <textarea
              rows={6}
              value={settings.doctorBio}
              onChange={(e) =>
                setSettings({ ...settings, doctorBio: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>Tüm Ayarları Kaydet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

