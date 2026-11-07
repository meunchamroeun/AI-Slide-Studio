'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { useI18n } from '@/components/i18n-provider';

export function AuthTopBar() {
  const { t } = useI18n();

  return (
    <header className="absolute top-0 inset-x-0 h-16 px-6 flex items-center justify-between z-20">
      <Link
        href="/"
        className="flex items-center gap-2 font-serif text-sm font-medium text-foreground/90 hover:text-foreground transition-colors"
      >
        <LogoMark className="size-5 text-brand" />
        <span>SlideStudio<span className="text-brand">.ai</span></span>
      </Link>

      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <span className="h-4 w-px bg-border/60" />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 bg-secondary/50 border border-border/60 hover:bg-secondary transition-all"
        >
          <ArrowLeft className="size-3.5" />
          <span>{t.auth.backToStudio}</span>
        </Link>
      </div>
    </header>
  );
}
