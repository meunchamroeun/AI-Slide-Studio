'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  LayoutTemplate,
  Sliders,
  ShieldCheck,
  FileCode,
  Github,
  Monitor,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { useI18n } from '@/components/i18n-provider';

export function SiteFooter() {
  const { t, locale } = useI18n();

  return (
    <footer className="border-t border-border/60 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 py-12 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Logo href="/" />
          <p className="text-[11px] text-muted-foreground/80 max-w-sm mt-2">
            {locale === 'kh'
              ? 'ម៉ាស៊ីនបង្កើតបទបង្ហាញ និងស្លាយចលនាដោយ AI ភ្ជាប់ជាមួយការទាញយក HTML ដោយឯករាជ្យ ១០០%។'
              : 'AI-Powered Presentation Generator with structured Gemini intelligence, GSAP motion, and 100% offline HTML export.'}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <LayoutTemplate className="size-3.5 text-brand" />
            <span>{t.nav.templates}</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Sparkles className="size-3.5 text-brand" />
            <span>{locale === 'kh' ? 'ស្ទូឌីយោ' : 'Studio'}</span>
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Sliders className="size-3.5" />
            <span>{t.nav.settings}</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ShieldCheck className="size-3.5" />
            <span>{locale === 'kh' ? 'ចូលប្រើប្រព័ន្ធ' : 'Sign In'}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3 pt-2 sm:pt-0">
          <LanguageToggle />
          <ThemeToggle />
          <p className="text-[11px] text-muted-foreground pl-2 border-l border-border/50">
            © {new Date().getFullYear()} SlideStudio.ai ·{' '}
            {locale === 'kh' ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
