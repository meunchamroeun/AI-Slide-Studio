'use client';

import React from 'react';
import { Check, Languages } from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="language-toggle"
          className={cn(
            'relative inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer',
            className
          )}
          aria-label={t.common.language}
          title={t.common.language}
        >
          <Languages className="size-4" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold tracking-tight text-foreground ring-1 ring-border shadow-xs">
            {locale === 'kh' ? 'KH' : 'EN'}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-44 text-xs bg-card border-border/80">
        <div className="px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
          {t.common.language}
        </div>
        <DropdownMenuItem
          onClick={() => setLocale('kh')}
          className={cn(
            'flex cursor-pointer items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium outline-none transition-colors',
            locale === 'kh' && 'bg-accent/70 text-foreground font-semibold'
          )}
        >
          <span className="flex items-center gap-2">
            <Languages className="size-3.5 text-muted-foreground" />
            <span>ភាសាខ្មែរ (KH)</span>
          </span>
          {locale === 'kh' && <Check className="size-3.5 text-brand" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={cn(
            'flex cursor-pointer items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium outline-none transition-colors',
            locale === 'en' && 'bg-accent/70 text-foreground font-semibold'
          )}
        >
          <span className="flex items-center gap-2">
            <Languages className="size-3.5 text-muted-foreground" />
            <span>English (EN)</span>
          </span>
          {locale === 'en' && <Check className="size-3.5 text-brand" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
