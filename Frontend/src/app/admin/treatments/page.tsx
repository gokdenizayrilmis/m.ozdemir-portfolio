'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { treatmentService, categoryService } from '@/services';
import { Treatment, Category } from '@/types';
import AdminStatusPills, {
  AdminStatusFilter,
} from '@/components/admin/AdminStatusPills';
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton';
import AdminPublishToggle from '@/components/admin/AdminPublishToggle';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useAdminToast } from '@/components/admin/AdminToast';
import { resolveMediaUrl } from '@/utils/cn';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';

const TreatmentFormModal = dynamic(
  () => import('@/components/admin/TreatmentFormModal'),
  { ssr: false }
);

export default function AdminTreatmentsPage() {
  const { showToast } = useAdminToast();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] =
    useState<Partial<Treatment> | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const getMaxOrder = (excludeId?: string) => {
    const othersCount = treatments.filter((t) => t.id !== excludeId).length;
    return othersCount + 1;
  };

  const handleOpenCreate = () => {
    const defaultCategorySlug = categories[0]?.slug || 'dermatoloji';
    const nextOrder = getMaxOrder();
    setModalError(null);
    setSlugManuallyEdited(false);
    setEditingTreatment({
      title: '',
      slug: '',
      categorySlug: defaultCategorySlug,
      categoryId: categories[0]?.id || '',
      summary: '',
      htmlContent:
        '<h2>Tedavi Hakkında</h2>\n<p>Tedavi detay açıklaması buraya gelecek...</p>',
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
      setModalError('Tedavi başlığı ve URL bağlantısı (slug) zorunludur.');
      return;
    }

    if (!editingTreatment?.summary?.trim()) {
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await treatmentService.delete(deleteTarget.id);
    setDeleting(false);

    if (res.isSuccess) {
      showToast(`'${deleteTarget.title}' tedavisi silindi.`, 'success');
      setDeleteTarget(null);
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
          type="button"
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
              aria-label="Tedavi adı veya URL ile ara"
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Kategoriye göre filtrele"
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

        <AdminStatusPills
          value={statusFilter}
          totalCount={treatments.length}
          publishedCount={publishedCount}
          draftCount={draftCount}
          onChange={setStatusFilter}
          className="self-start lg:self-auto"
        />
      </div>

      {/* Treatments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        {loading ? (
          <AdminTableSkeleton rows={6} columns={5} />
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
                              width={40}
                              height={40}
                              loading="lazy"
                              decoding="async"
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
                        <AdminPublishToggle
                          isPublished={t.isPublished}
                          disabled={togglingId === t.id}
                          onToggle={() => handleTogglePublish(t)}
                          itemLabel={t.title}
                        />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <Link
                            href={`/${t.slug}`}
                            target="_blank"
                            aria-label={`${t.title} sayfasını önizle`}
                            title="Sayfayı Önizle"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            aria-label={`${t.title} tedavisini düzenle`}
                            title="Düzenle"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({ id: t.id, title: t.title })
                            }
                            aria-label={`${t.title} tedavisini sil`}
                            title="Sil"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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

      {/* Lazy-loaded Tabbed Modal */}
      {isModalOpen && editingTreatment && (
        <TreatmentFormModal
          treatment={editingTreatment}
          categories={categories}
          maxOrder={getMaxOrder(editingTreatment.id)}
          slugManuallyEdited={slugManuallyEdited}
          saving={saving}
          modalError={modalError}
          onChange={setEditingTreatment}
          onSlugManualEdit={() => setSlugManuallyEdited(true)}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}

      {/* Accessible Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Tedavi Sayfasını Sil"
        description={`'${deleteTarget?.title || ''}' tedavi sayfasını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
