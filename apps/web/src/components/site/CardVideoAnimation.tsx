'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Cpu,
  Layers,
  Download,
  ArrowRight,
  CheckCircle2,
  Sliders,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';

interface CardVideoAnimationProps {
  onUsePrompt: (promptText: string) => void;
  onSwitchToCustomInput: () => void;
}

const easeQuint = [0.16, 1, 0.3, 1] as const;

export function CardVideoAnimation({
  onUsePrompt,
  onSwitchToCustomInput,
}: CardVideoAnimationProps) {
  const { t, locale } = useI18n();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [displayedText, setDisplayedText] = useState('');
  const [counterValue, setCounterValue] = useState(0);

  const fullPrompt =
    locale === 'kh'
      ? 'បង្កើតស្លាយបទបង្ហាញ ៨ ទំព័រអំពីស្ថាបត្យកម្ម Cloud សុវត្ថិភាពខ្ពស់ និង AI Automation...'
      : 'Create an 8-slide executive pitch deck about Enterprise Cloud Security and AI automation...';

  // Animation cycle timer: Total 14 seconds
  // Step 0 (0% - 25%): 0s - 3.5s -> Typing prompt
  // Step 1 (25% - 50%): 3.5s - 7s -> Gemini AI Synthesis
  // Step 2 (50% - 85%): 7s - 12s -> Live GSAP Keynote Animated Slide
  // Step 3 (85% - 100%): 12s - 14s -> Export & Ready
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Loop seamlessly
        }
        return prev + 0.7; // ~14s full loop
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update current step based on progress
  useEffect(() => {
    if (progress < 25) {
      setCurrentStep(0);
      // Typewriter calculation
      const textRatio = Math.min(1, progress / 22);
      const chars = Math.floor(fullPrompt.length * textRatio);
      setDisplayedText(fullPrompt.slice(0, chars));
    } else if (progress < 50) {
      setCurrentStep(1);
      setDisplayedText(fullPrompt);
    } else if (progress < 85) {
      setCurrentStep(2);
      // Animate counter from 0 to 142
      const counterRatio = Math.min(1, (progress - 50) / 25);
      setCounterValue(Math.floor(142 * counterRatio));
    } else {
      setCurrentStep(3);
    }
  }, [progress, fullPrompt]);

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full text-left select-none">
      {/* Player Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-border/50 pb-3 mb-4 text-xs">
        {/* Left: Window Dots & Stage Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="size-2.5 rounded-full bg-rose-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-[11px] text-slate-600 dark:text-muted-foreground hidden sm:inline">
            SlideStudio Engine v2.4
          </span>
          <span className="text-slate-300 dark:text-border/60 hidden sm:inline">·</span>
          <div className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-medium text-[11px]">
            <span className="size-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
            <span>
              {currentStep === 0 && (locale === 'kh' ? '១. វាយបញ្ចូលប្រធានបទ' : '01. Prompt Input')}
              {currentStep === 1 && (locale === 'kh' ? '២. AI Gemini បង្កើតស្លាយ' : '02. Gemini AI Synthesis')}
              {currentStep === 2 && (locale === 'kh' ? '៣. ភ្ជាប់ចលនា Keynote' : '03. GSAP Keynote Motion')}
              {currentStep === 3 && (locale === 'kh' ? '៤. ទាញយក HTML ក្រៅបណ្តាញ' : '04. Offline HTML Export')}
            </span>
          </div>
        </div>

        {/* Right: Step Pills */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <button
            onClick={() => setProgress(0)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              currentStep === 0
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 font-medium'
                : 'text-slate-500 hover:text-slate-800 dark:text-muted-foreground/60 dark:hover:text-muted-foreground'
            }`}
          >
            Prompt
          </button>
          <button
            onClick={() => setProgress(26)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              currentStep === 1
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-medium'
                : 'text-slate-500 hover:text-slate-800 dark:text-muted-foreground/60 dark:hover:text-muted-foreground'
            }`}
          >
            Gemini
          </button>
          <button
            onClick={() => setProgress(51)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              currentStep === 2
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 font-medium'
                : 'text-slate-500 hover:text-slate-800 dark:text-muted-foreground/60 dark:hover:text-muted-foreground'
            }`}
          >
            Motion
          </button>
          <button
            onClick={() => setProgress(86)}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              currentStep === 3
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-medium'
                : 'text-slate-500 hover:text-slate-800 dark:text-muted-foreground/60 dark:hover:text-muted-foreground'
            }`}
          >
            Export
          </button>
        </div>
      </div>

      {/* Main Video Animation Stage Area */}
      <div className="relative min-h-[290px] sm:min-h-[310px] rounded-2xl border border-slate-200/90 dark:border-border/50 bg-slate-50/90 dark:bg-zinc-950/95 p-4 sm:p-6 flex flex-col justify-between shadow-inner">
        {/* Specular Ambient Background Gradient */}
        <div className="pointer-events-none absolute -top-10 -right-10 size-60 rounded-full bg-sky-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-60 rounded-full bg-amber-500/10 blur-[80px]" />

        <AnimatePresence mode="wait">
          {/* STEP 0: TYPEWRITER PROMPT ANIMATION */}
          {currentStep === 0 && (
            <motion.div
              key="step-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: easeQuint }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-400 font-medium">
                <Sparkles className="size-3.5 text-sky-600 dark:text-sky-400" />
                <span>{locale === 'kh' ? 'ការវាយបញ្ចូលប្រធានបទដោយស្វ័យប្រវត្តិ...' : 'Simulated Prompt Input...'}</span>
              </div>

              <div className="rounded-xl border border-slate-200/90 dark:border-border/70 bg-white/95 dark:bg-secondary/20 p-3.5 font-sans text-xs sm:text-sm text-slate-800 dark:text-foreground/95 leading-relaxed min-h-[72px] shadow-xs">
                <span>{displayedText}</span>
                <span className="inline-block w-1.5 h-4 bg-sky-500 ml-1 translate-y-0.5 animate-pulse" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400">
                    <Cpu className="size-3" />
                    <span>Gemini Free Tier</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="size-3" />
                    <span>Offline HTML</span>
                  </span>
                </div>

                <div
                  className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-300 ${
                    progress > 20
                      ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-stone-950 scale-95 shadow-md shadow-sky-500/30'
                      : 'bg-stone-900 text-stone-100 dark:bg-slate-800 dark:text-slate-200 border border-stone-800 dark:border-slate-700/80 shadow-xs'
                  }`}
                >
                  <Sparkles className="size-3 text-amber-400 dark:text-brand" />
                  <span>{t.hero.configureGenerate}</span>
                  <ArrowRight className="size-3" />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: GEMINI AI SYNTHESIS SIMULATION */}
          {currentStep === 1 && (
            <motion.div
              key="step-gemini"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: easeQuint }}
              className="space-y-3 my-auto py-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                  <Cpu className="size-4 animate-spin text-amber-600 dark:text-amber-400" />
                  <span>
                    {locale === 'kh'
                      ? 'AI Gemini កំពុងបង្កើតរចនាសម្ព័ន្ធស្លាយ...'
                      : 'Google Gemini 2.0 Flash synthesizing 8 slides...'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 dark:text-muted-foreground">
                  &lt; 850ms latency
                </span>
              </div>

              {/* Shimmering Progress Bar */}
              <div className="h-1.5 w-full bg-slate-200 dark:bg-secondary/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 via-sky-500 to-purple-500 dark:from-amber-400 dark:via-sky-400 dark:to-purple-400"
                  initial={{ width: '10%' }}
                  animate={{ width: `${Math.min(100, (progress - 25) * 4)}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              {/* Activity Log List */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center gap-2 text-slate-800 dark:text-foreground/90 bg-white/80 dark:bg-secondary/30 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-border/50 shadow-xs">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {locale === 'kh'
                      ? 'បង្កើតប្លង់កម្រិតប្រតិបត្តិ ៨ ទំព័រ (Title, Metrics, Comparison)'
                      : 'Constructed 8 executive layouts with semantic hierarchy'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-foreground/90 bg-white/80 dark:bg-secondary/30 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-border/50 shadow-xs">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {locale === 'kh'
                      ? 'រៀបចំចំណុចសំខាន់ៗ & កំណត់ចំណាំអ្នកនិយាយ (Speaker Notes)'
                      : 'Generated executive talking points & speaker notes'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-medium bg-white/80 dark:bg-secondary/30 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-border/50 shadow-xs">
                  <Sparkles className="size-3.5 shrink-0 text-sky-600 dark:text-sky-400 animate-pulse" />
                  <span>
                    {locale === 'kh'
                      ? 'ភ្ជាប់ចលនា GSAP 3.12 (micro-displacements & blur clearance)...'
                      : 'Applying GSAP 3.12 timelines & Apple Keynote transitions...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LIVE KEYNOTE ANIMATED SLIDE PREVIEW */}
          {currentStep === 2 && (
            <motion.div
              key="step-slide"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: easeQuint }}
              className="relative rounded-xl border border-slate-200 dark:border-brand/40 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-sm dark:shadow-xl"
            >
              <div className="relative z-10 space-y-3">
                {/* Header Tag */}
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeQuint }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-amber-500/15 text-amber-800 dark:text-brand border border-amber-500/40"
                >
                  <Sparkles className="size-2.5 text-amber-600 dark:text-brand" />
                  <span>{locale === 'kh' ? 'ស្លាយប្រតិបត្តិ ២០២៦' : 'EXECUTIVE KEYNOTE 2026'}</span>
                </motion.div>

                {/* Grand Headline */}
                <motion.h4
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease: easeQuint }}
                  className="font-serif text-sm sm:text-base md:text-lg font-bold text-slate-950 dark:text-zinc-50 tracking-tight leading-snug"
                >
                  {locale === 'kh'
                    ? 'ស្ថាបត្យកម្ម Cloud សុវត្ថិភាពខ្ពស់ និង AI Automation'
                    : 'Autonomous Intelligence in Cloud Architecture'}
                </motion.h4>

                {/* 3 Metric Glass Cards with 65ms Stagger & Animated Counter */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1, ease: easeQuint }}
                    className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/80 p-2.5 text-center shadow-xs"
                  >
                    <div className="font-serif text-xs sm:text-sm font-bold text-amber-700 dark:text-brand">
                      +{counterValue}%
                    </div>
                    <div className="text-[10px] text-slate-700 dark:text-zinc-300 truncate font-medium">
                      {locale === 'kh' ? 'ល្បឿនដំណើរការ' : 'Throughput'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15, ease: easeQuint }}
                    className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/80 p-2.5 text-center shadow-xs"
                  >
                    <div className="font-serif text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-400">
                      &lt;12ms
                    </div>
                    <div className="text-[10px] text-slate-700 dark:text-zinc-300 truncate font-medium">
                      {locale === 'kh' ? 'ល្បឿនរកឃើញ' : 'Latency'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2, ease: easeQuint }}
                    className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/80 p-2.5 text-center shadow-xs"
                  >
                    <div className="font-serif text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      100%
                    </div>
                    <div className="text-[10px] text-slate-700 dark:text-zinc-300 truncate font-medium">
                      {locale === 'kh' ? 'ក្រៅបណ្តាញ' : 'Offline HTML'}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: EXPORT & READY STATE */}
          {currentStep === 3 && (
            <motion.div
              key="step-export"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: easeQuint }}
              className="space-y-3.5 my-auto text-center py-2"
            >
              <div className="size-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-5" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-sm sm:text-base font-semibold text-slate-900 dark:text-foreground">
                  {locale === 'kh'
                    ? 'បទបង្ហាញត្រូវបានបង្កើត & ភ្ជាប់ចលនារួចរាល់!'
                    : 'Presentation Generated with GSAP Keynote Motion!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-muted-foreground max-w-sm mx-auto">
                  {locale === 'kh'
                    ? 'ឯកសារ HTML តែមួយដំណើរការក្រៅបណ្តាញ ១០០% ដោយគ្មាន Internet ឬ Backend Server។'
                    : 'Self-contained single-file HTML ready to download or present in fullscreen.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <Button
                  onClick={() => onUsePrompt(fullPrompt)}
                  size="sm"
                  className="rounded-full bg-brand text-stone-950 hover:opacity-95 font-semibold text-xs px-4 h-8 gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="size-3.5" />
                  <span>{t.hero.openInEditor}</span>
                  <ArrowRight className="size-3" />
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs px-3.5 h-8 gap-1.5 border-slate-200 dark:border-border/80 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-secondary cursor-pointer shadow-xs"
                >
                  <RotateCcw className="size-3 text-slate-500 dark:text-muted-foreground" />
                  <span>{t.hero.replayVideo}</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-border/40 flex items-center justify-between gap-3 text-xs">
          {/* Play/Pause & Replay Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="size-7 rounded-full bg-white dark:bg-secondary border border-slate-200/80 dark:border-transparent hover:bg-slate-100 dark:hover:bg-secondary/80 flex items-center justify-center text-slate-800 dark:text-foreground transition-colors cursor-pointer shadow-xs"
              title={isPlaying ? t.hero.pauseVideo : t.hero.playVideo}
            >
              {isPlaying ? (
                <Pause className="size-3.5 text-amber-600 dark:text-brand" />
              ) : (
                <Play className="size-3.5 text-amber-600 dark:text-brand translate-x-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="size-7 rounded-full bg-white dark:bg-secondary/60 border border-slate-200/80 dark:border-transparent hover:bg-slate-100 dark:hover:bg-secondary flex items-center justify-center text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer shadow-xs"
              title={t.hero.replayVideo}
            >
              <RotateCcw className="size-3" />
            </button>
            <span className="font-mono text-[11px] text-slate-600 dark:text-muted-foreground ml-1">
              {Math.floor((progress / 100) * 14)}s / 14s
            </span>
          </div>

          {/* Interactive Progress Bar Scrubber */}
          <div
            className="flex-1 h-1.5 bg-slate-200 dark:bg-secondary/80 rounded-full overflow-hidden cursor-pointer relative mx-2"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              setProgress(clickPos * 100);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-sky-500 to-amber-500 dark:from-brand dark:via-sky-400 dark:to-brand transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Quick link to Switch to Custom Input Mode */}
          <button
            type="button"
            onClick={onSwitchToCustomInput}
            className="text-[11px] font-medium text-slate-700 hover:text-slate-950 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t.hero.modeCustomPrompt}</span>
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
