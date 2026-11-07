import { en } from '@/locales/en';
import { kh } from '@/locales/kh';

export type Locale = 'en' | 'kh';

export const defaultLocale: Locale = 'en';

export const translations = {
  en,
  kh,
} as const;

export type TranslationType = typeof en;

export { en, kh };
