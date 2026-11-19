'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, settingsService } from '@/services';
import { SiteSettings } from '@/types';
import { SETTINGS_SUB_ITEMS } from '@/components/admin/AdminSidebar';
import {
  Save,
  Loader2,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  MapPin,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

function AdminSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'contact';

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

  const handleTabChange = (tab: string) => {
    router.replace(`/admin/settings?tab=${tab}`, { scroll: false });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaved(false);

    const res = await settingsService.updateSettings(settings);
    setSaving(false);

    if (res.isSuccess) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
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
    <div className="space-y-6 max-w-5xl">
      {/* Header + Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
            Genel Klinik Yapılandırması
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-slate-900 mt-1">
            Klinik &amp; İletişim Ayarları
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Telefon numaraları, WhatsApp randevu hattı, konum, GTM/GA4
            analitikleri ve yönetici güvenliği
          </p>
        </div>

        {/* Segmented Tabs synced with URL ?tab=... and Sidebar Dropdown */}
        <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs text-xs">
          {SETTINGS_SUB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => handleTabChange(item.tab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification on Save */}
      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Değişiklikler başarıyla kaydedildi ve Next.js ISR önbelleği
            yenilendi!
          </span>
        </div>
      )}

      {/* TAB 1: İLETİŞİM & KONUM */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
                  İletişim, Adres ve Konum Bilgileri
                </h3>
                <p className="text-[11px] text-slate-500">
                  Sitedeki tüm telefon/WhatsApp butonları ve iletişim haritası
                  bu alanlardan beslenir
                </p>
              </div>
            </div>

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
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
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
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Çalışma Saatleri
                </label>
                <input
                  type="text"
                  value={settings.workingHours || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, workingHours: e.target.value })
                  }
                  placeholder="Pazartesi - Cumartesi: 09:30 - 19:00"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Maps Embed URL
                </label>
                <input
                  type="text"
                  value={settings.googleMapsEmbedUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googleMapsEmbedUrl: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Live Map Preview */}
              {settings.googleMapsEmbedUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-48">
                  <iframe
                    src={settings.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Klinik Harita Önizlemesi"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ANALİTİK & SEO */}
      {activeTab === 'analytics' && (
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
                  Google Analytics, GTM &amp; Yasal Bilgilendirme
                </h3>
                <p className="text-[11px] text-slate-500">
                  Google Ads dönüşüm izleme kimlikleri ve site altı yasal
                  bilgilendirme metni
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Tag Manager (GTM) ID
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
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                T.C. Sağlık Bakanlığı Yasal Bilgilendirme Metni (Footer)
              </label>
              <textarea
                rows={3}
                value={settings.legalNotice || ''}
                onChange={(e) =>
                  setSettings({ ...settings, legalNotice: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: GÜVENLİK & ŞİFRE */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form
            onSubmit={handlePasswordChange}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-5 text-xs"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
                  Güvenlik &amp; Yönetici Şifresi Değiştir
                </h3>
                <p className="text-[11px] text-slate-500">
                  Şifrenizi güncellediğinizde güvenlik gereği tüm açık
                  oturumlarınız (Refresh Token) sonlandırılır
                </p>
              </div>
            </div>

            {passwordStatus && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2 ${
                  passwordStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {passwordStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{passwordStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mevcut Şifre <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Yeni Şifre <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Yeni Şifre Tekrar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifreyi doğrulayın"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs shadow-xs transition inline-flex items-center gap-2"
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

          {/* Session Security Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-start gap-3.5 text-xs text-slate-600">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-slate-900">
                Kurumsal Oturum Güvenliği Aktif (Access + Refresh Token Rotation)
              </h4>
              <p className="leading-relaxed">
                Yönetim paneli oturumunuz 15 dakikalık kısa ömürlü JWT Access
                Token ve SHA-256 ile özetlenmiş `HttpOnly` Refresh Token
                rotasyonu ile korunmaktadır.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Klinik ayarları yükleniyor...</span>
        </div>
      }
    >
      <AdminSettingsContent />
    </Suspense>
  );
}
