'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Layers,
  Monitor,
  X,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/components/i18n-provider';

interface PromptGeneratorHeroProps {
  onStartGenerating: (promptText: string) => void;
}

export function PromptGeneratorHero({ onStartGenerating }: PromptGeneratorHeroProps) {
  const [prompt, setPrompt] = useState('');
  const { t, locale } = useI18n();

  const suggestions = t.hero.suggestions || [
    '10-slide pitch for a Next-Gen AI Risk & Compliance Platform',
    '8-slide technical overview of Distributed Vector Indexing',
    '6-slide quarterly executive report on sales and revenue metrics',
    '7-slide strategic vision for automated cloud observability',
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (prompt.trim()) {
      onStartGenerating(prompt.trim());
    }
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-5 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-border/50 transition-all duration-300">
      {/* Specular top border highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* Decorative ambient warm gradient glow orbs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative z-10 w-full space-y-6">
        {/* Header row: badge + telemetry chips */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/80 text-xs font-medium text-foreground">
            <span className="size-2 rounded-full bg-brand animate-pulse" />
            <Sparkles className="size-3.5 text-brand" />
            <span>{t.hero.tag}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
              <Cpu className="size-3.5 text-brand" />
              {t.hero.geminiReady}
            </span>
            <span className="text-border">&bull;</span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              {t.hero.offlineExport}
            </span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.18]">
            {t.hero.titlePrefix}{' '}
            <span className="italic font-normal bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              {t.hero.titleAccent}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl font-light">
            {t.hero.description}
          </p>
        </div>

        {/* Prompt Composer */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative rounded-2xl border border-border/80 bg-background/50 p-3 sm:p-4 shadow-inner focus-within:border-brand/70 focus-within:ring-2 focus-within:ring-brand/20 transition-all backdrop-blur-sm">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.hero.placeholder}
              rows={4}
              className="w-full resize-none border-0 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 shadow-none p-0 leading-relaxed"
            />

            {/* Bottom Controls Row inside composer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-2 border-t border-border/50">
              {/* Parameter indicators */}
              <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground">
                  <Layers className="size-3 text-brand" />
                  <span>8 {locale === 'kh' ? 'ស្លាយ' : 'Slides'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground">
                  <Monitor className="size-3 text-brand" />
                  <span>16:9</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground">
                  <Palette className="size-3 text-brand" />
                  <span>Modern Dark</span>
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {prompt.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrompt('')}
                    className="h-9 px-3 rounded-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3.5 mr-1" />
                    <span>{locale === 'kh' ? 'សម្អាត' : 'Clear'}</span>
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="rounded-full bg-primary hover:opacity-95 text-primary-foreground text-xs sm:text-sm font-semibold px-6 h-10 shadow-lg shadow-brand/10 gap-2 cursor-pointer transition-all duration-200"
                >
                  <Sparkles className="size-4 text-brand" />
                  <span>{t.hero.configureGenerate}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground/80 font-medium mr-1">
              {t.hero.quickPrompts}
            </span>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(item)}
                className="text-[11px] bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground px-3 py-1 rounded-full border border-border/50 transition-colors cursor-pointer text-left truncate max-w-[280px]"
              >
                {item}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
