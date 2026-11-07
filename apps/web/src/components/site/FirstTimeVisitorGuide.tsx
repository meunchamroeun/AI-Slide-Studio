'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Cpu,
  Layers,
  Download,
  ArrowRight,
  ChevronRight,
  X,
  Compass,
  CheckCircle2,
  MousePointerClick,
  LayoutTemplate,
  Monitor,
} from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FirstTimeVisitorGuideProps {
  onSelectSamplePrompt: (promptText: string) => void;
  onOpenCreate: (promptText?: string) => void;
}

const easeQuint = [0.16, 1, 0.3, 1] as const;

export function FirstTimeVisitorGuide({
  onSelectSamplePrompt,
  onOpenCreate,
}: FirstTimeVisitorGuideProps) {
  const { t, locale } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('slidestudio_guide_collapsed');
      if (stored === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('slidestudio_guide_collapsed', String(next));
    } catch {
      // Ignore
    }
  };

  const steps = [
    {
      step: t.guide.step1.step,
      title: t.guide.step1.title,
      desc: t.guide.step1.desc,
      badge: t.guide.step1.badge,
      icon: Sparkles,
      iconColor: 'text-amber-400',
      action: () => {
        const sample =
          locale === 'kh'
            ? 'ស្លាយបទបង្ហាញ ១០ ទំព័រអំពីវេទិកា AI គ្រប់គ្រងហានិភ័យ និងអនុលោមភាព'
            : '10-slide pitch for a Next-Gen AI Risk & Compliance Platform';
        onSelectSamplePrompt(sample);
      },
      actionText: t.guide.trySample,
    },
    {
      step: t.guide.step2.step,
      title: t.guide.step2.title,
      desc: t.guide.step2.desc,
      badge: t.guide.step2.badge,
      icon: Cpu,
      iconColor: 'text-sky-400',
      action: () => onOpenCreate(''),
      actionText: t.guide.launchGenerator,
    },
    {
      step: t.guide.step3.step,
      title: t.guide.step3.title,
      desc: t.guide.step3.desc,
      badge: t.guide.step3.badge,
      icon: Layers,
      iconColor: 'text-purple-400',
    },
    {
      step: t.guide.step4.step,
      title: t.guide.step4.title,
      desc: t.guide.step4.desc,
      badge: t.guide.step4.badge,
      icon: Download,
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="w-full border-b border-border/60 bg-gradient-to-r from-card/90 via-card/60 to-card/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        {/* Collapsed Pill State */}
        {isCollapsed ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: easeQuint }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <span className="flex size-2 rounded-full bg-brand animate-pulse" />
              <Compass className="size-4 text-brand shrink-0" />
              <span className="font-semibold text-foreground">
                {t.guide.badge}:
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                {t.guide.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCollapse}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/60 hover:bg-secondary px-3 py-1 text-xs font-medium text-foreground transition-colors cursor-pointer"
              >
                <span>{t.guide.showGuide}</span>
                <ChevronRight className="size-3.5 text-brand" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Full Expanded Guide Container */
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: easeQuint }}
            className="space-y-4 py-1"
          >
            {/* Guide Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 rounded-xl bg-brand/10 border border-brand/20 items-center justify-center text-brand shrink-0">
                  <Compass className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-brand">
                      {t.guide.badge}
                    </span>
                    <span className="text-border">·</span>
                    <span className="text-xs text-muted-foreground">
                      {locale === 'kh'
                        ? 'មុនពេលចូលប្រើប្រាស់ ឬបង្កើតស្លាយដំបូង'
                        : 'Before sign in · Zero setup needed'}
                    </span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground tracking-tight">
                    {t.guide.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Button
                  onClick={() => onOpenCreate('')}
                  size="sm"
                  className="rounded-full bg-primary hover:opacity-95 text-primary-foreground font-semibold text-xs px-3.5 h-7 shadow-xs gap-1.5 cursor-pointer"
                >
                  <Sparkles className="size-3 text-brand" />
                  <span>{locale === 'kh' ? 'សាកល្បងឥឡូវនេះ' : 'Generate Now'}</span>
                </Button>
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                  title={t.guide.hideGuide}
                  aria-label={t.guide.hideGuide}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* 4 Interactive Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {steps.map((st, idx) => {
                const IconComponent = st.icon;
                const isActive = activeStep === idx;
                return (
                  <motion.div
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2, ease: easeQuint }}
                    className={cn(
                      'group relative rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left',
                      isActive
                        ? 'border-brand/60 bg-card shadow-md ring-1 ring-brand/15'
                        : 'border-border/70 bg-card/40 hover:border-border hover:bg-card/70'
                    )}
                  >
                    <div>
                      {/* Top row with step number and badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-muted-foreground/70 group-hover:text-brand transition-colors">
                          {st.step}
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground/80 border border-border/50">
                          {st.badge}
                        </span>
                      </div>

                      {/* Title and Icon */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <IconComponent className={cn('size-4 shrink-0', st.iconColor)} />
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-foreground tracking-tight leading-snug">
                          {st.title}
                        </h4>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                        {st.desc}
                      </p>
                    </div>

                    {/* Step Action (if available) */}
                    {st.action && st.actionText && (
                      <div className="mt-3 pt-2.5 border-t border-border/40">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            st.action!();
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand hover:underline cursor-pointer"
                        >
                          <MousePointerClick className="size-3" />
                          <span>{st.actionText}</span>
                          <ArrowRight className="size-2.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
