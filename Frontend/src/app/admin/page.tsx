'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { m } from 'motion/react';
import { leadService } from '@/services';
import {
  HourlyClickStat,
  Lead,
  LeadRangeFilter,
  LeadsSummary,
} from '@/types';
import AnimatedCounter from '@/components/admin/AnimatedCounter';
import ConversionTrendChart from '@/components/admin/ConversionTrendChart';
import ChannelDistributionDonut from '@/components/admin/ChannelDistributionDonut';
import { useAdminToast } from '@/components/admin/AdminToast';
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
  Search,
  X,
  Sun,
  Moon,
  Flame,
  Filter,
} from 'lucide-react';

const RANGE_OPTIONS: { value: LeadRangeFilter; label: string }[] = [
  { value: 'today', label: 'Bugün' },
  { value: '7d', label: 'Son 7 Gün' },
  { value: '30d', label: 'Son 30 Gün' },
  { value: 'all', label: 'Tümü' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

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

function formatRelativeTimeTr(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return 'Az önce';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Az önce';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Dün';
  if (diffDays < 30) return `${diffDays} gün önce`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} ay önce`;

  return `${Math.floor(diffMonths / 12)} yıl önce`;
}

function buildFallbackHourlyDistribution(items: Lead[]): HourlyClickStat[] {
  const buckets: HourlyClickStat[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    whatsApp: 0,
    phone: 0,
    total: 0,
  }));

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const hour = d.getHours();
    const bucket = buckets[hour];
    if (!bucket) continue;

    if (item.conversionType === 'WhatsAppClick') {
      bucket.whatsApp += 1;
    } else if (item.conversionType === 'PhoneClick') {
      bucket.phone += 1;
    }
    bucket.total = bucket.whatsApp + bucket.phone;
  }

  return buckets;
}

function matchesLeadSearch(lead: Lead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const slug = (lead.sourcePageSlug || '/').trim().toLowerCase();
  const slugLabel = formatPageSlugLabel(lead.sourcePageSlug).label.toLowerCase();
  const campaign = (lead.utmCampaign || 'Organik / Doğrudan Ziyaret').toLowerCase();
  const source = (lead.utmSource || '').toLowerCase();

  return (
    slug.includes(q) ||
    slugLabel.includes(q) ||
    campaign.includes(q) ||
    source.includes(q)
  );
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
  const { showToast } = useAdminToast();
  const tableSectionRef = useRef<HTMLDivElement | null>(null);

  const [range, setRange] = useState<LeadRangeFilter>('30d');
  const [tableRange, setTableRange] = useState<LeadRangeFilter>('30d');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [hoveredHour, setHoveredHour] = useState<HourlyClickStat | null>(null);

  const [summary, setSummary] = useState<LeadsSummary>({
    totalClicks: 0,
    whatsAppClicks: 0,
    phoneClicks: 0,
    byCampaign: [],
    byPage: [],
    dailyTrend: [],
    hourlyDistribution: [],
    businessHoursClicks: 0,
    afterHoursClicks: 0,
    previousPeriod: null,
  });
  const [allTableLeads, setAllTableLeads] = useState<Lead[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadSummary = useCallback(async (selectedRange: LeadRangeFilter) => {
    setLoadingSummary(true);
    const data = await leadService.getSummary(selectedRange);
    setSummary(data);
    setLoadingSummary(false);
  }, []);

  const loadTableLeads = useCallback(
    async (selectedRange: LeadRangeFilter) => {
      setLoadingTable(true);
      const data = await leadService.getPagedLeads({
        range: selectedRange,
        page: 1,
        pageSize: 200,
      });
      setAllTableLeads(data.items);
      setLoadingTable(false);
    },
    []
  );

  useEffect(() => {
    loadSummary(range);
  }, [range, loadSummary]);

  useEffect(() => {
    loadTableLeads(tableRange);
  }, [tableRange, loadTableLeads]);

  const handleRangeChange = (newRange: LeadRangeFilter) => {
    setRange(newRange);
    setTableRange(newRange);
    setPage(1);
  };

  const handleTableRangeChange = (newTableRange: LeadRangeFilter) => {
    setTableRange(newTableRange);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleCardQuickFilter = (filterValue: string) => {
    if (
      searchInput.trim().toLowerCase() === filterValue.trim().toLowerCase()
    ) {
      setSearchInput('');
      setDebouncedSearch('');
    } else {
      setSearchInput(filterValue);
      setDebouncedSearch(filterValue);
      setPage(1);
      tableSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    const ok = await leadService.downloadCsv(tableRange);
    setExporting(false);
    if (ok) {
      showToast('CSV dönüşüm raporu indirildi.', 'success');
    } else {
      showToast('CSV raporu indirilirken bir hata oluştu.', 'error');
    }
  };

  const filteredTableLeads = useMemo(() => {
    if (!debouncedSearch) return allTableLeads;
    return allTableLeads.filter((item) =>
      matchesLeadSearch(item, debouncedSearch)
    );
  }, [allTableLeads, debouncedSearch]);

  const effectiveTotalCount = filteredTableLeads.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / pageSize));

  const displayedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTableLeads.slice(start, start + pageSize);
  }, [filteredTableLeads, page, pageSize]);

  // Hourly distribution computed dynamically from all filtered leads in the table section
  const hourlyStats = useMemo<HourlyClickStat[]>(() => {
    return buildFallbackHourlyDistribution(filteredTableLeads);
  }, [filteredTableLeads]);

  const {
    businessHoursClicks,
    afterHoursClicks,
    businessHoursPercent,
    afterHoursPercent,
    peakHourStat,
    maxHourTotal,
  } = useMemo(() => {
    const biz = hourlyStats
      .filter((h) => h.hour >= 9 && h.hour < 19)
      .reduce((acc, h) => acc + h.total, 0);

    const totalFromHourly = hourlyStats.reduce((acc, h) => acc + h.total, 0);
    const after = Math.max(0, totalFromHourly - biz);
    const bizPct =
      totalFromHourly > 0 ? Math.round((biz / totalFromHourly) * 100) : 0;
    const afterPct = totalFromHourly > 0 ? 100 - bizPct : 0;

    let peak: HourlyClickStat | null = null;
    for (const h of hourlyStats) {
      if (h.total > 0 && (!peak || h.total > peak.total)) {
        peak = h;
      }
    }

    const maxTotal = Math.max(1, ...hourlyStats.map((h) => h.total));

    return {
      businessHoursClicks: biz,
      afterHoursClicks: after,
      businessHoursPercent: bizPct,
      afterHoursPercent: afterPct,
      peakHourStat: peak,
      maxHourTotal: maxTotal,
    };
  }, [hourlyStats]);

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
      {/* Header + Sliding Pill Date Range Picker & CSV Export */}
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
          {/* 1. Sliding Pill Date Range Selector (layoutId) */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] text-xs">
            {RANGE_OPTIONS.map((opt) => {
              const isSelected = range === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRangeChange(opt.value)}
                  className={`relative px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    isSelected
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <m.div
                      layoutId="activeDateRange"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-lg bg-slate-900 shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
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
            <span>CSV İndir</span>
          </button>
        </div>
      </div>

      {/* 2. 3 Animated KPI Cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-slate-100 rounded-md" />
                  <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                </div>
                <div className="w-11 h-11 bg-slate-100 rounded-xl" />
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="h-5 w-36 bg-slate-100 rounded-md" />
                <div className="h-4 w-20 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* KPI 1: Total Conversions */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">
                  Toplam Hasta Dönüşümü
                </span>
                <h3 className="text-3xl font-heading font-bold tracking-tight text-slate-900 mt-1">
                  <AnimatedCounter value={summary.totalClicks} />
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <ChangeBadge
                changePercent={totalChange}
                showForAll={range === 'all'}
              />
              <span className="text-[11px] text-slate-400 font-medium">
                WhatsApp + Arama
              </span>
            </div>
          </m.div>

          {/* KPI 2: WhatsApp Clicks */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
          >
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
                <h3 className="text-3xl font-heading font-bold tracking-tight text-emerald-600 mt-1">
                  <AnimatedCounter value={summary.whatsAppClicks} />
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <MessageCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <ChangeBadge
                changePercent={waChange}
                showForAll={range === 'all'}
              />
              <span className="text-[11px] text-slate-400 font-medium">
                Mesaj &amp; Randevu
              </span>
            </div>
          </m.div>

          {/* KPI 3: Phone Calls */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
          >
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
                <h3 className="text-3xl font-heading font-bold tracking-tight text-indigo-600 mt-1">
                  <AnimatedCounter value={summary.phoneClicks} />
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <ChangeBadge
                changePercent={phoneChange}
                showForAll={range === 'all'}
              />
              <span className="text-[11px] text-slate-400 font-medium">
                Doğrudan Arama
              </span>
            </div>
          </m.div>
        </div>
      )}

      {/* 3. Dual Animated Chart Row (8 cols AreaChart + 4 cols Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <ConversionTrendChart
            data={summary.dailyTrend}
            loading={loadingSummary}
          />
        </div>
        <div className="lg:col-span-4">
          <ChannelDistributionDonut
            whatsAppClicks={summary.whatsAppClicks}
            phoneClicks={summary.phoneClicks}
            loading={loadingSummary}
          />
        </div>
      </div>

      {/* 4. Vercel Analytics-Style Click-to-Filter Progress Bar Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Ads Campaign Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
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
            (tabloyu filtrelemek için satıra tıklayın)
          </p>

          <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
            {loadingSummary ? (
              <div className="space-y-2 animate-pulse">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                ))}
              </div>
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
                const isSelected =
                  debouncedSearch.toLowerCase() ===
                  item.campaign.trim().toLowerCase();

                return (
                  <button
                    key={item.campaign}
                    type="button"
                    onClick={() => handleCardQuickFilter(item.campaign)}
                    className={`w-full text-left group relative overflow-hidden rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 transition ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 bg-indigo-500/10 rounded-r-lg"
                    />
                    <div className="relative z-10 flex items-center gap-2 min-w-0">
                      <span className="font-medium text-slate-800 truncate">
                        {item.campaign}
                      </span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-indigo-600 bg-white/90 px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                        {isSelected ? 'Filtreyi Kaldır' : 'Filtrele'}
                      </span>
                    </div>
                    <span className="relative z-10 shrink-0 font-bold tabular-nums text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Top Converting Landing Pages */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
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
            Kullanıcıların en çok iletişime geçtiği açılış sayfaları (tabloyu
            filtrelemek için satıra tıklayın)
          </p>

          <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
            {loadingSummary ? (
              <div className="space-y-2 animate-pulse">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                ))}
              </div>
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
                const filterKey =
                  item.pageSlug === '/' || !item.pageSlug
                    ? 'Ana Sayfa (/)'
                    : item.pageSlug;
                const isSelected =
                  debouncedSearch.toLowerCase() === filterKey.toLowerCase() ||
                  debouncedSearch.toLowerCase() ===
                    formatted.label.toLowerCase();

                return (
                  <div
                    key={item.pageSlug}
                    onClick={() => handleCardQuickFilter(filterKey)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardQuickFilter(filterKey);
                      }
                    }}
                    className={`cursor-pointer group relative overflow-hidden rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 transition ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-y-0 left-0 bg-emerald-500/10 rounded-r-lg"
                    />
                    <div className="relative z-10 flex items-center gap-2 min-w-0">
                      <span className="bg-white/90 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-md border border-slate-200/70 truncate">
                        {formatted.label}
                      </span>
                      <Link
                        href={formatted.href}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        title="Sayfayı yeni sekmede aç"
                        className="text-slate-400 hover:text-emerald-700 shrink-0 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                        {isSelected ? 'Filtreyi Kaldır' : 'Filtrele'}
                      </span>
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

      {/* 5. Conversion Logs Section with Hourly Intensity Mini-Chart, Search & Enhanced Table */}
      <div
        ref={tableSectionRef}
        className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5"
      >
        {/* Top Header: Title + Search Input + Sliding Channel Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Clock className="w-5 h-5 text-slate-700" />
            <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base tabular-nums">
              Dönüşüm &amp; Tıklama Kayıtları ({effectiveTotalCount})
            </h3>

            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-medium">
                <Filter className="w-3 h-3 text-amber-600" />
                <span>Filtre: &ldquo;{debouncedSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setDebouncedSearch('');
                  }}
                  title="Filtreyi temizle"
                  className="hover:text-amber-950 p-0.5 rounded-full hover:bg-amber-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Sayfa veya kampanya ara..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setDebouncedSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sliding Pill Date Range Filter Tabs (Bugün | Son 7 Gün | Son 30 Gün | Tümü) */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs">
              {RANGE_OPTIONS.map((opt) => {
                const isSelected = tableRange === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTableRangeChange(opt.value)}
                    className={`relative px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isSelected && (
                      <m.div
                        layoutId="activeTableDateRange"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        }}
                        className="absolute inset-0 rounded-lg bg-slate-900 shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hourly Click Intensity Mini Chart (Mesai İçi vs Mesai Dışı & 24-Hour Distribution) */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Saatlik Tıklama Yoğunluğu (00:00 – 23:00)
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  • Google Ads Teklif &amp; Mesai Analizi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hastaların günün hangi saatlerinde WhatsApp veya telefonla
                iletişime geçtiğini gösterir
              </p>
            </div>

            {/* Mesai İçi vs Mesai Dışı & Peak Hour Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-semibold tabular-nums">
                <Sun className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Mesai İçi (09–19): %{businessHoursPercent} (
                  {businessHoursClicks})
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-800 font-semibold tabular-nums">
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Mesai Dışı: %{afterHoursPercent} ({afterHoursClicks})
                </span>
              </div>

              {peakHourStat && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-800 font-semibold tabular-nums">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Zirve: {peakHourStat.label} ({peakHourStat.total} tıklama)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 24-Hour Mini Bar Chart */}
          <div className="pt-2">
            <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 items-end h-20 pt-4 px-1">
              {hourlyStats.map((stat) => {
                const isBusinessHour = stat.hour >= 9 && stat.hour < 19;
                const heightPercent =
                  stat.total > 0
                    ? Math.max(18, Math.round((stat.total / maxHourTotal) * 100))
                    : 8;
                const isHovered = hoveredHour?.hour === stat.hour;

                return (
                  <div
                    key={stat.hour}
                    onMouseEnter={() => setHoveredHour(stat)}
                    onMouseLeave={() => setHoveredHour(null)}
                    className="group relative flex flex-col items-center justify-end h-full cursor-pointer"
                  >
                    {/* Count label above non-zero bars */}
                    {stat.total > 0 && (
                      <span
                        className={`text-[9px] font-bold tabular-nums mb-0.5 transition-transform ${
                          isHovered
                            ? 'text-slate-900 scale-110'
                            : 'text-slate-500'
                        }`}
                      >
                        {stat.total}
                      </span>
                    )}

                    {/* Animated Bar */}
                    <m.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`w-full rounded-t-md transition-colors ${
                        stat.total === 0
                          ? 'bg-slate-200/70 group-hover:bg-slate-300'
                          : isBusinessHour
                            ? 'bg-emerald-500 group-hover:bg-emerald-600'
                            : 'bg-indigo-500 group-hover:bg-indigo-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Hour Labels */}
            <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 px-1 mt-1.5 border-t border-slate-200/60 pt-1.5">
              {hourlyStats.map((stat) => {
                const showLabel = stat.hour % 2 === 0;
                return (
                  <div key={stat.hour} className="text-center">
                    <span
                      className={`text-[9px] tabular-nums ${
                        showLabel
                          ? 'text-slate-500 font-medium'
                          : 'text-transparent sm:text-slate-400/70'
                      }`}
                    >
                      {String(stat.hour).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Interactive Hover Status Bar */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 min-h-[18px]">
              {hoveredHour ? (
                <div className="flex flex-wrap items-center gap-2 font-medium text-slate-700">
                  <span className="font-bold text-slate-900">
                    {hoveredHour.label} –{' '}
                    {String(hoveredHour.hour).padStart(2, '0')}:59
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      hoveredHour.hour >= 9 && hoveredHour.hour < 19
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {hoveredHour.hour >= 9 && hoveredHour.hour < 19
                      ? 'Mesai İçi'
                      : 'Mesai Dışı'}
                  </span>
                  <span>•</span>
                  <span>
                    Toplam: <strong>{hoveredHour.total}</strong> dönüşüm (
                    <span className="text-emerald-700 font-semibold">
                      {hoveredHour.whatsApp} WhatsApp
                    </span>
                    ,{' '}
                    <span className="text-indigo-700 font-semibold">
                      {hoveredHour.phone} Telefon
                    </span>
                    )
                  </span>
                </div>
              ) : (
                <span>
                  Saatlik detayı görmek için çubukların üzerine gelin (Yeşil:
                  09:00–19:00 Mesai İçi, İndigo: Mesai Dışı)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
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
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-36 bg-slate-100 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-20 bg-slate-100 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-44 bg-slate-100 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-28 bg-slate-100 rounded-md" />
                    </td>
                  </tr>
                ))
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Seçili filtreye uygun dönüşüm kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                displayedItems.map((l) => {
                  const isWhatsApp = l.conversionType === 'WhatsAppClick';
                  const formattedSlug = formatPageSlugLabel(l.sourcePageSlug);
                  const relativeTime = formatRelativeTimeTr(l.createdAt);
                  const exactTime = new Date(l.createdAt).toLocaleString(
                    'tr-TR'
                  );

                  return (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Relative Time + Exact Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {relativeTime}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 tabular-nums">
                            {exactTime}
                          </span>
                        </div>
                      </td>

                      {/* Channel Badge */}
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

                      {/* Landing Page (Clean Sans-Serif Pill Badge, no font-mono) */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardQuickFilter(
                                l.sourcePageSlug === '/' || !l.sourcePageSlug
                                  ? 'Ana Sayfa (/)'
                                  : l.sourcePageSlug
                              )
                            }
                            title="Bu sayfaya göre filtrele"
                            className="bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200/60 transition"
                          >
                            {formattedSlug.label}
                          </button>
                          <Link
                            href={formattedSlug.href}
                            target="_blank"
                            title="Sayfayı yeni sekmede aç"
                            className="text-slate-400 hover:text-slate-700 transition p-1 rounded hover:bg-slate-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>

                      {/* UTM Campaign */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {l.utmCampaign ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCardQuickFilter(l.utmCampaign!)
                            }
                            title="Bu kampanyaya göre filtrele"
                            className="font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/60 px-2.5 py-1 rounded-md transition"
                          >
                            {l.utmCampaign}
                          </button>
                        ) : (
                          <span className="text-slate-400 font-medium">
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

        {/* Pagination Footer with 10 / 25 / 50 Page Size Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 tabular-nums">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Sayfa <strong>{page}</strong> / <strong>{totalPages}</strong>{' '}
              (Toplam {effectiveTotalCount} kayıt)
            </span>

            <div className="inline-flex items-center gap-1.5">
              <span className="text-slate-400">Sayfa başına:</span>
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg">
                {PAGE_SIZE_OPTIONS.map((size) => {
                  const active = pageSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePageSizeChange(size)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                        active
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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
