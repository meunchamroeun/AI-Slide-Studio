'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Layers,
  Play,
  Video,
  PenTool,
} from 'lucide-react';
import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui/button';
import { CardVideoAnimation } from '@/components/site/CardVideoAnimation';
import { cn } from '@/lib/utils';

interface HeroPromptSectionProps {
  onConfigureAndGenerate: (promptText: string) => void;
  externalPrompt?: string;
}

export function HeroPromptSection({ onConfigureAndGenerate, externalPrompt }: HeroPromptSectionProps) {
  const { t, locale } = useI18n();
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [cardMode, setCardMode] = useState<'video-demo' | 'custom-prompt'>('video-demo');
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (externalPrompt) {
      setPrompt(externalPrompt);
      setCardMode('custom-prompt');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [externalPrompt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const finalPrompt = prompt.trim() || t.hero.suggestions[0];
    onConfigureAndGenerate(finalPrompt);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setCardMode('custom-prompt');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // Easing curve from Emil Kowalski motion principles
  const easeOutQuint = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
      {/* Outer ambient decorative glow orbs */}
      <motion.div
        animate={{
          x: [0, 25, -20, 0],
          y: [0, -20, 15, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -top-16 left-1/4 -translate-x-1/2 size-80 rounded-full bg-sky-500/15 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -15, 0],
          scale: [1, 0.94, 1.06, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 size-96 rounded-full bg-blue-600/10 blur-[130px]"
      />

      {/* Main Framed Hero Card - Matches screenshot geometry */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: easeOutQuint }}
        className="relative rounded-3xl border border-sky-500/25 bg-card/60 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-border/50"
      >
        {/* Dynamic Specular Spotlight that follows cursor */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(650px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.08), transparent 75%)`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-7">
          {/* Announcement Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOutQuint }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-sky-100/70 text-sky-800 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-200 px-3.5 py-1.5 text-xs shadow-xs backdrop-blur-md"
          >
            <Sparkles className="size-3.5 text-sky-600 dark:text-sky-400" />
            <span className="font-medium tracking-tight">
              {t.hero.tag}
            </span>
          </motion.div>

          {/* Grand Headline with Blue/Cyan Gradient Accent */}
          <motion.h1
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.18, ease: easeOutQuint }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground text-balance max-w-3xl leading-[1.12]"
          >
            {t.hero.titlePrefix}{' '}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent font-normal">
              {t.hero.titleAccent}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25, ease: easeOutQuint }}
            className="max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed font-light text-balance"
          >
            {t.hero.description}
          </motion.p>

          {/* Large Prompt Input / Video Animation Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.32, ease: easeOutQuint }}
            className="w-full max-w-3xl pt-2"
          >
            {/* Mode Switcher Tabs right on top of the card */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-secondary/80 border border-slate-200/80 dark:border-border/70 backdrop-blur-md shadow-xs">
                <button
                  type="button"
                  onClick={() => setCardMode('video-demo')}
                  className={cn(
                    'px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                    cardMode === 'video-demo'
                      ? 'bg-brand text-stone-950 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
                  )}
                >
                  <Play className="size-3" />
                  <span>{t.hero.modeVideoDemo}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCardMode('custom-prompt');
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                  className={cn(
                    'px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer',
                    cardMode === 'custom-prompt'
                      ? 'bg-brand text-stone-950 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
                  )}
                >
                  <Sparkles className="size-3" />
                  <span>{t.hero.modeCustomPrompt}</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-500 dark:text-muted-foreground/70 hidden sm:inline">
                {cardMode === 'video-demo'
                  ? (locale === 'kh' ? 'ចាក់វីដេអូចលនាដោយស្វ័យប្រវត្តិ' : 'Auto-playing Keynote Simulation')
                  : (locale === 'kh' ? 'វាយបញ្ចូលប្រធានបទរបស់អ្នក' : 'Write or choose topic')}
              </span>
            </div>

            {/* Interactive Card Body: Video Animation OR Custom Prompt Input */}
            <div
              className={`group relative rounded-2xl border transition-all duration-300 bg-white/95 dark:bg-zinc-950/90 text-left p-4 sm:p-5 shadow-xl dark:shadow-2xl backdrop-blur-xl ${
                isFocused
                  ? 'border-sky-500/80 ring-2 ring-sky-500/20 shadow-sky-950/10 dark:shadow-sky-950/30'
                  : 'border-slate-200/90 dark:border-border/80 hover:border-sky-500/40'
              }`}
            >
              <AnimatePresence mode="wait">
                {cardMode === 'video-demo' ? (
                  <motion.div
                    key="video-animation-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CardVideoAnimation
                      onUsePrompt={(selected) => {
                        setPrompt(selected);
                        setCardMode('custom-prompt');
                        onConfigureAndGenerate(selected);
                      }}
                      onSwitchToCustomInput={() => {
                        setCardMode('custom-prompt');
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="custom-prompt-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Textarea for Multi-line Prompt Input */}
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={handleKeyDown}
                      rows={3}
                      placeholder={t.hero.placeholder}
                      className="w-full bg-transparent resize-none border-0 text-xs sm:text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground/60 focus:outline-none leading-relaxed"
                    />

                    {/* Internal Divider Line */}
                    <div className="border-t border-slate-200/80 dark:border-border/50 my-3.5" />

                    {/* Bottom Control Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2">
                      {/* Left Telemetry Badges */}
                      <div className="flex items-center gap-4 text-[11px] sm:text-xs text-slate-600 dark:text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                          <Cpu className="size-3.5 shrink-0" />
                          <span>{t.hero.geminiReady}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="size-3.5 shrink-0" />
                          <span>{t.hero.offlineExport}</span>
                        </div>
                      </div>

                      {/* Right Action Button with Motion Hover and Press Physics */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCardMode('video-demo')}
                          className="text-[11px] text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground px-2.5 py-1 rounded-full border border-slate-200 dark:border-border/60 hover:bg-slate-100 dark:hover:bg-secondary cursor-pointer"
                        >
                          {t.hero.modeVideoDemo}
                        </button>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                          <Button
                            onClick={handleSubmit}
                            type="button"
                            className="w-full sm:w-auto rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-stone-800 dark:border-slate-700/80 px-5 h-9 sm:h-10 text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                          >
                            <Sparkles className="size-3.5 text-sky-400 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                            <span>{t.hero.configureGenerate}</span>
                            <ArrowRight className="size-3.5 shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Prompts Area */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease: easeOutQuint }}
              className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs"
            >
              <span className="text-slate-500 dark:text-muted-foreground/70 font-light mr-1">
                {t.hero.quickPrompts}
              </span>
              {t.hero.suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  className="rounded-full border border-slate-200 dark:border-border/70 bg-white/80 dark:bg-secondary/40 hover:bg-slate-100 dark:hover:bg-secondary hover:border-sky-500/40 px-3.5 py-1 text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors cursor-pointer text-left truncate max-w-[340px] sm:max-w-none shadow-xs"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
