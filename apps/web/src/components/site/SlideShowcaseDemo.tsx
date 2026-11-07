'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft,
  Check,
  ShieldAlert,
  Sliders,
  Cpu,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/i18n-provider';

type DemoSlide = {
  id: number;
  layout: 'cover' | 'statistics' | 'comparison' | 'quote';
  badge: string;
  title: string;
  subtitle: string;
};

const DEMO_SLIDES: DemoSlide[] = [
  {
    id: 1,
    layout: 'cover',
    badge: 'Executive Keynote 2026',
    title: 'Autonomous Intelligence in Cloud Architecture',
    subtitle: 'Strategic roadmaps, distributed system scaling, and verified AI agent automation.',
  },
  {
    id: 2,
    layout: 'statistics',
    badge: 'Real-Time Impact Metrics',
    title: 'Mission-Critical Performance Benchmarks',
    subtitle: 'Live telemetry measuring generation speed, sub-second API latency, and compliance accuracy.',
  },
  {
    id: 3,
    layout: 'comparison',
    badge: 'Architectural Shift',
    title: 'Legacy Static Decks vs AI Animated Studio',
    subtitle: 'Transitioning from brittle static PDFs to self-contained interactive offline HTML presentations.',
  },
  {
    id: 4,
    layout: 'quote',
    badge: 'Leadership Perspective',
    title: 'Precision Communication Drives Decisions',
    subtitle: 'Executive presentation standards demand clarity, structured visual hierarchy, and purposeful motion.',
  },
];

export function SlideShowcaseDemo() {
  const { locale } = useI18n();
  const [activeSlide, setActiveSlide] = useState(0);
  const [themeMode, setThemeMode] = useState<'dark' | 'navy' | 'light'>('dark');
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [statNumber, setStatNumber] = useState(0);

  const slide = DEMO_SLIDES[activeSlide];

  // Auto-advance showcase every 5 seconds if playing
  useEffect(() => {
    if (!isAutoplaying) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % DEMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoplaying, activeSlide]);

  // Smooth counter animation for statistics slide
  useEffect(() => {
    let current = 0;
    const target = 99.4;
    const duration = 1200;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = Math.min(1, Math.max(0, (now - startTime) / duration));
      const ease = 1 - Math.pow(1 - elapsed, 3);
      setStatNumber(parseFloat((target * ease).toFixed(1)));
      if (elapsed < 1) requestAnimationFrame(update);
    };

    const anim = requestAnimationFrame(update);
    return () => cancelAnimationFrame(anim);
  }, [activeSlide, animationTrigger]);

  const handleReplay = () => {
    setAnimationTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative mx-auto max-w-5xl rounded-3xl border border-border/80 bg-card/60 p-3 sm:p-5 shadow-2xl backdrop-blur-xl ring-1 ring-border/50 overflow-hidden">
      {/* Specular top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-border/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-foreground">
            {locale === 'kh' ? 'ការបង្ហាញស្លាយផ្ទាល់' : 'Interactive Slide Stage'}
          </span>
          <Badge variant="outline" className="text-[10px] border-brand/30 text-brand bg-brand/10">
            GSAP & Keynote Motion
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-full border border-border/50">
            <button
              onClick={() => setThemeMode('dark')}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer',
                themeMode === 'dark'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Dark
            </button>
            <button
              onClick={() => setThemeMode('navy')}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer',
                themeMode === 'navy'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Navy
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer',
                themeMode === 'light'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Stone Light
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReplay}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Replay Animations"
          >
            <RotateCcw className="size-3 text-brand animate-spin-slow" />
            <span className="hidden sm:inline font-medium text-foreground">Replay</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAutoplaying(!isAutoplaying)}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            title={isAutoplaying ? 'Pause Autoplay' : 'Resume Autoplay'}
          >
            {isAutoplaying ? <Pause className="size-3 text-brand" /> : <Play className="size-3 text-brand" />}
            <span className="hidden sm:inline font-medium text-foreground">{isAutoplaying ? 'Pause' : 'Play'}</span>
          </Button>
        </div>
      </div>

      {/* Slide Screen Viewport (16:9 aspect ratio container) */}
      <div
        className={cn(
          'relative w-full rounded-2xl p-6 sm:p-10 md:p-14 overflow-hidden border transition-all duration-500 min-h-[360px] sm:min-h-[440px] flex flex-col justify-between select-none shadow-2xl',
          themeMode === 'dark' && 'bg-[#0f0d0c] text-[#fcfbf9] border-white/10',
          themeMode === 'navy' && 'bg-[#0b1329] text-[#f8fafc] border-sky-900/40',
          themeMode === 'light' && 'bg-[#fafaf9] text-[#1c1917] border-black/10'
        )}
      >
        {/* Ambient Stage Particles & Glow matching Keynote Caliber */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_0%,transparent_75%)]" />
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [-15, 15, -15],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'absolute -top-24 -right-24 size-72 sm:size-96 rounded-full blur-[110px] opacity-35',
              themeMode === 'navy' ? 'bg-sky-500' : 'bg-brand'
            )}
          />
          <motion.div
            animate={{
              x: [15, -15, 15],
              y: [20, -20, 20],
              scale: [1, 1.06, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-24 -left-24 size-64 sm:size-80 rounded-full blur-[100px] bg-orange-500/25 opacity-25"
          />
        </div>

        {/* Animated Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.id}-${themeMode}-${animationTrigger}`}
            initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, scale: 0.98, filter: 'blur(5px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 space-y-4 my-auto"
          >
            {/* Slide Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-brand/15 text-brand border border-brand/30 shadow-xs"
            >
              <Sparkles className="size-3 text-brand" />
              <span>{slide.badge}</span>
            </motion.div>

            {/* Layout Specific Visuals */}
            {slide.layout === 'cover' && (
              <div className="space-y-4 max-w-3xl">
                <motion.h3
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.12]"
                >
                  {slide.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs sm:text-base opacity-75 max-w-xl leading-relaxed font-light"
                >
                  {slide.subtitle}
                </motion.p>
              </div>
            )}

            {slide.layout === 'statistics' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl sm:text-3xl font-medium tracking-tight">
                    {slide.title}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-70">{slide.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 shadow-lg"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-brand font-mono font-semibold uppercase">
                      <TrendingUp className="size-3.5" />
                      <span>Reliability</span>
                    </div>
                    <div className="font-mono text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
                      {statNumber}%
                    </div>
                    <p className="text-[11px] opacity-65">Verified Structured JSON</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.22 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 shadow-lg"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold uppercase">
                      <Activity className="size-3.5" />
                      <span>Latency</span>
                    </div>
                    <div className="font-mono text-3xl sm:text-5xl font-bold tracking-tight text-emerald-400">
                      &lt;850ms
                    </div>
                    <p className="text-[11px] opacity-65">End-to-End Generation</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.29 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5 shadow-lg"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono font-semibold uppercase">
                      <Layers className="size-3.5" />
                      <span>Offline</span>
                    </div>
                    <div className="font-mono text-3xl sm:text-5xl font-bold tracking-tight text-sky-400">
                      100%
                    </div>
                    <p className="text-[11px] opacity-65">Zero External CDN Runtime</p>
                  </motion.div>
                </div>
              </div>
            )}

            {slide.layout === 'comparison' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl sm:text-3xl font-medium tracking-tight">
                    {slide.title}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-70">{slide.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="p-5 rounded-2xl bg-destructive/10 border border-destructive/25 space-y-3"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive uppercase tracking-wider font-mono">
                      <ShieldAlert className="size-3.5" />
                      <span>Conventional Slides</span>
                    </div>
                    <ul className="text-xs opacity-75 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                        <span>Static flat PDFs with zero element animation or timeline orchestration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                        <span>Clunky PowerPoint flying clip-art and disjointed transitions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                        <span>Proprietary formats requiring licensed desktop software to view</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.22 }}
                    className="p-5 rounded-2xl bg-brand/10 border border-brand/40 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand uppercase tracking-wider font-mono">
                      <Check className="size-3.5" />
                      <span>AI SlideStudio.ai</span>
                    </div>
                    <ul className="text-xs opacity-90 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                        <span>Apple Keynote-grade micro-displacements and organic 65ms staggers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                        <span>Official Google Gemini AI with verified JSON layout schemas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                        <span>Standalone offline single-file HTML presentation download</span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            )}

            {slide.layout === 'quote' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="space-y-4 max-w-2xl py-4"
              >
                <div className="size-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                  <Quote className="size-5" />
                </div>
                <p className="font-serif text-lg sm:text-2xl font-light italic leading-snug text-foreground">
                  "Executive presentation standards demand clarity, structured visual hierarchy, and purposeful physical motion."
                </p>
                <div className="pt-2 border-t border-current/15">
                  <p className="text-xs font-bold text-foreground">Dr. Elena Rostova</p>
                  <p className="text-[11px] opacity-60">VP of Strategic Architecture · VentureLabs</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Slide Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] opacity-50 pt-4 border-t border-current/10">
          <span>AI Slide Studio · Keynote Motion Runtime</span>
          <span className="font-mono">16:9 Presentation Standard · Slide 0{activeSlide + 1}</span>
        </div>
      </div>

      {/* Slide Navigation Dots and Buttons */}
      <div className="flex items-center justify-between pt-4">
        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {DEMO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveSlide(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-300 cursor-pointer',
                activeSlide === idx ? 'w-8 bg-brand shadow-xs' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              )}
              title={s.title}
            />
          ))}
        </div>

        {/* Next / Prev Stepper */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : DEMO_SLIDES.length - 1))}
            className="h-8 rounded-full text-xs gap-1 cursor-pointer hover:bg-secondary"
          >
            <ChevronLeft className="size-3.5" />
            <span>Prev</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSlide((prev) => (prev < DEMO_SLIDES.length - 1 ? prev + 1 : 0))}
            className="h-8 rounded-full text-xs gap-1 cursor-pointer hover:bg-secondary"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
