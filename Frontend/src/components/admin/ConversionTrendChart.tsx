'use client';

import { useState } from 'react';
import { m } from 'motion/react';
import { DailyTrendPoint } from '@/types';
import { BarChart3 } from 'lucide-react';

interface ConversionTrendChartProps {
  data: DailyTrendPoint[];
  loading?: boolean;
}

export default function ConversionTrendChart({
  data,
  loading = false,
}: ConversionTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-6 space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-44 bg-slate-200 rounded-md" />
            <div className="h-3 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="h-4 w-16 bg-slate-100 rounded-md" />
            <div className="h-4 w-20 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="h-64 sm:h-72 rounded-xl bg-slate-50 border border-slate-100 flex items-end justify-between px-6 pb-6 pt-12 gap-3">
          {[35, 58, 42, 74, 62, 85, 50, 68, 90, 60].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="flex-1 bg-slate-200/70 rounded-t-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  const points =
    data && data.length > 0
      ? data
      : [{ date: '-', label: '-', whatsApp: 0, phone: 0, total: 0 }];

  const width = 920;
  const height = 260;
  const padLeft = 36;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxValue = Math.max(
    4,
    ...points.map((p) => Math.max(p.whatsApp, p.phone, p.total))
  );
  const yStep = Math.ceil(maxValue / 4);
  const yMax = yStep * 4;
  const yTicks = [0, yStep, yStep * 2, yStep * 3, yMax];

  const getX = (idx: number) => {
    if (points.length <= 1) return padLeft + plotW / 2;
    return padLeft + (idx / (points.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    const ratio = yMax > 0 ? val / yMax : 0;
    return padTop + plotH - ratio * plotH;
  };

  const buildSmoothPath = (values: number[]) => {
    if (values.length === 0) return '';
    if (values.length === 1) {
      const x = getX(0);
      const y = getY(values[0]);
      return `M ${padLeft} ${y} L ${x} ${y} L ${padLeft + plotW} ${y}`;
    }

    return values.reduce((acc, val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) return `M ${x} ${y}`;
      const prevX = getX(i - 1);
      const prevY = getY(values[i - 1]);
      const cpX1 = prevX + (x - prevX) / 2.5;
      const cpX2 = x - (x - prevX) / 2.5;
      return `${acc} C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
    }, '');
  };

  const buildAreaPath = (values: number[]) => {
    const linePath = buildSmoothPath(values);
    if (!linePath) return '';
    const firstX = points.length <= 1 ? padLeft : getX(0);
    const lastX = points.length <= 1 ? padLeft + plotW : getX(values.length - 1);
    const baseY = padTop + plotH;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const waValues = points.map((p) => p.whatsApp);
  const phoneValues = points.map((p) => p.phone);

  const waLine = buildSmoothPath(waValues);
  const waArea = buildAreaPath(waValues);
  const phoneLine = buildSmoothPath(phoneValues);
  const phoneArea = buildAreaPath(phoneValues);

  // Choose ~7 evenly spaced X-axis labels
  const labelStride = Math.max(1, Math.ceil(points.length / 8));
  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold tracking-tight text-slate-900 text-base">
              Günlük Dönüşüm Trendi
            </h3>
            <p className="text-xs text-slate-500">
              Seçili zaman aralığında WhatsApp ve Telefon tıklamalarının
              zamansal dağılımı
            </p>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>WhatsApp</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Telefon Araması</span>
          </span>
        </div>
      </div>

      {/* Responsive SVG Area Chart */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 sm:h-72 overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="waAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="phoneAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Dashed Grid Lines + Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotW}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-medium tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <m.path
            d={waArea}
            fill="url(#waAreaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
          />
          <m.path
            d={phoneArea}
            fill="url(#phoneAreaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          />

          {/* Smooth Line Strokes */}
          <m.path
            d={waLine}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <m.path
            d={phoneLine}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* X-Axis Labels */}
          {points.map((pt, i) => {
            const shouldShow =
              i % labelStride === 0 || i === points.length - 1;
            if (!shouldShow) return null;
            const x = getX(i);
            return (
              <text
                key={pt.date}
                x={x}
                y={padTop + plotH + 22}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-medium tabular-nums"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Hover Vertical Crosshair + Active Dots */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padTop}
                x2={getX(hoverIndex)}
                y2={padTop + plotH}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(points[hoverIndex].whatsApp)}
                r="4.5"
                className="fill-emerald-500 stroke-white stroke-2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(points[hoverIndex].phone)}
                r="4.5"
                className="fill-indigo-500 stroke-white stroke-2"
              />
            </g>
          )}

          {/* Invisible Interactive Hover Columns */}
          {points.map((pt, i) => {
            const colWidth = plotW / Math.max(1, points.length);
            const x = getX(i) - colWidth / 2;
            return (
              <rect
                key={pt.date}
                x={Math.max(padLeft, x)}
                y={padTop}
                width={colWidth}
                height={plotH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activePoint && hoverIndex !== null && (
          <div
            style={{
              left: `${Math.min(
                82,
                Math.max(6, (hoverIndex / Math.max(1, points.length - 1)) * 100)
              )}%`,
            }}
            className="pointer-events-none absolute top-2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md text-slate-900 rounded-xl px-3.5 py-2.5 shadow-lg border border-slate-200/90 text-xs min-w-[165px] space-y-1.5"
          >
            <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between gap-3">
              <span>{activePoint.label}</span>
              <span className="text-[11px] text-slate-600 font-bold tabular-nums">
                Toplam: {activePoint.total}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                WhatsApp
              </span>
              <strong className="tabular-nums text-slate-900">
                {activePoint.whatsApp}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Telefon
              </span>
              <strong className="tabular-nums text-slate-900">
                {activePoint.phone}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
