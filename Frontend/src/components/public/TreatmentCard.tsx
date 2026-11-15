import Link from 'next/link';
import { Treatment } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TreatmentCardProps {
  treatment: Treatment;
}

export default function TreatmentCard({ treatment }: TreatmentCardProps) {
  return (
    <article className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/50">
            <Sparkles className="w-3 h-3 text-amber-600" />
            {treatment.categorySlug.replace('-', ' ').toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Uzman Hekim
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 group-hover:text-amber-800 transition line-clamp-1 mb-2.5">
          <Link href={`/${treatment.slug}`}>{treatment.title}</Link>
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">
          {treatment.summary}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500">
          {treatment.faqs?.length
            ? `${treatment.faqs.length} SSS Yanıtı`
            : 'Detaylı Bilgi'}
        </span>
        <Link
          href={`/${treatment.slug}`}
          className="inline-flex items-center gap-1.5 text-amber-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition font-medium"
        >
          <span>Tedaviyi İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

