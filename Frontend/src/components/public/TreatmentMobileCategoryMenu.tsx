'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Treatment } from '@/types';
import { ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';

interface TreatmentMobileCategoryMenuProps {
  categoryLabel: string;
  treatments: Treatment[];
  activeSlug: string;
}

export default function TreatmentMobileCategoryMenu({
  categoryLabel,
  treatments,
  activeSlug,
}: TreatmentMobileCategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!treatments || treatments.length === 0) return null;

  return (
    <div className="lg:hidden bg-white rounded-2xl border border-bronze-200/80 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left bg-gradient-to-r from-peach-50/80 via-white to-peach-50/50 hover:bg-peach-50/90 transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-bronze-600/10 border border-bronze-300/60 flex items-center justify-center text-bronze-700 shrink-0">
            <FolderOpen className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-espresso-900 truncate">
            {categoryLabel} Branşındaki Diğer Tedaviler ({treatments.length})
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-bronze-700 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-bronze-100 max-h-80 overflow-y-auto divide-y divide-bronze-100/60 bg-white">
          {treatments.map((item) => {
            const isActive = item.slug === activeSlug;
            return (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm transition ${
                  isActive
                    ? 'border-l-4 border-l-bronze-600 bg-peach-50/90 font-bold text-espresso-900'
                    : 'text-espresso-800/80 hover:bg-peach-50/40 hover:text-espresso-900 font-medium'
                }`}
              >
                <span className="truncate">{item.title}</span>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-bronze-700' : 'text-bronze-400'
                  }`}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
