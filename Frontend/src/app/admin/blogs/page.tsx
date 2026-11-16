'use client';

import { useEffect, useState } from 'react';
import { blogService } from '@/services';
import { BlogPost, SeoMetadata } from '@/types';
import SeoMetaBox from '@/components/admin/SeoMetaBox';
import ImageUpload from '@/components/admin/ImageUpload';
import { Plus, Edit2, Trash2, Eye, Loader2, X, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const loadBlogs = async () => {
    setLoading(true);
    const data = await blogService.getAll();
    setBlogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingBlog({
      title: '',
      slug: '',
      summary: '',
      htmlContent: '<p>Makale içeriği buraya gelecek...</p>',
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
    setEditingBlog(b);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title || !editingBlog?.slug) {
      alert('Başlık ve URL Slug alanları zorunludur.');
      return;
    }

    setSaving(true);
    let res;
    if (editingBlog.id) {
      res = await blogService.update(editingBlog.id, editingBlog);
    } else {
      res = await blogService.create(editingBlog);
    }
    setSaving(false);

    if (res.isSuccess) {
      setIsModalOpen(false);
      loadBlogs();
    } else {
      alert(res.message || 'Kayıt sırasında hata oluştu.');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Dermatoloji Rehberi
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Blog & Makale Yönetimi ({blogs.length})
          </h1>
          <p className="text-xs text-slate-500">
            Prof. Dr. Mustafa Özdemir&apos;in bilimsel içeriklerini ve SEO meta
            etiketlerini yönetin
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Makale Ekle</span>
        </button>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Makaleler yükleniyor...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Makale Başlığı</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Yazar</th>
                  <th className="py-3 px-4">Yayın Tarihi</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {b.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      /blog/{b.slug}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{b.author}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(b.publishedAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.isPublished ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                          Yayında
                        </span>
                      ) : (
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/blog/${b.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition inline-block"
                        title="Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-amber-700 transition"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.title)}
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

      {/* Edit / Create Modal */}
      {isModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-slate-900">
                    {editingBlog.id ? 'Makaleyi Düzenle' : 'Yeni Makale Yaz'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Akademik blog yazısı ve SERP önizlemesi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Makale Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBlog.title || ''}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        title: e.target.value,
                        slug:
                          editingBlog.slug ||
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9ğüşıöç]/g, '-')
                            .replace(/-+/g, '-'),
                      })
                    }
                    placeholder="Örn: Güneş Lekeleri ve Melazmadan Korunma"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBlog.slug || ''}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, slug: e.target.value })
                    }
                    placeholder="gunes-lekeleri-ve-melazma"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <ImageUpload
                label="Makale Kapak Görseli (CoverImageUrl)"
                description="Blog listesinde ve makale detay sayfasında gösterilecek kapak görseli"
                folder="blogs"
                value={editingBlog.coverImageUrl || ''}
                onChange={(url) =>
                  setEditingBlog({ ...editingBlog, coverImageUrl: url })
                }
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Özet Açıklama
                </label>
                <textarea
                  rows={2}
                  value={editingBlog.summary || ''}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, summary: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  İçerik (HTML)
                </label>
                <textarea
                  rows={8}
                  value={editingBlog.htmlContent || ''}
                  onChange={(e) =>
                    setEditingBlog({
                      ...editingBlog,
                      htmlContent: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-semibold transition"
                >
                  {saving ? 'Kaydediliyor...' : 'Makaleyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

