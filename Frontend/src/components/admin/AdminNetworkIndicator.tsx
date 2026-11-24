'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Loader2 } from 'lucide-react';
import {
  networkActivity,
  NetworkActivityKind,
} from '@/utils/network-activity';

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 350;

const KIND_LABELS: Record<NetworkActivityKind, string> = {
  read: 'Veriler senkronize ediliyor...',
  write: 'Değişiklikler kaydediliyor...',
  delete: 'Kayıt siliniyor...',
  upload: 'Görsel yükleniyor...',
  auth: 'Oturum yenileniyor...',
};

export default function AdminNetworkIndicator() {
  const snapshot = useSyncExternalStore(
    networkActivity.subscribe,
    networkActivity.getSnapshot,
    networkActivity.getServerSnapshot
  );

  const isActive = snapshot.activeCount > 0;
  const [visible, setVisible] = useState(false);

  const shownAtRef = useRef<number | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isActive) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (!visible && !showTimerRef.current) {
        showTimerRef.current = setTimeout(() => {
          showTimerRef.current = null;
          shownAtRef.current = Date.now();
          setVisible(true);
        }, SHOW_DELAY_MS);
      }
    } else {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (visible && !hideTimerRef.current) {
        const elapsed = shownAtRef.current
          ? Date.now() - shownAtRef.current
          : MIN_VISIBLE_MS;
        const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

        hideTimerRef.current = setTimeout(() => {
          hideTimerRef.current = null;
          shownAtRef.current = null;
          setVisible(false);
        }, remaining);
      }
    }
  }, [isActive, visible]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const label = KIND_LABELS[snapshot.currentKind] || KIND_LABELS.read;

  return (
    <>
      {/* 1. Top Slim Progress Bar */}
      <AnimatePresence>
        {visible && (
          <m.div
            key="admin-top-progress"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] pointer-events-none overflow-hidden bg-slate-200/40"
          >
            <m.div
              initial={{ x: '-65%', width: '65%' }}
              animate={{ x: '100%' }}
              exit={{ x: '0%', width: '100%' }}
              transition={{
                repeat: Infinity,
                repeatType: 'loop',
                duration: 1.15,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-500 to-indigo-500 rounded-full"
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* 2. Bottom-Right Floating Micro-Pill */}
      <AnimatePresence>
        {visible && (
          <m.div
            key="admin-network-pill"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="fixed bottom-5 right-5 z-[95] pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.10)] rounded-full px-3.5 py-2 flex items-center gap-2.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
              <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                {label}
              </span>
              {snapshot.activeCount > 1 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums leading-none">
                  {snapshot.activeCount}
                </span>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
