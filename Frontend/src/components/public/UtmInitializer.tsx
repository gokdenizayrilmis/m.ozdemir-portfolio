'use client';

import { useUtmTracker } from '@/hooks/use-utm-tracker';

export default function UtmInitializer() {
  useUtmTracker();
  return null;
}

