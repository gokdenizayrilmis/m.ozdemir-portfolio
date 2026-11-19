'use client';

interface AdminPublishToggleProps {
  isPublished: boolean;
  disabled?: boolean;
  onToggle: () => void;
  itemLabel?: string;
}

export default function AdminPublishToggle({
  isPublished,
  disabled = false,
  onToggle,
  itemLabel,
}: AdminPublishToggleProps) {
  const title = isPublished
    ? 'Yayında (Gizlemek için tıklayın)'
    : 'Taslak (Yayınlamak için tıklayın)';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublished}
      aria-label={
        itemLabel ? `${itemLabel} yayın durumu: ${title}` : title
      }
      disabled={disabled}
      onClick={onToggle}
      title={title}
      className="inline-flex items-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          isPublished ? 'bg-emerald-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isPublished ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
      <span
        className={`text-[11px] font-semibold ${
          isPublished ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        {isPublished ? 'Yayında' : 'Taslak'}
      </span>
    </button>
  );
}
