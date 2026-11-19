'use client';

export type AdminStatusFilter = 'all' | 'published' | 'draft';

interface AdminStatusPillsProps {
  value: AdminStatusFilter;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  onChange: (value: AdminStatusFilter) => void;
  className?: string;
}

export default function AdminStatusPills({
  value,
  totalCount,
  publishedCount,
  draftCount,
  onChange,
  className = '',
}: AdminStatusPillsProps) {
  return (
    <div
      className={`inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs tabular-nums ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`px-3 py-1.5 rounded-lg font-semibold transition ${
          value === 'all'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Tümü ({totalCount})
      </button>
      <button
        type="button"
        onClick={() => onChange('published')}
        className={`px-3 py-1.5 rounded-lg font-semibold transition ${
          value === 'published'
            ? 'bg-white text-emerald-700 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Yayında ({publishedCount})
      </button>
      <button
        type="button"
        onClick={() => onChange('draft')}
        className={`px-3 py-1.5 rounded-lg font-semibold transition ${
          value === 'draft'
            ? 'bg-white text-slate-800 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Taslak ({draftCount})
      </button>
    </div>
  );
}
