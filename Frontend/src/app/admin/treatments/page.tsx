'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m } from 'motion/react';
import { treatmentService, categoryService } from '@/services';
import { Treatment, Category, SeoMetadata, FaqItem } from '@/types';
import SeoMetaBox from '@/components/admin/SeoMetaBox';
import FaqListEditor from '@/components/admin/FaqListEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import SectionContentEditor from '@/components/admin/SectionContentEditor';
import { useAdminToast } from '@/components/admin/AdminToast';
import { resolveMediaUrl } from '@/utils/cn';
import { slugifyTurkish } from '@/utils/slug';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Stethoscope,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  FileText,
  HelpCircle,
  Globe,
  Loader2,
} from 'lucide-react';

type ModalTab = 'content' | 'faqs' | 'seo';

export default function AdminTreatmentsPage() {
  const { showToast } = useAdminToast();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'draft'
  >('all');

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('content');
  const [editingTreatment, setEditingTreatment] =
    useState<Partial<Treatment> | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [orderWarning, setOrderWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [tList, cList] = await Promise.all([
      treatmentService.getAll(undefined, false),
      categoryService.getAll(),
    ]);
    setTreatments(tList);
    setCategories(cList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
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

  const getMaxOrder = (excludeId?: string) => {
    const othersCount = treatments.filter((t) => t.id !== excludeId).length;
    return othersCount + 1;
  };

  const handleOpenCreate = () => {
    const defaultCategorySlug = categories[0]?.slug || 'dermatoloji';
    const nextOrder = getMaxOrder();
    setModalError(null);
    setOrderWarning(null);
    setModalTab('content');
    setSlugManuallyEdited(false);
    setEditingTreatment({
      title: '',
      slug: '',
      categorySlug: defaultCategorySlug,
      categoryId: categories[0]?.id || '',
      summary: '',
      htmlContent: '<h2>Tedavi Hakkında</h2>\n<p>Tedavi detay açıklaması buraya gelecek...</p>',
      coverImageUrl: '/uploads/treatments/lazerle-leke-tedavisi.jpg',
      displayOrder: nextOrder,
      isPublished: true,
      faqs: [],
      seo: {
        metaTitle: '',
        metaDescription: '',
        focusKeywords: [],
        noIndex: false,
        schemaType: 'MedicalWebPage',
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Treatment) => {
    setModalError(null);
    setOrderWarning(null);
    setModalTab('content');
    setSlugManuallyEdited(true);
    setEditingTreatment({
      ...t,
      faqs: t.faqs || [],
      seo: t.seo || {
        metaTitle: `${t.title} | Prof. Dr. Mustafa Özdemir`,
        metaDescription: t.summary,
        focusKeywords: [],
        noIndex: false,
        schemaType: 'MedicalWebPage',
      },
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!editingTreatment?.title?.trim() || !editingTreatment?.slug?.trim()) {
      setModalTab('content');
      setModalError('Tedavi başlığı ve URL bağlantısı (slug) zorunludur.');
      return;
    }

    if (!editingTreatment?.summary?.trim()) {
      setModalTab('content');
      setModalError('Lütfen tedavi için kısa bir özet açıklama giriniz.');
      return;
    }

    setSaving(true);
    const res = editingTreatment.id
      ? await treatmentService.update(editingTreatment.id, editingTreatment)
      : await treatmentService.create(editingTreatment);
    setSaving(false);

    if (res.isSuccess) {
      showToast(
        editingTreatment.id
          ? 'Tedavi başarıyla güncellendi.'
          : 'Yeni tedavi başarıyla eklendi.',
        'success'
      );
      setIsModalOpen(false);
      loadData();
    } else {
      setModalError(res.message || 'Kayıt sırasında bir hata oluştu.');
    }
  };

  const handleTogglePublish = async (t: Treatment) => {
    setTogglingId(t.id);
    const res = await treatmentService.togglePublish(t.id);
    setTogglingId(null);

    if (res.isSuccess && res.data) {
      setTreatments((prev) =>
        prev.map((item) => (item.id === t.id ? res.data! : item))
      );
      showToast(res.message || 'Yayın durumu güncellendi.', 'success');
    } else {
      showToast(res.message || 'Yayın durumu değiştirilemedi.', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' tedavisini silmek istediğinize emin misiniz?`))
      return;

    const res = await treatmentService.delete(id);
    if (res.isSuccess) {
      showToast(`'${title}' tedavisi silindi.`, 'success');
      loadData();
    } else {
      showToast(res.message || 'Silme işlemi başarısız.', 'error');
    }
  };

  const publishedCount = treatments.filter((t) => t.isPublished).length;
  const draftCount = treatments.length - publishedCount;

  const filtered = treatments
    .filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !categoryFilter || t.categorySlug === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && t.isPublished) ||
        (statusFilter === 'draft' && !t.isPublished);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
      if (orderDiff !== 0) return orderDiff;
      return a.title.localeCompare(b.title, 'tr');
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
            İçerik &amp; SEO Yönetimi
          </span>
          <h1 className="text-2xl font-heading font-bold tracking-tight tabular-nums text-slate-900 mt-1">
            Tedavi Sayfaları ({treatments.length})
          </h1>
          <p className="text-xs text-slate-500">
            {treatments.length} klinik tedaviyi yönetin, SEO başlıklarını ve
            Google FAQ sorularını düzenleyin
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tedavi Ekle</span>
        </button>
      </div>

      {/* Filter, Status Pills and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Tedavi adı veya URL ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Pills */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs tabular-nums self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tümü ({treatments.length})
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

      {/* Treatments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 px-2 py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                  <div className="h-3.5 w-48 bg-slate-200 rounded-md" />
                </div>
                <div className="h-3.5 w-32 bg-slate-100 rounded-md hidden sm:block" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
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
                  <th className="py-3 px-4 w-14">Sıra</th>
                  <th className="py-3 px-4">Tedavi Başlığı</th>
                  <th className="py-3 px-4">URL Bağlantısı</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">SSS (FAQ)</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t, idx) => {
                  const thumbUrl = resolveMediaUrl(t.coverImageUrl);
                  const displayNum = t.displayOrder || idx + 1;
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs tabular-nums">
                          {displayNum}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {thumbUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbUrl}
                              alt={t.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-semibold text-slate-900">
                            {t.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100/80 text-slate-700 text-xs font-medium">
                          /{t.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {t.categorySlug}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-amber-800 font-semibold tabular-nums bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                          {t.faqs?.length || 0} Soru
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={togglingId === t.id}
                          onClick={() => handleTogglePublish(t)}
                          title={
                            t.isPublished
                              ? 'Yayında (Gizlemek için tıklayın)'
                              : 'Taslak (Yayınlamak için tıklayın)'
                          }
                          className="inline-flex items-center gap-2 focus:outline-none disabled:opacity-50"
                        >
                          <span
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              t.isPublished ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                t.isPublished
                                  ? 'translate-x-4'
                                  : 'translate-x-0'
                              }`}
                            />
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              t.isPublished
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {t.isPublished ? 'Yayında' : 'Taslak'}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <Link
                            href={`/${t.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Sayfayı Önizle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id, t.title)}
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
        {isModalOpen && editingTreatment && (
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
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-heading font-bold tracking-tight text-slate-900 truncate">
                        {editingTreatment.id
                          ? `Düzenle: ${editingTreatment.title || 'Tedavi'}`
                          : 'Yeni Tedavi Ekle'}
                      </h2>
                      <p className="text-xs text-slate-500 truncate">
                        İçerik, Sıkça Sorulan Sorular ve Google SEO önizlemesi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {editingTreatment.id && editingTreatment.slug && (
                      <Link
                        href={`/${editingTreatment.slug}`}
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

                {/* 3-Tab Navigation with Sliding Pill */}
                <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs">
                  {(
                    [
                      {
                        id: 'content',
                        label: 'İçerik & Görsel',
                        icon: FileText,
                      },
                      {
                        id: 'faqs',
                        label: `SSS (${editingTreatment.faqs?.length || 0})`,
                        icon: HelpCircle,
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
                            layoutId="treatmentModalTab"
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
                          Tedavi Başlığı <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingTreatment.title || ''}
                          onChange={(e) => {
                            const nextTitle = e.target.value;
                            setEditingTreatment({
                              ...editingTreatment,
                              title: nextTitle,
                              slug: slugManuallyEdited
                                ? editingTreatment.slug
                                : slugifyTurkish(nextTitle),
                            });
                          }}
                          placeholder="Örn: Lazerle Leke Tedavisi"
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
                          value={editingTreatment.slug || ''}
                          onChange={(e) => {
                            setSlugManuallyEdited(true);
                            setEditingTreatment({
                              ...editingTreatment,
                              slug: slugifyTurkish(e.target.value),
                            });
                          }}
                          placeholder="lazerle-leke-tedavisi"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Uzmanlık Kategorisi
                        </label>
                        <select
                          value={editingTreatment.categorySlug || 'dermatoloji'}
                          onChange={(e) => {
                            const nextCatSlug = e.target.value;
                            const selected = categories.find(
                              (c) => c.slug === nextCatSlug
                            );
                            setEditingTreatment({
                              ...editingTreatment,
                              categorySlug: nextCatSlug,
                              categoryId: selected?.id || '',
                            });
                          }}
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        {(() => {
                          const maxOrder = getMaxOrder(editingTreatment.id);
                          return (
                            <>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block font-semibold text-slate-700">
                                  Gösterim Sırası
                                </label>
                                <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                                  1 – {maxOrder} arası
                                </span>
                              </div>
                              <input
                                type="number"
                                min={1}
                                max={maxOrder}
                                value={editingTreatment.displayOrder || 1}
                                onChange={(e) => {
                                  const raw = parseInt(e.target.value, 10);
                                  if (Number.isNaN(raw)) {
                                    setOrderWarning(null);
                                    setEditingTreatment({
                                      ...editingTreatment,
                                      displayOrder: 1,
                                    });
                                    return;
                                  }

                                  if (raw > maxOrder) {
                                    setOrderWarning(
                                      `En fazla ${maxOrder}. sıra seçilebilir; ${maxOrder} olarak ayarlandı.`
                                    );
                                    setEditingTreatment({
                                      ...editingTreatment,
                                      displayOrder: maxOrder,
                                    });
                                  } else if (raw < 1) {
                                    setOrderWarning('En az 1 olabilir.');
                                    setEditingTreatment({
                                      ...editingTreatment,
                                      displayOrder: 1,
                                    });
                                  } else {
                                    setOrderWarning(null);
                                    setEditingTreatment({
                                      ...editingTreatment,
                                      displayOrder: raw,
                                    });
                                  }
                                }}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none tabular-nums"
                              />
                              {orderWarning && (
                                <p className="mt-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1 leading-snug">
                                  {orderWarning}
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      <div className="sm:pt-8">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingTreatment({
                              ...editingTreatment,
                              isPublished: !editingTreatment.isPublished,
                            })
                          }
                          className="inline-flex items-center gap-2.5 focus:outline-none"
                        >
                          <span
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                              editingTreatment.isPublished
                                ? 'bg-emerald-600'
                                : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                                editingTreatment.isPublished
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }`}
                            />
                          </span>
                          <span className="font-semibold text-slate-700 text-xs">
                            {editingTreatment.isPublished
                              ? 'Yayında (Aktif)'
                              : 'Taslak (Gizli)'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <ImageUpload
                      label="Tedavi Kapak Görseli"
                      description="Tedavi kartlarında ve detay sayfasında gösterilecek ana görsel"
                      folder="treatments"
                      value={editingTreatment.coverImageUrl || ''}
                      onChange={(url) =>
                        setEditingTreatment({
                          ...editingTreatment,
                          coverImageUrl: url,
                        })
                      }
                    />

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kısa Özet <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={editingTreatment.summary || ''}
                        onChange={(e) =>
                          setEditingTreatment({
                            ...editingTreatment,
                            summary: e.target.value,
                          })
                        }
                        placeholder="Sayfa başlığının hemen altında gösterilecek 1-2 cümlelik özet bilgi..."
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                      />
                    </div>

                    <SectionContentEditor
                      label="Tedavi Detay İçeriği"
                      value={editingTreatment.htmlContent || ''}
                      onChange={(html) =>
                        setEditingTreatment({
                          ...editingTreatment,
                          htmlContent: html,
                        })
                      }
                    />
                  </div>
                )}

                {modalTab === 'faqs' && (
                  <FaqListEditor
                    faqs={editingTreatment.faqs || []}
                    onChange={(faqs: FaqItem[]) =>
                      setEditingTreatment({ ...editingTreatment, faqs })
                    }
                  />
                )}

                {modalTab === 'seo' && (
                  <SeoMetaBox
                    seo={
                      editingTreatment.seo || {
                        metaTitle: '',
                        metaDescription: '',
                        focusKeywords: [],
                        noIndex: false,
                        schemaType: 'MedicalWebPage',
                      }
                    }
                    slug={editingTreatment.slug || ''}
                    defaultTitle={editingTreatment.title || ''}
                    onChange={(seo: SeoMetadata) =>
                      setEditingTreatment({ ...editingTreatment, seo })
                    }
                  />
                )}
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-4 bg-white border-t border-slate-200/80 shrink-0 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 font-medium tabular-nums">
                  {editingTreatment.faqs?.length || 0} SSS Sorusu • SEO Başlığı:{' '}
                  {(
                    editingTreatment.seo?.metaTitle ||
                    editingTreatment.title ||
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
                    <span>{saving ? 'Kaydediliyor...' : 'Tedaviyi Kaydet'}</span>
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
