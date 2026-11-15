'use client';

import { useEffect, useState } from 'react';
import { leadService } from '@/services';
import { Lead } from '@/types';
import {
  MessageCircle,
  Phone,
  FileText,
  TrendingUp,
  Award,
  Layers,
  Clock,
} from 'lucide-react';

export default function AdminOverviewDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await leadService.getAllLeads();
      setLeads(data);
      setLoading(false);
    }
    load();
  }, []);

  const totalConversions = leads.length;
  const whatsappClicks = leads.filter(
    (l) => l.conversionType === 'WhatsAppClick'
  ).length;
  const phoneClicks = leads.filter(
    (l) => l.conversionType === 'PhoneClick'
  ).length;
  const formLeads = leads.filter(
    (l) => l.conversionType === 'ContactForm'
  ).length;

  // Group by campaign
  const campaignStats = leads.reduce((acc, curr) => {
    const campaign = curr.utmCampaign || 'Organik / Doğrudan Ziyaret';
    acc[campaign] = (acc[campaign] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by landing page
  const pageStats = leads.reduce((acc, curr) => {
    const page = curr.sourcePageSlug || '/';
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Google Ads & Klinik Dönüşüm Kokpiti
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
          Dönüşüm & Hasta Trafik Raporu
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Aylık Google Ads bütçesinin getirdiği telefon, WhatsApp ve form
          dönüşümlerinin anlık performansı
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Toplam Hasta Dönüşümü
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : totalConversions}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Tüm Kanallar
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              WhatsApp Tıklamaları
            </span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {loading ? '...' : whatsappClicks}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Doğrudan Mesaj Başlatma
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Telefon Aramaları
            </span>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">
              {loading ? '...' : phoneClicks}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Hemen Ara Butonu
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Phone className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              İletişim & Randevu Formu
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : formLeads}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Detaylı Hasta Talepleri
            </span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2 Analytics Tables: Campaigns & Top Landing Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Google Ads Campaign Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Google Ads Kampanya Performansı
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Hangi reklam kampanyanızın daha fazla hasta getirdiğini inceleyin
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.keys(campaignStats).length === 0 ? (
              <p className="py-4 text-slate-400">Henüz kampanya verisi yok.</p>
            ) : (
              Object.entries(campaignStats).map(([camp, count]) => (
                <div
                  key={camp}
                  className="py-2.5 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-800">{camp}</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    {count} Dönüşüm
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Converting Landing Pages */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              En Çok Hasta Getiren Sayfalar
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Kullanıcıların en çok iletişime geçtiği açılış sayfaları
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.keys(pageStats).length === 0 ? (
              <p className="py-4 text-slate-400">Henüz sayfa verisi yok.</p>
            ) : (
              Object.entries(pageStats).map(([page, count]) => (
                <div
                  key={page}
                  className="py-2.5 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-800 truncate max-w-xs">
                    {page}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {count} Tıklama
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Latest Leads / Click Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Son Gelen Hasta İletişim & Tıklama Kayıtları
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Kanal</th>
                <th className="py-3 px-4">Ad Soyad / İşlem</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Açılış Sayfası</th>
                <th className="py-3 px-4">Kampanya (UTM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.slice(0, 10).map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(l.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        l.conversionType === 'WhatsAppClick'
                          ? 'bg-emerald-50 text-emerald-700'
                          : l.conversionType === 'PhoneClick'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {l.conversionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {l.fullName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{l.phone}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {l.sourcePageSlug}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {l.utmCampaign || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

