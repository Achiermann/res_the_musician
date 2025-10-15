'use client';
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const onLoad = () => {
        navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' });
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);
  return null;
}
