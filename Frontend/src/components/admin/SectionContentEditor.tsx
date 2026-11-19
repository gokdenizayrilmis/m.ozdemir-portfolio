'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FileEdit,
  ListChecks,
  Plus,
  Trash2,
} from 'lucide-react';

interface ContentSection {
  id: string;
  level: 'h2' | 'h3';
  heading: string;
  body: string;
  bullets: string;
}

interface SectionContentEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
}

function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseHtmlToSections(html: string): ContentSection[] {
  const trimmed = (html || '').trim();
  if (!trimmed) {
    return [
      {
        id: createId(),
        level: 'h2',
        heading: '',
        body: '',
        bullets: '',
      },
    ];
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return [
      {
        id: createId(),
        level: 'h2',
        heading: '',
        body: trimmed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        bullets: '',
      },
    ];
  }

  const doc = new DOMParser().parseFromString(trimmed, 'text/html');
  const sections: ContentSection[] = [];
  let current: ContentSection | null = null;

  const ensureSection = (level: 'h2' | 'h3' = 'h2', heading = '') => {
    const sec: ContentSection = {
      id: createId(),
      level,
      heading,
      body: '',
      bullets: '',
    };
    sections.push(sec);
    current = sec;
  };

  Array.from(doc.body.children).forEach((el) => {
    const tag = el.tagName.toUpperCase();

    if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
      const headingText = (el.textContent || '').trim();
      ensureSection(tag === 'H3' ? 'h3' : 'h2', headingText);
    } else if (tag === 'P') {
      const pText = (el.textContent || '').trim();
      if (!pText) return;
      if (!current) ensureSection('h2', '');
      current!.body = current!.body ? `${current!.body}\n\n${pText}` : pText;
    } else if (tag === 'UL' || tag === 'OL') {
      const items = Array.from(el.querySelectorAll('li'))
        .map((li) => (li.textContent || '').trim())
        .filter(Boolean);
      if (items.length === 0) return;
      if (!current) ensureSection('h2', '');
      const joined = items.join('\n');
      current!.bullets = current!.bullets
        ? `${current!.bullets}\n${joined}`
        : joined;
    } else {
      const fallbackText = (el.textContent || '').trim();
      if (!fallbackText) return;
      if (!current) ensureSection('h2', '');
      current!.body = current!.body
        ? `${current!.body}\n\n${fallbackText}`
        : fallbackText;
    }
  });

  if (sections.length === 0) {
    const plain = (doc.body.textContent || '').trim();
    return [
      {
        id: createId(),
        level: 'h2',
        heading: '',
        body: plain,
        bullets: '',
      },
    ];
  }

  return sections;
}

function serializeSectionsToHtml(sections: ContentSection[]): string {
  const parts: string[] = [];

  sections.forEach((sec) => {
    const heading = sec.heading.trim();
    if (heading) {
      parts.push(`<${sec.level}>${escapeHtml(heading)}</${sec.level}>`);
    }

    const paragraphs = sec.body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    paragraphs.forEach((p) => {
      parts.push(`<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`);
    });

    const bulletLines = sec.bullets
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    if (bulletLines.length > 0) {
      const lis = bulletLines
        .map((line) => `  <li>${escapeHtml(line)}</li>`)
        .join('\n');
      parts.push(`<ul>\n${lis}\n</ul>`);
    }
  });

  return parts.join('\n');
}

export default function SectionContentEditor({
  label,
  value,
  onChange,
}: SectionContentEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const lastSerializedRef = useRef<string>(value);
  const [sections, setSections] = useState<ContentSection[]>(() =>
    parseHtmlToSections(value)
  );

  useEffect(() => {
    if (value !== lastSerializedRef.current) {
      lastSerializedRef.current = value;
      setSections(parseHtmlToSections(value));
    }
  }, [value]);

  const commitSections = (next: ContentSection[]) => {
    setSections(next);
    const html = serializeSectionsToHtml(next);
    lastSerializedRef.current = html;
    onChange(html);
  };

  const handleUpdate = (
    id: string,
    field: keyof Omit<ContentSection, 'id'>,
    val: string
  ) => {
    commitSections(
      sections.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleAddSection = () => {
    commitSections([
      ...sections,
      {
        id: createId(),
        level: 'h2',
        heading: '',
        body: '',
        bullets: '',
      },
    ]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) {
      commitSections([
        {
          id: createId(),
          level: 'h2',
          heading: '',
          body: '',
          bullets: '',
        },
      ]);
      return;
    }
    commitSections(sections.filter((s) => s.id !== id));
  };

  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    commitSections(next);
  };

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block font-semibold text-slate-700 text-xs">
            {label}
          </label>
          <p className="text-[11px] text-slate-500">
            İçeriği bölüm başlıkları, paragraflar ve maddeler halinde kolayca
            düzenleyin
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              <FileEdit className="w-3.5 h-3.5" />
              <span>Bölümler</span>
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

          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Bölüm Ekle</span>
            </button>
          )}
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="space-y-3.5">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3"
            >
              {/* Section Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 text-[11px] font-bold tabular-nums">
                    Bölüm #{idx + 1}
                  </span>
                  <select
                    value={section.level}
                    onChange={(e) =>
                      handleUpdate(
                        section.id,
                        'level',
                        e.target.value as 'h2' | 'h3'
                      )
                    }
                    className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="h2">Ana Başlık</option>
                    <option value="h3">Alt Başlık</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, -1)}
                    title="Yukarı Taşı"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMoveSection(idx, 1)}
                    title="Aşağı Taşı"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    title="Bölümü Sil"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Heading Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bölüm Başlığı
                </label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) =>
                    handleUpdate(section.id, 'heading', e.target.value)
                  }
                  placeholder="Örn: Tedavi Nasıl Uygulanır?"
                  className="w-full px-3.5 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Body Paragraphs */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  İçerik Metni
                </label>
                <textarea
                  rows={3}
                  value={section.body}
                  onChange={(e) =>
                    handleUpdate(section.id, 'body', e.target.value)
                  }
                  placeholder="Bu bölümde yer alacak açıklamayı yazın. Yeni paragraf için bir satır boşluk bırakabilirsiniz..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
                />
              </div>

              {/* Optional Bullet List */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1">
                  <ListChecks className="w-3.5 h-3.5 text-amber-700" />
                  <span>Maddeler (İsteğe Bağlı — Her satıra bir madde)</span>
                </label>
                <textarea
                  rows={2}
                  value={section.bullets}
                  onChange={(e) =>
                    handleUpdate(section.id, 'bullets', e.target.value)
                  }
                  placeholder="Her satıra bir madde yazın (ör: Lokal anestezi ile konforlu uygulama)"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
                />
              </div>
            </div>
          ))}
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
