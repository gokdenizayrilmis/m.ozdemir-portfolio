import Link from 'next/link';
import { Treatment } from '@/types';
import { ArrowRight } from 'lucide-react';
import { resolveMediaUrl } from '@/utils/cn';

interface TreatmentCardProps {
  treatment: Treatment;
}

export default function TreatmentCard({ treatment }: TreatmentCardProps) {
  const imageUrl = resolveMediaUrl(
    treatment.coverImageUrl,
    '/uploads/corporate/hero-showroom.jpg'
  );

  return (
    <Link
      href={`/${treatment.slug}`}
      className="group h-full bg-white rounded-3xl p-3 sm:p-3.5 border border-bronze-200/80 shadow-sm hover:shadow-xl hover:shadow-bronze-900/10 hover:border-bronze-400/90 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-peach-50 border border-bronze-100/80">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={treatment.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>

      <div className="pt-3.5 pb-2 px-2 flex-1 flex flex-col justify-between gap-2">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-[15px] font-sans font-bold text-espresso-900 group-hover:text-bronze-700 transition-colors leading-snug">
              {treatment.title}
            </h3>
            <span className="w-6 h-6 rounded-full bg-peach-50 text-bronze-600 group-hover:bg-bronze-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors mt-0.5">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {treatment.summary && (
            <span className="block text-xs text-espresso-800/70 leading-relaxed line-clamp-2">
              {treatment.summary}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
