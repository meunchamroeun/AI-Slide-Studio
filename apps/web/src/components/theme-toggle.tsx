'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useI18n } from '@/components/i18n-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;
  const label = isDark ? t.common.themeLight : t.common.themeDark;

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer',
        className
      )}
      aria-label={`${t.common.theme}: ${label}`}
      title={`${t.common.theme}: ${label}`}
    >
      <span className="sr-only">{label}</span>
      <Sun
        className={cn(
          'size-4 transition-transform duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        className={cn(
          'absolute size-4 transition-transform duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        )}
      />
    </button>
  );
}
