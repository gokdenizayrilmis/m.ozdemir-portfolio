'use client';

import { useRef, useState } from 'react';
import { Bold, Code2, Eye, Heading2, Heading3, List, Pilcrow } from 'lucide-react';

interface HtmlContentEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export default function HtmlContentEditor({
  label,
  value,
  onChange,
  rows = 10,
  placeholder = 'İçerik metnini buraya yazın veya yukarıdaki araç çubuğundan başlık/liste ekleyin...',
}: HtmlContentEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertSnippet = (before: string, after: string, fallbackText: string) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(`${value}${value ? '\n' : ''}${before}${fallbackText}${after}`);
      return;
    }

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || fallbackText;
    const nextValue =
      value.slice(0, start) + before + selected + after + value.slice(end);

    onChange(nextValue);

    requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + before.length + selected.length;
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block font-semibold text-slate-700 text-xs">
          {label}
        </label>

        {/* Edit / Live Preview Switch */}
        <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
              mode === 'edit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Düzenle</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
              mode === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Canlı Önizleme</span>
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/50 transition">
          {/* Quick Formatting Toolbar */}
          <div className="px-2.5 py-1.5 bg-slate-100/80 border-b border-slate-200/80 flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertSnippet('<h2>', '</h2>\n', 'Ana Başlık')}
              title="H2 Ana Başlık Ekle"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Heading2 className="w-3.5 h-3.5 text-amber-700" />
              <span>H2</span>
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('<h3>', '</h3>\n', 'Alt Başlık')}
              title="H3 Alt Başlık Ekle"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Heading3 className="w-3.5 h-3.5 text-amber-700" />
              <span>H3</span>
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('<p>', '</p>\n', 'Paragraf metni...')}
              title="Paragraf Ekle"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Pilcrow className="w-3.5 h-3.5 text-slate-600" />
              <span>Paragraf</span>
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('<strong>', '</strong>', 'Vurgulu metin')}
              title="Kalın Metin"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Bold className="w-3.5 h-3.5 text-slate-600" />
              <span>Kalın</span>
            </button>
            <button
              type="button"
              onClick={() =>
                insertSnippet(
                  '<ul>\n  <li>',
                  '</li>\n  <li>İkinci madde</li>\n</ul>\n',
                  'Birinci madde'
                )
              }
              title="Madde Listesi Ekle"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <List className="w-3.5 h-3.5 text-slate-600" />
              <span>Liste</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-3 text-[13px] leading-relaxed text-slate-800 bg-transparent focus:outline-none resize-y"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 min-h-[220px] max-h-[380px] overflow-y-auto prose-medical text-sm">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="text-slate-400 italic text-xs">
              Önizlenecek içerik henüz eklenmedi.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
