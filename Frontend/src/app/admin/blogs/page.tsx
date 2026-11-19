'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m } from 'motion/react';
import { blogService } from '@/services';
import { BlogPost, SeoMetadata } from '@/types';
import SeoMetaBox from '@/components/admin/SeoMetaBox';
import ImageUpload from '@/components/admin/ImageUpload';
import SectionContentEditor from '@/components/admin/SectionContentEditor';
import { resolveMediaUrl } from '@/utils/cn';
import { slugifyTurkish } from '@/utils/slug';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  X,
  BookOpen,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  FileText,
  Globe,
} from 'lucide-react';

type BlogModalTab = 'content' | 'seo';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'draft'
  >('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<BlogModalTab>('content');
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(
    null
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadBlogs = async () => {
    setLoading(true);
    const data = await blogService.getAll(undefined, false);
    setBlogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleOpenCreate = () => {
    setModalError(null);
    setModalTab('content');
    setSlugManuallyEdited(false);
    setEditingBlog({
      title: '',
      slug: '',
      summary: '',
      htmlContent: '<h2>Makale Başlığı</h2>\n<p>Makale içeriği buraya gelecek...</p>',
      author: 'Prof. Dr. Mustafa Özdemir',
      coverImageUrl: '/uploads/treatments/lazerle-leke-tedavisi.jpg',
      isPublished: true,
      tags: ['Dermatoloji'],
      seo: {
        metaTitle: '',
        metaDescription: '',
        focusKeywords: [],
        noIndex: false,
        schemaType: 'MedicalScholarlyArticle',
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BlogPost) => {
    setModalError(null);
    setModalTab('content');
    setSlugManuallyEdited(true);
    setEditingBlog({
      ...b,
      seo: b.seo || {
        metaTitle: `${b.title} | Prof. Dr. Mustafa Özdemir`,
        metaDescription: b.summary,
        focusKeywords: [],
        noIndex: false,
        schemaType: 'MedicalScholarlyArticle',
      },
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!editingBlog?.title?.trim() || !editingBlog?.slug?.trim()) {
      setModalTab('content');
      setModalError('Makale başlığı ve URL bağlantısı (slug) zorunludur.');
      return;
    }

    if (!editingBlog?.summary?.trim()) {
      setModalTab('content');
      setModalError('Lütfen makale için kısa bir özet açıklama giriniz.');
      return;
    }

    setSaving(true);
    const res = editingBlog.id
      ? await blogService.update(editingBlog.id, editingBlog)
      : await blogService.create(editingBlog);
    setSaving(false);

    if (res.isSuccess) {
      setIsModalOpen(false);
      loadBlogs();
    } else {
      setModalError(res.message || 'Kayıt sırasında bir hata oluştu.');
    }
  };

  const handleTogglePublish = async (b: BlogPost) => {
    setTogglingId(b.id);
    const res = await blogService.togglePublish(b.id);
    setTogglingId(null);

    if (res.isSuccess && res.data) {
      setBlogs((prev) =>
        prev.map((item) => (item.id === b.id ? res.data! : item))
      );
    } else {
      alert(res.message || 'Yayın durumu değiştirilemedi.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' makalesini silmek istediğinize emin misiniz?`))
      return;

    const res = await blogService.delete(id);
    if (res.isSuccess) {
      loadBlogs();
    } else {
      alert(res.message || 'Silme işlemi başarısız.');
    }
  };

  const publishedCount = blogs.filter((b) => b.isPublished).length;
  const draftCount = blogs.length - publishedCount;

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && b.isPublished) ||
      (statusFilter === 'draft' && !b.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
            Dermatoloji Rehberi
          </span>
          <h1 className="text-2xl font-heading font-bold tracking-tight tabular-nums text-slate-900 mt-1">
            Blog &amp; Makale Yönetimi ({blogs.length})
          </h1>
          <p className="text-xs text-slate-500">
            Prof. Dr. Mustafa Özdemir&apos;in bilimsel içeriklerini ve SEO meta
            etiketlerini yönetin
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Makale Ekle</span>
        </button>
      </div>

      {/* Search Bar & Status Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Makale başlığı veya URL ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs tabular-nums self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tümü ({blogs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'published'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yayında ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'draft'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Taslak ({draftCount})
          </button>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 px-2 py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                  <div className="h-3.5 w-52 bg-slate-200 rounded-md" />
                </div>
                <div className="h-3.5 w-32 bg-slate-100 rounded-md hidden sm:block" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-6 w-20 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/70">
                <tr>
                  <th className="py-3 px-4">Makale Başlığı</th>
                  <th className="py-3 px-4">URL Bağlantısı</th>
                  <th className="py-3 px-4">Yazar</th>
                  <th className="py-3 px-4">Yayın Tarihi</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => {
                  const thumbUrl = resolveMediaUrl(b.coverImageUrl);
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {thumbUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbUrl}
                              alt={b.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-semibold text-slate-900 max-w-xs truncate">
                            {b.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100/80 text-slate-700 text-xs font-medium">
                          /blog/{b.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{b.author}</td>
                      <td className="py-3 px-4 text-slate-500 tabular-nums whitespace-nowrap">
                        {new Date(b.publishedAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={togglingId === b.id}
                          onClick={() => handleTogglePublish(b)}
                          title={
                            b.isPublished
                              ? 'Yayında (Gizlemek için tıklayın)'
                              : 'Taslak (Yayınlamak için tıklayın)'
                          }
                          className="inline-flex items-center gap-2 focus:outline-none disabled:opacity-50"
                        >
                          <span
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              b.isPublished ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                b.isPublished
                                  ? 'translate-x-4'
                                  : 'translate-x-0'
                              }`}
                            />
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              b.isPublished
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {b.isPublished ? 'Yayında' : 'Taslak'}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <Link
                            href={`/blog/${b.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id, b.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Tabbed Modal with Sticky Header & Sticky Footer */}
      <AnimatePresence>
        {isModalOpen && editingBlog && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
          >
            <m.form
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
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
                        {editingBlog.id
                          ? `Düzenle: ${editingBlog.title || 'Makale'}`
                          : 'Yeni Makale Yaz'}
                      </h2>
                      <p className="text-xs text-slate-500 truncate">
                        Akademik blog içeriği ve Google SERP önizlemesi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {editingBlog.id && editingBlog.slug && (
                      <Link
                        href={`/blog/${editingBlog.slug}`}
                        target="_blank"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                      >
                        <span>Canlıda Gör</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
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
                          value={editingBlog.title || ''}
                          onChange={(e) => {
                            const nextTitle = e.target.value;
                            setEditingBlog({
                              ...editingBlog,
                              title: nextTitle,
                              slug: slugManuallyEdited
                                ? editingBlog.slug
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
                          value={editingBlog.slug || ''}
                          onChange={(e) => {
                            setSlugManuallyEdited(true);
                            setEditingBlog({
                              ...editingBlog,
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
                          value={editingBlog.author || ''}
                          onChange={(e) =>
                            setEditingBlog({
                              ...editingBlog,
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
                            setEditingBlog({
                              ...editingBlog,
                              isPublished: !editingBlog.isPublished,
                            })
                          }
                          className="inline-flex items-center gap-2.5 focus:outline-none"
                        >
                          <span
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                              editingBlog.isPublished
                                ? 'bg-emerald-600'
                                : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                                editingBlog.isPublished
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }`}
                            />
                          </span>
                          <span className="font-semibold text-slate-700 text-xs">
                            {editingBlog.isPublished
                              ? 'Yayında (Aktif)'
                              : 'Taslak (Gizli)'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <ImageUpload
                      label="Makale Kapak Görseli"
                      description="Blog listesinde ve makale detay sayfasında gösterilecek kapak görseli"
                      folder="blogs"
                      value={editingBlog.coverImageUrl || ''}
                      onChange={(url) =>
                        setEditingBlog({ ...editingBlog, coverImageUrl: url })
                      }
                    />

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kısa Özet <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={editingBlog.summary || ''}
                        onChange={(e) =>
                          setEditingBlog({
                            ...editingBlog,
                            summary: e.target.value,
                          })
                        }
                        placeholder="Makale kartlarında gösterilecek kısa özet..."
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                      />
                    </div>

                    <SectionContentEditor
                      label="Makale İçeriği"
                      value={editingBlog.htmlContent || ''}
                      onChange={(html) =>
                        setEditingBlog({
                          ...editingBlog,
                          htmlContent: html,
                        })
                      }
                    />
                  </div>
                )}

                {modalTab === 'seo' && (
                  <SeoMetaBox
                    seo={
                      editingBlog.seo || {
                        metaTitle: '',
                        metaDescription: '',
                        focusKeywords: [],
                        noIndex: false,
                        schemaType: 'MedicalScholarlyArticle',
                      }
                    }
                    slug={`blog/${editingBlog.slug || ''}`}
                    defaultTitle={editingBlog.title || ''}
                    onChange={(seo: SeoMetadata) =>
                      setEditingBlog({ ...editingBlog, seo })
                    }
                  />
                )}
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-4 bg-white border-t border-slate-200/80 shrink-0 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 font-medium tabular-nums">
                  SEO Başlığı:{' '}
                  {(
                    editingBlog.seo?.metaTitle ||
                    editingBlog.title ||
                    ''
                  ).length}
                  /60 karakter
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
        )}
      </AnimatePresence>
    </div>
  );
}
