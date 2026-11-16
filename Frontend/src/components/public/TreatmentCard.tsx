import Link from 'next/link';
import { Treatment } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { resolveMediaUrl } from '@/utils/cn';

interface TreatmentCardProps {
  treatment: Treatment;
}

export default function TreatmentCard({ treatment }: TreatmentCardProps) {
  const imageUrl = resolveMediaUrl(treatment.coverImageUrl);

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-bronze-200/80 hover:border-bronze-500/70 hover:shadow-xl hover:shadow-bronze-900/5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {imageUrl && (
          <Link
            href={`/${treatment.slug}`}
            className="block relative h-48 w-full overflow-hidden bg-peach-50 border-b border-bronze-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={treatment.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        )}

        <div className="p-6 sm:p-7 pb-0">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-peach-50 text-bronze-800 border border-peach-200/70">
              <Sparkles className="w-3 h-3 text-bronze-600" />
              {treatment.categorySlug.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-xs text-bronze-500 font-medium">
              Uzman Hekim
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-serif font-bold text-espresso-900 group-hover:text-bronze-700 transition line-clamp-1 mb-2.5">
            <Link href={`/${treatment.slug}`}>{treatment.title}</Link>
          </h3>

          <p className="text-espresso-800/75 text-sm leading-relaxed line-clamp-3 mb-6">
            {treatment.summary}
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-7 pb-6 pt-4 border-t border-bronze-100 flex items-center justify-between text-xs font-semibold">
        <span className="text-bronze-600">
          {treatment.faqs?.length
            ? `${treatment.faqs.length} SSS Yanıtı`
            : 'Detaylı Bilgi'}
        </span>
        <Link
          href={`/${treatment.slug}`}
          className="inline-flex items-center gap-1.5 text-bronze-700 group-hover:text-espresso-900 group-hover:translate-x-0.5 transition font-medium"
        >
          <span>Tedaviyi İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
