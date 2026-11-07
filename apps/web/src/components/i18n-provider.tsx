'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { defaultLocale, type Locale, translations, type TranslationType } from '@/lib/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: TranslationType;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'slidestudio_locale';

function getClientSnapshot(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'kh' || stored === 'en') return stored;
  return defaultLocale;
}

function getServerSnapshot(): Locale {
  return defaultLocale;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('slidestudio_locale_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('slidestudio_locale_change', callback);
  };
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const currentLocale = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const htmlLang = currentLocale === 'kh' ? 'km' : 'en';
    document.documentElement.lang = htmlLang;
    document.documentElement.setAttribute('data-lang', currentLocale);
  }, [currentLocale]);

  const setLocale = (next: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
      const htmlLang = next === 'kh' ? 'km' : 'en';
      document.documentElement.lang = htmlLang;
      document.documentElement.setAttribute('data-lang', next);
      window.dispatchEvent(new Event('slidestudio_locale_change'));
    } catch {
      // storage unavailable
    }
  };

  const toggleLocale = () => {
    setLocale(currentLocale === 'kh' ? 'en' : 'kh');
  };

  const activeTranslations = translations[currentLocale] || translations[defaultLocale];

  return (
    <I18nContext.Provider
      value={{
        locale: currentLocale,
        setLocale,
        toggleLocale,
        t: activeTranslations,
        isReady: mounted,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: defaultLocale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: translations[defaultLocale],
      isReady: false,
    };
  }
  return ctx;
}
