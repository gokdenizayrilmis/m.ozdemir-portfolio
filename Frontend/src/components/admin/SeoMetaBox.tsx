'use client';

import { SeoMetadata } from '@/types';
import { Search, Globe } from 'lucide-react';

interface SeoMetaBoxProps {
  seo: SeoMetadata;
  slug: string;
  defaultTitle?: string;
  onChange: (updatedSeo: SeoMetadata) => void;
}

export default function SeoMetaBox({
  seo,
  slug,
  defaultTitle = '',
  onChange,
}: SeoMetaBoxProps) {
  const title = seo.metaTitle || defaultTitle;
  const description = seo.metaDescription || '';
  const currentSlug = slug || 'ornek-tedavi-sayfasi';

  // Google SERP thresholds
  const titleLen = title.length;
  const descLen = description.length;

  const titleStatus =
    titleLen === 0
      ? 'empty'
      : titleLen <= 60
      ? 'good'
      : titleLen <= 70
      ? 'warning'
      : 'danger';

  const descStatus =
    descLen === 0
      ? 'empty'
      : descLen >= 120 && descLen <= 160
      ? 'good'
      : descLen < 120
      ? 'short'
      : 'danger';

  const handleFieldChange = (field: keyof SeoMetadata, value: unknown) => {
    onChange({
      ...seo,
      [field]: value,
    });
  };

  const handleKeywordsChange = (val: string) => {
    const list = val
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    handleFieldChange('focusKeywords', list);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rank Math Tarzı Google SERP & SEO Ayarları
            </h3>
            <p className="text-xs text-slate-500">
              Google arama sonuçlarında nasıl görüneceğini canlı olarak izleyin
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
          Google Uyumlu
        </span>
      </div>

      {/* Live Google Search Preview (SERP Snippet) */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>https://drmustafaozdemir.com › {currentSlug}</span>
        </div>
        <h4 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
          {title || 'Sayfa Başlığı Buraya Gelecek | Prof. Dr. Mustafa Özdemir'}
        </h4>
        <p className="text-xs sm:text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
          {description ||
            'Arama motorlarında sayfanızın altında görünecek olan 120-160 karakterlik açıklama metni. İçeriğinizi ve hedeflenen klinik tedaviyi özetleyin.'}
        </p>
      </div>

      {/* Meta Title Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-800">
            SEO Başlığı (Meta Title)
          </label>
          <span
            className={`text-xs font-medium ${
              titleStatus === 'good'
                ? 'text-emerald-600'
                : titleStatus === 'warning'
                ? 'text-amber-600'
                : 'text-red-500'
            }`}
          >
            {titleLen} / 60 karakter
          </span>
        </div>
        <input
          type="text"
          value={seo.metaTitle}
          onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
          placeholder="Örn: Lazerle Leke Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
        />
        {/* Progress indicator */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              titleStatus === 'good'
                ? 'bg-emerald-500'
                : titleStatus === 'warning'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((titleLen / 60) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Meta Description Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-800">
            SEO Açıklaması (Meta Description)
          </label>
          <span
            className={`text-xs font-medium ${
              descStatus === 'good'
                ? 'text-emerald-600'
                : descStatus === 'short'
                ? 'text-amber-600'
                : 'text-red-500'
            }`}
          >
            {descLen} / 160 karakter
          </span>
        </div>
        <textarea
          rows={3}
          value={seo.metaDescription}
          onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
          placeholder="Google arama sonuçlarında gösterilecek, tıklama oranını (CTR) artıran bilgilendirici meta açıklama..."
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
        />
        {/* Progress indicator */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              descStatus === 'good'
                ? 'bg-emerald-500'
                : descStatus === 'short'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Focus Keywords */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
          Odak Anahtar Kelimeler (Virgülle Ayırarak Yazın)
        </label>
        <input
          type="text"
          value={seo.focusKeywords ? seo.focusKeywords.join(', ') : ''}
          onChange={(e) => handleKeywordsChange(e.target.value)}
          placeholder="lazerle leke tedavisi, melazma tedavisi, bakırköy dermatolog"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
        />
      </div>

      {/* Schema Type & NoIndex */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Schema.org Yapısal Veri Tipi
          </label>
          <select
            value={seo.schemaType || 'MedicalWebPage'}
            onChange={(e) => handleFieldChange('schemaType', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
            <option value="MedicalWebPage">
              MedicalWebPage (Klinik Tedavi Sayfası)
            </option>
            <option value="MedicalScholarlyArticle">
              MedicalScholarlyArticle (Blog / Makale)
            </option>
            <option value="ItemPage">ItemPage (Genel Sayfa)</option>
          </select>
        </div>

        <div className="flex items-center sm:justify-center pt-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={seo.noIndex}
              onChange={(e) => handleFieldChange('noIndex', e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Bu sayfayı arama motorlarına kapat (noindex)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

