'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { FaqItem } from '@/types';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
}

export default function FaqAccordion({
  faqs,
  title = 'Sıkça Sorulan Sorular',
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="my-12 bg-white rounded-2xl p-6 sm:p-8 border border-bronze-200/80 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-peach-50 rounded-xl text-bronze-700 border border-peach-200/70">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-espresso-900">
            {title}
          </h2>
          <p className="text-xs text-bronze-700/80 mt-0.5">
            Dermatoloji Uzmanı Prof. Dr. Mustafa Özdemir&apos;in yanıtladığı en sık
            sorular
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-bronze-100 rounded-xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-clinic-canvas/70 hover:bg-peach-50/70 transition"
              >
                <span className="font-semibold text-espresso-900 text-sm sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-bronze-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-bronze-700' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 text-espresso-800/85 text-sm sm:text-base leading-relaxed bg-white border-t border-bronze-100">
                      {faq.answer}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
