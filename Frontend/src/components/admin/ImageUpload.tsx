'use client';

import { useRef, useState } from 'react';
import { mediaService } from '@/services';
import { resolveMediaUrl } from '@/utils/cn';
import { UploadCloud, Loader2, Trash2, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  description?: string;
  value?: string;
  folder?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({
  label,
  description,
  value = '',
  folder = 'general',
  onChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = resolveMediaUrl(value);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const res = await mediaService.uploadImage(file, folder);
      if (res.isSuccess && res.data) {
        onChange(res.data);
      } else {
        setError(res.message || 'Görsel yüklenemedi.');
      }
    } catch {
      setError('Görsel yüklenirken beklenmeyen bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemove = () => {
    setError(null);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-semibold text-slate-700 text-xs">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {value && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/70 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Değiştir</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/70 transition"
            >
              <Trash2 className="w-3 h-3" />
              <span>Kaldır</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          dragActive
            ? 'border-amber-500 bg-amber-50/60'
            : 'border-slate-200 bg-slate-50/70 hover:border-amber-400 hover:bg-slate-50'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Loader2 className="w-7 h-7 text-amber-600 animate-spin mb-2" />
            <span className="text-xs font-semibold text-slate-700">
              Görsel sunucuya yükleniyor...
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Lütfen bekleyin
            </span>
          </div>
        ) : previewUrl ? (
          <div className="p-3 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0 w-full space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Aktif Görsel Önizlemesi</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 truncate bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                {value}
              </p>
              <p className="text-[11px] text-slate-400">
                Yeni bir görsel yüklemek için bu alana tıklayın veya dosyayı sürükleyip bırakın.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-2.5">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Görsel seçmek için tıklayın veya buraya sürükleyin
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              PNG, JPG, WEBP veya GIF (Maks. 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
