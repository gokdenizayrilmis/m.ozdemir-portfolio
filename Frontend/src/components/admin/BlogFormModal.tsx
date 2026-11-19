'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { m } from 'motion/react';
import { BlogPost, SeoMetadata } from '@/types';
import SeoMetaBox from '@/components/admin/SeoMetaBox';
import ImageUpload from '@/components/admin/ImageUpload';
import SectionContentEditor from '@/components/admin/SectionContentEditor';
import { slugifyTurkish } from '@/utils/slug';
import {
  AlertCircle,
  BookOpen,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  X,
} from 'lucide-react';

type BlogModalTab = 'content' | 'seo';

interface BlogFormModalProps {
  blog: Partial<BlogPost>;
  slugManuallyEdited: boolean;
  saving: boolean;
  modalError: string | null;
  onChange: (updated: Partial<BlogPost>) => void;
  onSlugManualEdit: () => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BlogFormModal({
  blog,
  slugManuallyEdited,
  saving,
  modalError,
  onChange,
  onSlugManualEdit,
  onClose,
  onSubmit,
}: BlogFormModalProps) {
  const [modalTab, setModalTab] = useState<BlogModalTab>('content');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, onClose]);

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label={
        blog.id ? `Düzenle: ${blog.title || 'Makale'}` : 'Yeni Makale Yaz'
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <m.form
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          if (saving) {
            e.preventDefault();
            return;
          }
          if (!blog.title?.trim() || !blog.slug?.trim() || !blog.summary?.trim()) {
            setModalTab('content');
          }
          onSubmit(e);
        }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200/80 shrink-0 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-heading font-bold tracking-tight text-slate-900 truncate">
                  {blog.id
                    ? `Düzenle: ${blog.title || 'Makale'}`
                    : 'Yeni Makale Yaz'}
                </h2>
                <p className="text-xs text-slate-500 truncate">
                  Akademik blog içeriği ve Google SERP önizlemesi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {blog.id && blog.slug && (
                <Link
                  href={`/blog/${blog.slug}`}
                  target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                >
                  <span>Canlıda Gör</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2-Tab Navigation with Sliding Pill */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            {(
              [
                {
                  id: 'content',
                  label: 'İçerik & Görsel',
                  icon: FileText,
                },
                {
                  id: 'seo',
                  label: 'SEO & Google Önizleme',
                  icon: Globe,
                },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = modalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id)}
                  className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                    isActive
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <m.div
                      layoutId="blogModalTab"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-lg bg-white shadow-xs"
                    />
                  )}
                  <Icon className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs bg-slate-50/50">
          {modalError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {modalTab === 'content' && (
            <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Makale Başlığı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={blog.title || ''}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      onChange({
                        ...blog,
                        title: nextTitle,
                        slug: slugManuallyEdited
                          ? blog.slug
                          : slugifyTurkish(nextTitle),
                      });
                    }}
                    placeholder="Örn: Güneş Lekeleri ve Melazmadan Korunma"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    URL Bağlantısı (Slug){' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={blog.slug || ''}
                    onChange={(e) => {
                      onSlugManualEdit();
                      onChange({
                        ...blog,
                        slug: slugifyTurkish(e.target.value),
                      });
                    }}
                    placeholder="gunes-lekeleri-ve-melazma"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yazar
                  </label>
                  <input
                    type="text"
                    value={blog.author || ''}
                    onChange={(e) =>
                      onChange({
                        ...blog,
                        author: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...blog,
                        isPublished: !blog.isPublished,
                      })
                    }
                    className="inline-flex items-center gap-2.5 focus:outline-none"
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        blog.isPublished ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          blog.isPublished ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </span>
                    <span className="font-semibold text-slate-700 text-xs">
                      {blog.isPublished ? 'Yayında (Aktif)' : 'Taslak (Gizli)'}
                    </span>
                  </button>
                </div>
              </div>

              <ImageUpload
                label="Makale Kapak Görseli"
                description="Blog listesinde ve makale detay sayfasında gösterilecek kapak görseli"
                folder="blogs"
                value={blog.coverImageUrl || ''}
                onChange={(url) => onChange({ ...blog, coverImageUrl: url })}
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kısa Özet <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={blog.summary || ''}
                  onChange={(e) =>
                    onChange({
                      ...blog,
                      summary: e.target.value,
                    })
                  }
                  placeholder="Makale kartlarında gösterilecek kısa özet..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </div>

              <SectionContentEditor
                label="Makale İçeriği"
                value={blog.htmlContent || ''}
                onChange={(html) =>
                  onChange({
                    ...blog,
                    htmlContent: html,
                  })
                }
              />
            </div>
          )}

          {modalTab === 'seo' && (
            <SeoMetaBox
              seo={
                blog.seo || {
                  metaTitle: '',
                  metaDescription: '',
                  focusKeywords: [],
                  noIndex: false,
                  schemaType: 'MedicalScholarlyArticle',
                }
              }
              slug={`blog/${blog.slug || ''}`}
              defaultTitle={blog.title || ''}
              onChange={(seo: SeoMetadata) => onChange({ ...blog, seo })}
            />
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200/80 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium tabular-nums">
            SEO Başlığı: {(blog.seo?.metaTitle || blog.title || '').length}/60
            karakter
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Kaydediliyor...' : 'Makaleyi Kaydet'}</span>
            </button>
          </div>
        </div>
      </m.form>
    </m.div>
  );
}
