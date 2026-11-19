'use client';

import { useState } from 'react';
import { m } from 'motion/react';
import AnimatedCounter from '@/components/admin/AnimatedCounter';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ChannelDistributionDonutProps {
  whatsAppClicks: number;
  phoneClicks: number;
  loading?: boolean;
}

export default function ChannelDistributionDonut({
  whatsAppClicks,
  phoneClicks,
  loading = false,
}: ChannelDistributionDonutProps) {
  const [hovered, setHovered] = useState<'whatsapp' | 'phone' | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-6 flex flex-col justify-between h-full animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-200 rounded-md" />
          <div className="h-3 w-48 bg-slate-100 rounded-md" />
        </div>
        <div className="my-6 flex items-center justify-center">
          <div className="w-44 h-44 rounded-full border-[18px] border-slate-100" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const total = whatsAppClicks + phoneClicks;
  const waPercent = total > 0 ? Math.round((whatsAppClicks / total) * 100) : 0;
  const phonePercent = total > 0 ? 100 - waPercent : 0;

  // Donut geometry matching innerRadius=62 outerRadius=88
  const radius = 75;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  const gapPx = total > 0 && whatsAppClicks > 0 && phoneClicks > 0 ? 6 : 0;

  const waLength =
    total > 0 ? Math.max(0, (whatsAppClicks / total) * circumference - gapPx) : 0;
  const phoneLength =
    total > 0 ? Math.max(0, (phoneClicks / total) * circumference - gapPx) : 0;

  const phoneOffset = -(waLength + gapPx);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-6 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
          <PieChartIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
            Kanal Dağılımı
          </h3>
          <p className="text-xs text-slate-500">WhatsApp vs. Telefon oranı</p>
        </div>
      </div>

      {/* Animated Donut Chart */}
      <div className="relative my-5 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48 -rotate-90">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* WhatsApp Slice (#10b981) */}
          {total > 0 && whatsAppClicks > 0 && (
            <m.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth={hovered === 'whatsapp' ? strokeWidth + 3 : strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${waLength} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHovered('whatsapp')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-[stroke-width] duration-200"
            />
          )}

          {/* Phone Slice (#6366f1) */}
          {total > 0 && phoneClicks > 0 && (
            <m.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#6366f1"
              strokeWidth={hovered === 'phone' ? strokeWidth + 3 : strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${phoneLength} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: phoneOffset }}
              transition={{
                duration: 0.65,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              onMouseEnter={() => setHovered('phone')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-[stroke-width] duration-200"
            />
          )}
        </svg>

        {/* Center Total Display */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium text-slate-400">
            {hovered === 'whatsapp'
              ? 'WhatsApp'
              : hovered === 'phone'
                ? 'Telefon'
                : 'Toplam'}
          </span>
          <span className="text-3xl font-heading font-bold tracking-tight text-slate-900 leading-none mt-1">
            <AnimatedCounter
              value={
                hovered === 'whatsapp'
                  ? whatsAppClicks
                  : hovered === 'phone'
                    ? phoneClicks
                    : total
              }
            />
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 tabular-nums">
            {hovered === 'whatsapp'
              ? `%${waPercent} Pay`
              : hovered === 'phone'
                ? `%${phonePercent} Pay`
                : 'Dönüşüm'}
          </span>
        </div>
      </div>

      {/* Colored Legend Footer */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div
          onMouseEnter={() => setHovered('whatsapp')}
          onMouseLeave={() => setHovered(null)}
          className="rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-200/80 px-3 py-2.5 flex items-center justify-between gap-2 transition cursor-default"
        >
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            WhatsApp
          </span>
          <strong className="font-bold text-emerald-700 tabular-nums">
            %{waPercent}
          </strong>
        </div>

        <div
          onMouseEnter={() => setHovered('phone')}
          onMouseLeave={() => setHovered(null)}
          className="rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200/80 px-3 py-2.5 flex items-center justify-between gap-2 transition cursor-default"
        >
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            Telefon
          </span>
          <strong className="font-bold text-indigo-700 tabular-nums">
            %{phonePercent}
          </strong>
        </div>
      </div>
    </div>
  );
}
