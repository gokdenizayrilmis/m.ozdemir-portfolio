'use client';

import { useEffect, useCallback } from 'react';
import { UtmData } from '@/types';
import { leadService } from '@/services';

const STORAGE_KEY = 'clinic_utm_data';
const CLICK_COOLDOWN_MS = 5000;
const recentClickTimestamps = new Map<string, number>();

export function initializeUtmTracking(): void {
  if (typeof window === 'undefined') return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || undefined;
    const utmMedium = urlParams.get('utm_medium') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || undefined;

    if (utmSource || utmMedium || utmCampaign) {
      const data: UtmData = { utmSource, utmMedium, utmCampaign };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // SessionStorage might fail in strict private modes; gracefully ignore.
  }
}

export function getStoredUtmData(): UtmData {
  if (typeof window === 'undefined') return {};

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmData) : {};
  } catch {
    return {};
  }
}

export function trackConversionClick(
  conversionType: 'WhatsAppClick' | 'PhoneClick',
  sourcePageSlug?: string
): void {
  if (typeof window === 'undefined') return;

  const currentPath = sourcePageSlug || window.location.pathname;
  const throttleKey = `${conversionType}:${currentPath}`;
  const now = Date.now();
  const lastTrackedAt = recentClickTimestamps.get(throttleKey) ?? 0;

  if (now - lastTrackedAt < CLICK_COOLDOWN_MS) {
    return;
  }
  recentClickTimestamps.set(throttleKey, now);

  const utm = getStoredUtmData();

  try {
    // 1. Fire GTM / GA4 dataLayer & gtag event for Google Ads Smart Bidding
    if (typeof window !== 'undefined') {
      const eventName =
        conversionType === 'WhatsAppClick'
          ? 'whatsapp_conversion'
          : 'phone_conversion';
      const eventParams = {
        conversion_type: conversionType,
        source_page: currentPath,
        utm_source: utm.utmSource || 'direct',
        utm_medium: utm.utmMedium || 'none',
        utm_campaign: utm.utmCampaign || 'organic',
      };

      const win = window as unknown as {
        dataLayer?: unknown[];
        gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
      };

      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({
        event: eventName,
        ...eventParams,
      });

      if (typeof win.gtag === 'function') {
        win.gtag('event', eventName, eventParams);
      }
    }

    // 2. Non-blocking micro-conversion tracking via central leadService
    void leadService.trackClick({
      conversionType,
      sourcePageSlug: currentPath,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
    });
  } catch {
    // Non-blocking catch
  }
}

export function useUtmTracker() {
  useEffect(() => {
    initializeUtmTracking();
  }, []);

  const trackClick = useCallback(
    (conversionType: 'WhatsAppClick' | 'PhoneClick', sourcePageSlug?: string) => {
      trackConversionClick(conversionType, sourcePageSlug);
    },
    []
  );

  return {
    getUtmData: getStoredUtmData,
    trackClick,
  };
}

