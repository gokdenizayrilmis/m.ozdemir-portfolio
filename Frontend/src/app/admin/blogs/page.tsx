'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { blogService } from '@/services';
import { BlogPost } from '@/types';
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

const BlogFormModal = dynamic(
  () => import('@/components/admin/BlogFormModal'),
  { ssr: false }
);

export default function AdminBlogsPage() {
  const { showToast } = useAdminToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(
    null
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBlogs = async () => {
    setLoading(true);
    const data = await blogService.getAll(undefined, false);
    setBlogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleOpenCreate = () => {
    setModalError(null);
    setSlugManuallyEdited(false);
    setEditingBlog({
      title: '',
      slug: '',
      summary: '',
      htmlContent:
        '<h2>Makale Başlığı</h2>\n<p>Makale içeriği buraya gelecek...</p>',
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
      setModalError('Makale başlığı ve URL bağlantısı (slug) zorunludur.');
      return;
    }

    if (!editingBlog?.summary?.trim()) {
      setModalError('Lütfen makale için kısa bir özet açıklama giriniz.');
      return;
    }

    setSaving(true);
    const res = editingBlog.id
      ? await blogService.update(editingBlog.id, editingBlog)
      : await blogService.create(editingBlog);
    setSaving(false);

    if (res.isSuccess) {
      showToast(
        editingBlog.id
          ? 'Makale başarıyla güncellendi.'
          : 'Yeni makale başarıyla eklendi.',
        'success'
      );
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
      showToast(res.message || 'Makale yayın durumu güncellendi.', 'success');
    } else {
      showToast(res.message || 'Yayın durumu değiştirilemedi.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await blogService.delete(deleteTarget.id);
    setDeleting(false);

    if (res.isSuccess) {
      showToast(`'${deleteTarget.title}' makalesi silindi.`, 'success');
      setDeleteTarget(null);
      loadBlogs();
    } else {
      showToast(res.message || 'Silme işlemi başarısız.', 'error');
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
          type="button"
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
            aria-label="Makale başlığı veya URL ile ara"
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <AdminStatusPills
          value={statusFilter}
          totalCount={blogs.length}
          publishedCount={publishedCount}
          draftCount={draftCount}
          onChange={setStatusFilter}
          className="self-start sm:self-auto"
        />
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        {loading ? (
          <AdminTableSkeleton rows={5} columns={4} />
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
                        <AdminPublishToggle
                          isPublished={b.isPublished}
                          disabled={togglingId === b.id}
                          onToggle={() => handleTogglePublish(b)}
                          itemLabel={b.title}
                        />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <Link
                            href={`/blog/${b.slug}`}
                            target="_blank"
                            aria-label={`${b.title} makalesini görüntüle`}
                            title="Görüntüle"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            aria-label={`${b.title} makalesini düzenle`}
                            title="Düzenle"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({ id: b.id, title: b.title })
                            }
                            aria-label={`${b.title} makalesini sil`}
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
      {isModalOpen && editingBlog && (
        <BlogFormModal
          blog={editingBlog}
          slugManuallyEdited={slugManuallyEdited}
          saving={saving}
          modalError={modalError}
          onChange={setEditingBlog}
          onSlugManualEdit={() => setSlugManuallyEdited(true)}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}

      {/* Accessible Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Makaleyi Sil"
        description={`'${deleteTarget?.title || ''}' makalesini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
