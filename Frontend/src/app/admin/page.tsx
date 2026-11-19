'use client';

import { useCallback, useEffect, useState } from 'react';
import { leadService } from '@/services';
import {
  LeadRangeFilter,
  LeadsSummary,
  PagedLeadsResponse,
} from '@/types';
import {
  MessageCircle,
  Phone,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const RANGE_OPTIONS: { value: LeadRangeFilter; label: string }[] = [
  { value: 'today', label: 'Bugün' },
  { value: '7d', label: 'Son 7 Gün' },
  { value: '30d', label: 'Son 30 Gün' },
  { value: 'month', label: 'Bu Ay' },
  { value: 'all', label: 'Tümü' },
];

const CHANNEL_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'WhatsAppClick', label: 'WhatsApp' },
  { value: 'PhoneClick', label: 'Arama' },
];

const PAGE_SIZE = 25;

export default function AdminOverviewDashboard() {
  const [range, setRange] = useState<LeadRangeFilter>('30d');
  const [channelType, setChannelType] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  const [summary, setSummary] = useState<LeadsSummary>({
    totalClicks: 0,
    whatsAppClicks: 0,
    phoneClicks: 0,
    byCampaign: [],
    byPage: [],
  });
  const [pagedLeads, setPagedLeads] = useState<PagedLeadsResponse>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadSummary = useCallback(async (selectedRange: LeadRangeFilter) => {
    setLoadingSummary(true);
    const data = await leadService.getSummary(selectedRange);
    setSummary(data);
    setLoadingSummary(false);
  }, []);

  const loadPagedLeads = useCallback(
    async (
      selectedRange: LeadRangeFilter,
      selectedType: string,
      selectedPage: number
    ) => {
      setLoadingTable(true);
      const data = await leadService.getPagedLeads({
        range: selectedRange,
        type: selectedType,
        page: selectedPage,
        pageSize: PAGE_SIZE,
      });
      setPagedLeads(data);
      setLoadingTable(false);
    },
    []
  );

  useEffect(() => {
    loadSummary(range);
  }, [range, loadSummary]);

  useEffect(() => {
    loadPagedLeads(range, channelType, page);
  }, [range, channelType, page, loadPagedLeads]);

  const handleRangeChange = (newRange: LeadRangeFilter) => {
    setRange(newRange);
    setPage(1);
  };

  const handleChannelChange = (newChannel: string) => {
    setChannelType(newChannel);
    setPage(1);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    const ok = await leadService.downloadCsv(range, channelType);
    setExporting(false);
    if (!ok) {
      alert('CSV raporu indirilirken bir hata oluştu.');
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(pagedLeads.totalCount / PAGE_SIZE)
  );

  return (
    <div className="space-y-8">
      {/* Header + Date Range Picker & CSV Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Google Ads &amp; Klinik Dönüşüm Kokpiti
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Dönüşüm &amp; Hasta Trafik Raporu
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Google Ads ve organik trafiğin getirdiği WhatsApp ve telefon
            dönüşümlerinin anlık performansı
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRangeChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  range === opt.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>CSV İndir (Excel Raporu)</span>
          </button>
        </div>
      </div>

      {/* 3 Balanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Toplam Hasta Dönüşümü
            </span>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {loadingSummary ? '...' : summary.totalClicks}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3 h-3" />
              WhatsApp &amp; Telefon Kanalları
            </span>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              WhatsApp Tıklamaları
            </span>
            <h3 className="text-3xl font-bold text-emerald-600 mt-1">
              {loadingSummary ? '...' : summary.whatsAppClicks}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              Doğrudan Randevu &amp; Mesaj Başlatma
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Telefon Aramaları
            </span>
            <h3 className="text-3xl font-bold text-indigo-600 mt-1">
              {loadingSummary ? '...' : summary.phoneClicks}
            </h3>
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              Bizi Arayın / Kliniği Arayın Butonu
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Phone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2 Analytics Cards: Campaigns & Top Landing Pages */}
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

          <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
            {loadingSummary ? (
              <p className="py-4 text-slate-400">Yükleniyor...</p>
            ) : summary.byCampaign.length === 0 ? (
              <p className="py-4 text-slate-400">
                Seçili tarih aralığında kampanya verisi yok.
              </p>
            ) : (
              summary.byCampaign.map((item) => (
                <div
                  key={item.campaign}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <span className="font-medium text-slate-800 truncate">
                    {item.campaign}
                  </span>
                  <span className="shrink-0 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    {item.count} Dönüşüm
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

          <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
            {loadingSummary ? (
              <p className="py-4 text-slate-400">Yükleniyor...</p>
            ) : summary.byPage.length === 0 ? (
              <p className="py-4 text-slate-400">
                Seçili tarih aralığında sayfa verisi yok.
              </p>
            ) : (
              summary.byPage.map((item) => (
                <div
                  key={item.pageSlug}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <span className="font-mono font-medium text-slate-800 truncate max-w-xs">
                    {item.pageSlug}
                  </span>
                  <span className="shrink-0 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {item.count} Tıklama
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Conversion Logs Table with Channel Filter & Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Dönüşüm &amp; Tıklama Kayıtları ({pagedLeads.totalCount})
              </h3>
            </div>
          </div>

          {/* Channel Filter Tabs */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            {CHANNEL_FILTERS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => handleChannelChange(ch.value)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  channelType === ch.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Kanal</th>
                <th className="py-3 px-4">Açılış Sayfası (Slug)</th>
                <th className="py-3 px-4">Kampanya (UTM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingTable ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Kayıtlar yükleniyor...
                  </td>
                </tr>
              ) : pagedLeads.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Seçili filtreye uygun dönüşüm kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                pagedLeads.items.map((l) => {
                  const isWhatsApp = l.conversionType === 'WhatsAppClick';
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                            isWhatsApp
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {isWhatsApp ? (
                            <>
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </>
                          ) : (
                            <>
                              <Phone className="w-3.5 h-3.5" />
                              <span>Telefon</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800">
                        {l.sourcePageSlug || '/'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {l.utmCampaign ? (
                          <span className="font-medium text-slate-800">
                            {l.utmCampaign}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Organik / Doğrudan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Sayfa <strong>{pagedLeads.page}</strong> /{' '}
            <strong>{totalPages}</strong> (Toplam {pagedLeads.totalCount} kayıt)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loadingTable}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold text-slate-700 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Önceki</span>
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loadingTable}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold text-slate-700 transition"
            >
              <span>Sonraki</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
