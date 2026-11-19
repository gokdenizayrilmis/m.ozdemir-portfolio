'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, settingsService } from '@/services';
import { SiteSettings } from '@/types';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  Save,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Lütfen tüm şifre alanlarını doldurunuz.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({
        type: 'error',
        message: 'Yeni şifre en az 6 karakter olmalıdır.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Yeni şifre ve tekrar alanı birbiriyle eşleşmiyor.',
      });
      return;
    }

    setChangingPassword(true);
    const res = await authService.changePassword({
      currentPassword,
      newPassword,
    });
    setChangingPassword(false);

    if (res.isSuccess) {
      setPasswordStatus({
        type: 'success',
        message:
          res.message ||
          'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapmanız için yönlendiriliyorsunuz...',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.replace('/admin/login');
      }, 2000);
    } else {
      setPasswordStatus({
        type: 'error',
        message: res.message || 'Şifre değiştirilirken bir hata oluştu.',
      });
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
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
          Genel Klinik Yapılandırması
        </span>
        <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-900 mt-1">
          Klinik &amp; İletişim Ayarları
        </h1>
        <p className="text-xs text-slate-500">
          Kurumsal görseller, telefon numaraları, WhatsApp randevu hattı,
          GTM/GA4 kimlikleri ve yönetici güvenliği
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
        {/* Corporate Images & Certificates Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
                Kurumsal Görseller &amp; Belgeler
              </h3>
              <p className="text-[11px] text-slate-500">
                Üst menü logosu, Ana Sayfa Giriş (Hero) görseli, Hakkımızda
                portresi ve resmi yetki belgelerini yükleyerek anında
                güncelleyin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ImageUpload
              label="Üst Menü & Kurumsal Logo"
              description="Header sol üst köşede gösterilen resmi klinik logosu"
              folder="corporate"
              value={settings.logoUrl || ''}
              onChange={(url) => setSettings({ ...settings, logoUrl: url })}
            />

            <ImageUpload
              label="Ana Sayfa Giriş (Hero) Görseli"
              description="Ana sayfanın en üst açılış ekranında tam ekran gösterilen klinik karşılama fotoğrafı"
              folder="corporate"
              value={settings.heroShowroomImageUrl || ''}
              onChange={(url) =>
                setSettings({ ...settings, heroShowroomImageUrl: url })
              }
            />

            <ImageUpload
              label="Hakkımızda / Biyografi Görseli"
              description="Hakkımda (Akademik Kariyer & Biyografi) bölümünde sol sütunda yer alan doktor portre fotoğrafı"
              folder="corporate"
              value={settings.doctorPortraitUrl || ''}
              onChange={(url) =>
                setSettings({ ...settings, doctorPortraitUrl: url })
              }
            />

            <ImageUpload
              label="Health Türkiye Sertifikası"
              description="Uluslararası Sağlık Turizmi / Health Türkiye resmi sertifika görseli"
              folder="corporate"
              value={settings.healthTurkiyeCertificateUrl || ''}
              onChange={(url) =>
                setSettings({ ...settings, healthTurkiyeCertificateUrl: url })
              }
            />

            <ImageUpload
              label="T.C. Sağlık Bakanlığı Yetki Belgesi"
              description="Sağlık Bakanlığı resmi ruhsat ve yetki belgesi görseli"
              folder="corporate"
              value={settings.ministryCertificateUrl || ''}
              onChange={(url) =>
                setSettings({ ...settings, ministryCertificateUrl: url })
              }
            />
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base border-b border-slate-100 pb-3">
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
                Birincil Telefon (Bizi Arayın Butonu)
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
          <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base border-b border-slate-100 pb-3">
            Google Analytics &amp; Tag Manager (GTM) Entegrasyonu
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
          <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base border-b border-slate-100 pb-3">
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

        {/* Save Settings Button */}
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

      {/* Security & Admin Password Change Card */}
      <form
        onSubmit={handlePasswordChange}
        className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5 text-xs"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
              Güvenlik &amp; Yönetici Şifresi Değiştir
            </h3>
            <p className="text-[11px] text-slate-500">
              Şifrenizi güncellediğinizde güvenlik gereği tüm açık oturumlarınız
              sonlandırılır ve yeniden giriş yapmanız gerekir
            </p>
          </div>
        </div>

        {passwordStatus && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 ${
              passwordStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {passwordStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{passwordStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mevcut Şifre <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Yeni Şifre <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Yeni Şifre Tekrar <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni şifreyi doğrulayın"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs shadow-md transition inline-flex items-center gap-2"
          >
            {changingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Şifre Güncelleniyor...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Şifreyi Güncelle</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
