'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // In dev mode, unregister leftover workers and clear old caches to avoid serving stale hot-reloaded code
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      caches?.keys().then((keys) => {
        keys.filter((k) => k.startsWith('slidestudio-')).forEach((k) => caches.delete(k));
      });
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => console.error('Service worker registration failed:', err));
  }, []);

  return null;
}
