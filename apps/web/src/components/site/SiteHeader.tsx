'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  LayoutTemplate,
  Cpu,
  Layers,
  ArrowRight,
  LogIn,
  Sliders,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { useI18n } from '@/components/i18n-provider';

export function SiteHeader({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const { user } = useAuth();
  const { t, locale } = useI18n();

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand Logo */}
        <Logo href="/" />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Link
            href="#features"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            {locale === 'kh' ? 'លក្ខណៈពិសេស' : 'Features'}
          </Link>
          <Link
            href="/templates"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            {t.nav.templates}
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            {locale === 'kh' ? 'របៀបដំណើរការ' : 'How it works'}
          </Link>
          <Link
            href="/settings"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            {locale === 'kh' ? 'បច្ចេកវិទ្យា' : 'Technology'}
          </Link>
          <Link
            href="#pricing"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            {locale === 'kh' ? 'តម្លៃ' : 'Pricing'}
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />

          <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-foreground text-xs font-semibold px-3 gap-1.5"
                >
                  <Link href="/admin">
                    <ShieldCheck className="size-3.5 text-amber-500" />
                    <span>{locale === 'kh' ? 'ផ្ទាំងគ្រប់គ្រង Admin' : 'Admin Console'}</span>
                  </Link>
                </Button>
              )}
              <Button
                asChild
                size="sm"
                className="h-8 rounded-full bg-primary text-primary-foreground hover:opacity-95 text-xs font-medium px-3.5 shadow-sm gap-1.5"
              >
                <Link href="/dashboard">
                  <Sparkles className="size-3.5 text-brand" />
                  <span>{locale === 'kh' ? 'ចូលស្ទូឌីយោ' : 'Studio Dashboard'}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground px-3"
              >
                <Link href="/login">
                  <LogIn className="size-3.5 mr-1 text-muted-foreground" />
                  <span>{t.common.signIn}</span>
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-8 rounded-full bg-primary text-primary-foreground hover:opacity-95 text-xs font-medium px-3.5 shadow-sm gap-1.5"
              >
                <Link href="/login">
                  <Sparkles className="size-3.5 text-brand" />
                  <span>{locale === 'kh' ? 'សាកល្បងឥតគិតថ្លៃ' : 'Start Free'}</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
