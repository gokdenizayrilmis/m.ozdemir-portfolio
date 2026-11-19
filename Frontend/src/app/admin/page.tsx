'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { leadService } from '@/services';
import {
  LeadRangeFilter,
  LeadsSummary,
  PagedLeadsResponse,
} from '@/types';
import ConversionTrendChart from '@/components/admin/ConversionTrendChart';
import {
  MessageCircle,
  Phone,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Layers,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
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

function formatPageSlugLabel(slug?: string): {
  label: string;
  href: string;
} {
  const clean = (slug || '/').trim();
  if (!clean || clean === '/') {
    return { label: 'Ana Sayfa (/)', href: '/' };
  }
  const href = clean.startsWith('/') ? clean : `/${clean}`;
  return { label: href, href };
}

function ChangeBadge({
  changePercent,
  showForAll = false,
}: {
  changePercent?: number | null;
  showForAll?: boolean;
}) {
  if (showForAll || changePercent === undefined || changePercent === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium tabular-nums">
        <Minus className="w-3 h-3" />
        <span>Tüm Zamanlar</span>
      </span>
    );
  }

  if (changePercent > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold tabular-nums">
        <TrendingUp className="w-3 h-3" />
        <span>+{changePercent}% önceki döneme göre</span>
      </span>
    );
  }

  if (changePercent < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold tabular-nums">
        <TrendingDown className="w-3 h-3" />
        <span>{changePercent}% önceki döneme göre</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium tabular-nums">
      <Minus className="w-3 h-3" />
      <span>0% önceki döneme göre</span>
    </span>
  );
}

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
    dailyTrend: [],
    previousPeriod: null,
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

  const totalPages = Math.max(1, Math.ceil(pagedLeads.totalCount / PAGE_SIZE));

  const waSharePercent =
    summary.totalClicks > 0
      ? Math.round((summary.whatsAppClicks / summary.totalClicks) * 100)
      : 0;
  const phoneSharePercent =
    summary.totalClicks > 0 ? 100 - waSharePercent : 0;

  const totalChange =
    summary.totalChangePercent ?? summary.previousPeriod?.totalChangePercent;
  const waChange =
    summary.whatsAppChangePercent ??
    summary.previousPeriod?.whatsAppChangePercent;
  const phoneChange =
    summary.phoneChangePercent ?? summary.previousPeriod?.phoneChangePercent;

  const maxCampaignCount = Math.max(
    1,
    ...summary.byCampaign.map((c) => c.count)
  );
  const maxPageCount = Math.max(1, ...summary.byPage.map((p) => p.count));

  return (
    <div className="space-y-6">
      {/* Header + Date Range Picker & CSV Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
            Google Ads &amp; Klinik Dönüşüm Kokpiti
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-slate-900 mt-1">
            Dönüşüm &amp; Hasta Trafik Raporu
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Google Ads ve organik trafiğin getirdiği WhatsApp ve telefon
            dönüşümlerinin anlık performansı
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs text-xs">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRangeChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  range === opt.value
                    ? 'bg-slate-900 text-white shadow-xs'
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition"
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

      {/* 1. Enriched 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Conversions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">
                Toplam Hasta Dönüşümü
              </span>
              <h3 className="text-3xl font-heading font-bold tracking-tight tabular-nums text-slate-900 mt-1">
                {loadingSummary ? '...' : summary.totalClicks}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <ChangeBadge
              changePercent={totalChange}
              showForAll={range === 'all'}
            />
            <span className="text-[11px] text-slate-400 font-medium">
              WhatsApp + Arama
            </span>
          </div>
        </div>

        {/* WhatsApp Clicks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  WhatsApp Tıklamaları
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold tabular-nums">
                  %{waSharePercent} Pay
                </span>
              </div>
              <h3 className="text-3xl font-heading font-bold tracking-tight tabular-nums text-emerald-600 mt-1">
                {loadingSummary ? '...' : summary.whatsAppClicks}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <ChangeBadge
              changePercent={waChange}
              showForAll={range === 'all'}
            />
            <span className="text-[11px] text-slate-400 font-medium">
              Mesaj &amp; Randevu
            </span>
          </div>
        </div>

        {/* Phone Calls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Telefon Aramaları
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold tabular-nums">
                  %{phoneSharePercent} Pay
                </span>
              </div>
              <h3 className="text-3xl font-heading font-bold tracking-tight tabular-nums text-indigo-600 mt-1">
                {loadingSummary ? '...' : summary.phoneClicks}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <ChangeBadge
              changePercent={phoneChange}
              showForAll={range === 'all'}
            />
            <span className="text-[11px] text-slate-400 font-medium">
              Doğrudan Arama
            </span>
          </div>
        </div>
      </div>

      {/* 2. Daily Conversion Trend Area Chart */}
      <ConversionTrendChart
        data={summary.dailyTrend}
        loading={loadingSummary}
      />

      {/* 3. Vercel Analytics-Style Progress Bar Lists: Campaigns & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Ads Campaign Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
                Google Ads Kampanya Performansı
              </h3>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Dönüşüm
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Hangi reklam kampanyanızın daha fazla hasta getirdiğini inceleyin
          </p>

          <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
            {loadingSummary ? (
              <p className="py-4 text-slate-400">Yükleniyor...</p>
            ) : summary.byCampaign.length === 0 ? (
              <p className="py-4 text-slate-400">
                Seçili tarih aralığında kampanya verisi yok.
              </p>
            ) : (
              summary.byCampaign.map((item) => {
                const widthPercent = Math.max(
                  6,
                  Math.round((item.count / maxCampaignCount) * 100)
                );
                return (
                  <div
                    key={item.campaign}
                    className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 flex items-center justify-between gap-3"
                  >
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className="absolute inset-y-0 left-0 bg-amber-500/12 rounded-r-lg transition-all duration-500"
                    />
                    <span className="relative z-10 font-medium text-slate-800 truncate">
                      {item.campaign}
                    </span>
                    <span className="relative z-10 shrink-0 font-bold tabular-nums text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Converting Landing Pages */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
                En Çok Hasta Getiren Sayfalar
              </h3>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tıklama
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kullanıcıların en çok iletişime geçtiği açılış sayfaları
          </p>

          <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
            {loadingSummary ? (
              <p className="py-4 text-slate-400">Yükleniyor...</p>
            ) : summary.byPage.length === 0 ? (
              <p className="py-4 text-slate-400">
                Seçili tarih aralığında sayfa verisi yok.
              </p>
            ) : (
              summary.byPage.map((item) => {
                const widthPercent = Math.max(
                  6,
                  Math.round((item.count / maxPageCount) * 100)
                );
                const formatted = formatPageSlugLabel(item.pageSlug);
                return (
                  <div
                    key={item.pageSlug}
                    className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 flex items-center justify-between gap-3"
                  >
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className="absolute inset-y-0 left-0 bg-emerald-500/12 rounded-r-lg transition-all duration-500"
                    />
                    <div className="relative z-10 flex items-center gap-1.5 min-w-0">
                      <span className="font-mono font-medium text-slate-800 truncate">
                        {formatted.label}
                      </span>
                      <Link
                        href={formatted.href}
                        target="_blank"
                        title="Sayfayı yeni sekmede aç"
                        className="text-slate-400 hover:text-emerald-700 shrink-0 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <span className="relative z-10 shrink-0 font-bold tabular-nums text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Conversion Logs Table with Channel Filter & Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base tabular-nums">
              Dönüşüm &amp; Tıklama Kayıtları ({pagedLeads.totalCount})
            </h3>
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
                    ? 'bg-white text-slate-900 shadow-xs'
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
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200/70">
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
                  const formattedSlug = formatPageSlugLabel(l.sourcePageSlug);
                  return (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap tabular-nums">
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
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-mono text-slate-800">
                          <span>{formattedSlug.label}</span>
                          <Link
                            href={formattedSlug.href}
                            target="_blank"
                            title="Sayfayı yeni sekmede aç"
                            className="text-slate-400 hover:text-slate-700 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
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
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 tabular-nums">
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
