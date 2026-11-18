'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence, m } from 'motion/react';
import { Category, Treatment } from '@/types';
import TreatmentCard from '@/components/public/TreatmentCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TreatmentsShowcaseProps {
  categories: Category[];
  treatments: Treatment[];
}

export default function TreatmentsShowcase({
  categories,
  treatments,
}: TreatmentsShowcaseProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const sortedTreatments = useMemo(
    () =>
      [...treatments].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      ),
    [treatments]
  );

  const filteredTreatments = useMemo(() => {
    if (activeTab === 'all') return sortedTreatments;
    return sortedTreatments.filter((t) => t.categorySlug === activeTab);
  }, [activeTab, sortedTreatments]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === activeTab),
    [activeTab, categories]
  );

  return (
    <section
      id="uzmanlik-alanlari"
      className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10"
    >
      {/* Centered Editorial Heading */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-50 border border-peach-200 text-espresso-800 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-bronze-700 shrink-0" />
          <span>Uzmanlık Branşları &amp; Tedavilerimiz</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight text-espresso-900 leading-tight">
          Dermatolojik Hastalık Tedavileri, Kozmetik ve Lazer Uygulamaları
        </h2>
        <div className="w-14 h-1 bg-bronze-600 rounded-full mx-auto" />
        <p className="text-xs sm:text-sm text-espresso-800/75 leading-relaxed pt-1">
          Cildinizin tüm ihtiyaçlarına kanıta dayalı modern dermatoloji ile
          cevap veriyoruz. İlgilendiğiniz uzmanlık dalını seçebilir veya tüm
          klinik tedavi başlıklarımızı doğrudan inceleyebilirsiniz.
        </p>
      </div>

      {/* Responsive Filter Tabs (Swipeable on Mobile, Centered on Desktop) */}
      <div className="flex items-center sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold border transition-all ${
            activeTab === 'all'
              ? 'bg-espresso-900 text-white border-espresso-900 shadow-md'
              : 'bg-white text-espresso-800 border-bronze-200/90 hover:border-bronze-500 hover:bg-peach-50/60'
          }`}
        >
          Tüm Tedaviler ({sortedTreatments.length})
        </button>

        {categories.map((cat) => {
          const count = sortedTreatments.filter(
            (t) => t.categorySlug === cat.slug
          ).length;
          const isActive = activeTab === cat.slug;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.slug)}
              className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold border transition-all ${
                isActive
                  ? 'bg-bronze-700 text-white border-bronze-700 shadow-md'
                  : 'bg-white text-espresso-800 border-bronze-200/90 hover:border-bronze-500 hover:bg-peach-50/60'
              }`}
            >
              {cat.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Optional Selected Category Summary Banner */}
      {activeCategory && (
        <div className="bg-white rounded-2xl px-5 py-4 border border-bronze-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-espresso-800/85 leading-relaxed">
            <strong className="text-espresso-900 font-serif">
              {activeCategory.title}:
            </strong>{' '}
            {activeCategory.description}
          </p>
          <Link
            href={`/kategori/${activeCategory.slug}`}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-bronze-700 hover:text-espresso-900 transition"
          >
            <span>Kategori Sayfasına Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4-Column Visual Card Grid */}
      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {filteredTreatments.map((t) => (
            <TreatmentCard key={t.id} treatment={t} />
          ))}
        </m.div>
      </AnimatePresence>
    </section>
  );
}
