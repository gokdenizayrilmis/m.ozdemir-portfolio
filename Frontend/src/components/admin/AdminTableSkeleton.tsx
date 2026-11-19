'use client';

interface AdminTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function AdminTableSkeleton({
  rows = 5,
  columns = 5,
}: AdminTableSkeletonProps) {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center justify-between gap-4 px-2 py-2 border-b border-slate-100 last:border-0"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
            <div className="h-3.5 w-48 bg-slate-200 rounded-md" />
          </div>
          {columns >= 4 && (
            <div className="h-3.5 w-32 bg-slate-100 rounded-md hidden sm:block" />
          )}
          {columns >= 5 && (
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
          )}
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
          <div className="h-6 w-20 bg-slate-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
