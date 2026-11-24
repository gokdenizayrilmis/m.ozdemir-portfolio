'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

interface AnalyticsScriptsProps {
  gtmId?: string | null;
  ga4Id?: string | null;
}

export default function AnalyticsScripts({
  gtmId,
  ga4Id,
}: AnalyticsScriptsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cleanGtmId = gtmId?.trim();
  const cleanGa4Id = ga4Id?.trim();

  // Track SPA route changes (Next.js App Router Link navigations) immediately
  useEffect(() => {
    if (!pathname || typeof window === 'undefined') return;

    // Wait one tick so Next.js updates document.title for the new route
    const timer = setTimeout(() => {
      const query = searchParams?.toString();
      const pagePath = query ? `${pathname}?${query}` : pathname;
      const pageTitle = document.title;

      const win = window as unknown as {
        dataLayer?: unknown[];
        gtag?: (
          command: string,
          targetIdOrAction: string,
          params?: Record<string, unknown>
        ) => void;
      };

      if (cleanGa4Id && typeof win.gtag === 'function') {
        win.gtag('event', 'page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: pagePath,
          send_to: cleanGa4Id,
        });
      }

      if (cleanGtmId) {
        win.dataLayer = win.dataLayer || [];
        win.dataLayer.push({
          event: 'virtual_page_view',
          page_title: pageTitle,
          page_path: pagePath,
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, cleanGa4Id, cleanGtmId]);

  if (!cleanGtmId && !cleanGa4Id) {
    return null;
  }

  return (
    <>
      {/* 1. Google Tag Manager (GTM) */}
      {cleanGtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${cleanGtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${cleanGtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* 2. Google Analytics 4 (GA4 - gtag.js) */}
      {cleanGa4Id && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${cleanGa4Id}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${cleanGa4Id}', {
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
