'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ShieldCheck, X, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  triggerAriaLabel: string;
  triggerClassName?: string;
  titleClassName?: string;
  footerLabel?: string;
  footerActionLabel?: string;
  children: React.ReactNode;
}

export default function ImageLightboxModal({
  title,
  subtitle,
  imageUrl,
  triggerAriaLabel,
  triggerClassName = '',
  titleClassName = 'text-sm font-serif font-bold',
  footerLabel,
  footerActionLabel,
  children,
}: ImageLightboxModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={triggerAriaLabel}
        className={triggerClassName}
      >
        {children}
      </button>

      {footerLabel && footerActionLabel && (
        <div className="px-5 py-4 bg-clinic-canvas/60 border-t border-bronze-100 flex items-center justify-between gap-3">
          <span className="text-xs sm:text-sm font-bold text-espresso-900">
            {footerLabel}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-peach-50 border border-bronze-200 text-bronze-700 hover:text-espresso-900 text-xs font-semibold transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>{footerActionLabel}</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-espresso-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-bronze-300 flex flex-col"
            >
              <div className="px-6 py-4 bg-espresso-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-peach-200 shrink-0" />
                  <div>
                    <h3 className={titleClassName}>{title}</h3>
                    <p className="text-[11px] text-peach-100/80">{subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Görseli Kapat"
                  className="p-1.5 rounded-lg text-peach-100 hover:text-white hover:bg-espresso-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 bg-clinic-canvas flex-1 overflow-y-auto flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title}
                  className="max-h-[72vh] w-auto object-contain rounded-xl shadow-md"
                />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
