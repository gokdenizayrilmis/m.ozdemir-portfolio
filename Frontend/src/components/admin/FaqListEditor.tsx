'use client';

import { FaqItem } from '@/types';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

interface FaqListEditorProps {
  faqs: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
}

export default function FaqListEditor({ faqs, onChange }: FaqListEditorProps) {
  const handleAddFaq = () => {
    onChange([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  const handleUpdate = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const next = [...faqs];
    next[index] = {
      ...next[index],
      [field]: value,
    };
    onChange(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sıkça Sorulan Sorular (Google FAQ Schema)
            </h3>
            <p className="text-xs text-slate-500">
              Eklediğiniz her soru otomatik olarak Google FAQPage Schema verisine
              dönüştürülür
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddFaq}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Soru Ekle</span>
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          Henüz SSS eklenmemiş. &quot;Yeni Soru Ekle&quot; butonuna tıklayarak ilk
          soruyu ekleyin.
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Soru #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(index)}
                  className="text-slate-400 hover:text-red-500 transition p-1"
                  aria-label={`Soru ${index + 1} sil`}
                  title="Soruyu Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Soru: Örn: Lazerle leke tedavisi kaç seans sürer?"
                  value={faq.question}
                  onChange={(e) =>
                    handleUpdate(index, 'question', e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-medium"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="Cevap: Lekenin derinliğine göre 3-6 seans arası planlanmaktadır..."
                  value={faq.answer}
                  onChange={(e) => handleUpdate(index, 'answer', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

