"use client";
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AnalyticsTracker({ gaId, fbPixelId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = pathname;
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      
      // GA4 Page View tracking
      if (gaId && typeof window.gtag === 'function') {
        window.gtag('config', gaId, {
          page_path: url,
        });
      }

      // Meta Pixel Page View tracking
      if (fbPixelId && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
    }
  }, [pathname, searchParams, gaId, fbPixelId]);

  return null;
}
