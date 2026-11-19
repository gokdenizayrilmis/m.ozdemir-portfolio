'use client';

import { useEffect, useState } from 'react';
import { treatmentService, categoryService } from '@/services';
import { Treatment, Category, SeoMetadata, FaqItem } from '@/types';
import SeoMetaBox from '@/components/admin/SeoMetaBox';
import FaqListEditor from '@/components/admin/FaqListEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  X,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminTreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Edit / Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] =
    useState<Partial<Treatment> | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

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

  const handleOpenCreate = () => {
    setEditingTreatment({
      title: '',
      slug: '',
      categorySlug: categories[0]?.slug || 'dermatoloji',
      categoryId: categories[0]?.id || '',
      summary: '',
      htmlContent: '<p>Tedavi detay açıklaması buraya gelecek...</p>',
      coverImageUrl: '/uploads/treatments/lazerle-leke-tedavisi.jpg',
      displayOrder: 1,
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
    if (!editingTreatment?.title || !editingTreatment?.slug) {
      alert('Başlık ve URL Slug alanları zorunludur.');
      return;
    }

    setSaving(true);
    let res;
    if (editingTreatment.id) {
      res = await treatmentService.update(
        editingTreatment.id,
        editingTreatment
      );
    } else {
      res = await treatmentService.create(editingTreatment);
    }
    setSaving(false);

    if (res.isSuccess) {
      setStatusMessage({
        text: 'Tedavi başarıyla kaydedildi.',
        type: 'success',
      });
      setIsModalOpen(false);
      loadData();
    } else {
      alert(res.message || 'Kayıt sırasında hata oluştu.');
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
      setStatusMessage({
        text: res.message || 'Yayın durumu güncellendi.',
        type: 'success',
      });
    } else {
      alert(res.message || 'Yayın durumu değiştirilemedi.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`'${title}' tedavisini silmek istediğinize emin misiniz?`))
      return;

    const res = await treatmentService.delete(id);
    if (res.isSuccess) {
      loadData();
    } else {
      alert(res.message || 'Silme işlemi başarısız.');
    }
  };

  const filtered = treatments.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || t.categorySlug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            İçerik & SEO Yönetimi
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Tedavi Sayfaları ({treatments.length})
          </h1>
          <p className="text-xs text-slate-500">
            {treatments.length} klinik tedaviyi yönetin, Rank Math tarzı SEO
            başlıklarını ve Google FAQ sorularını düzenleyin
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Tedavi Ekle</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tedavi adı veya slug ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Treatments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Tedaviler yükleniyor...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Tedavi Başlığı</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">SSS (FAQ)</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      /{t.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {t.categorySlug}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                        {t.faqs?.length || 0} Soru
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
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
                              t.isPublished ? 'translate-x-4' : 'translate-x-0'
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
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/${t.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition inline-block"
                        title="Sayfayı Önizle"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-amber-700 transition"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Full Modal */}
      {isModalOpen && editingTreatment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-slate-900">
                    {editingTreatment.id
                      ? 'Tedaviyi Düzenle'
                      : 'Yeni Tedavi Ekle'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    İçerik, Rank Math SERP önizlemesi ve Google FAQ şeması
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tedavi Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTreatment.title || ''}
                    onChange={(e) =>
                      setEditingTreatment({
                        ...editingTreatment,
                        title: e.target.value,
                        slug:
                          editingTreatment.slug ||
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9ğüşıöç]/g, '-')
                            .replace(/-+/g, '-'),
                      })
                    }
                    placeholder="Örn: Lazerle Leke Tedavisi"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    URL Slug (Google Ads Landing URL){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTreatment.slug || ''}
                    onChange={(e) =>
                      setEditingTreatment({
                        ...editingTreatment,
                        slug: e.target.value,
                      })
                    }
                    placeholder="lazerle-leke-tedavisi"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={editingTreatment.categorySlug || 'dermatoloji'}
                    onChange={(e) => {
                      const selected = categories.find(
                        (c) => c.slug === e.target.value
                      );
                      setEditingTreatment({
                        ...editingTreatment,
                        categorySlug: e.target.value,
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sıralama (Display Order)
                  </label>
                  <input
                    type="number"
                    value={editingTreatment.displayOrder || 1}
                    onChange={(e) =>
                      setEditingTreatment({
                        ...editingTreatment,
                        displayOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTreatment.isPublished}
                      onChange={(e) =>
                        setEditingTreatment({
                          ...editingTreatment,
                          isPublished: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-slate-700 text-xs">
                      Yayında Olsun (Aktif)
                    </span>
                  </label>
                </div>
              </div>

              <ImageUpload
                label="Tedavi Kapak Görseli (CoverImageUrl)"
                description="Tedavi kartlarında ve detay sayfası üst vitrininde gösterilecek kapak görseli"
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
                  Özet Açıklama (Lead Summary)
                </label>
                <textarea
                  rows={2}
                  value={editingTreatment.summary || ''}
                  onChange={(e) =>
                    setEditingTreatment({
                      ...editingTreatment,
                      summary: e.target.value,
                    })
                  }
                  placeholder="Sayfa başlığının altında gösterilecek özet bilgi..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tedavi Detay İçeriği (HTML Destekli)
                </label>
                <textarea
                  rows={8}
                  value={editingTreatment.htmlContent || ''}
                  onChange={(e) =>
                    setEditingTreatment({
                      ...editingTreatment,
                      htmlContent: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              {/* FAQ List Editor */}
              <FaqListEditor
                faqs={editingTreatment.faqs || []}
                onChange={(faqs: FaqItem[]) =>
                  setEditingTreatment({ ...editingTreatment, faqs })
                }
              />

              {/* SEO Rank Math Meta Box */}
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-semibold transition flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Tedaviyi Kaydet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

