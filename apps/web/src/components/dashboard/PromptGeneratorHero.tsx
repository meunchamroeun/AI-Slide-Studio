'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Sliders,
  Layers,
  Palette,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface PromptGeneratorHeroProps {
  onStartGenerating: (promptText: string) => void;
}

export function PromptGeneratorHero({ onStartGenerating }: PromptGeneratorHeroProps) {
  const [prompt, setPrompt] = useState('');

  const suggestions = [
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
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card/90 via-card/50 to-card/20 p-8 shadow-2xl backdrop-blur-xl">
      {/* Decorative gradient glow */}
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-6">
        {/* Header badge & title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Slide Studio &bull; Gemini-Powered Animation Engine</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Transform any idea into an <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent">
              animated, high-converting presentation
            </span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Generate executive decks, product keynotes, and technical architecture decks in seconds.
            Complete with structured visual layouts, metric counters, GSAP animations, and
            standalone offline HTML export.
          </p>
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative rounded-xl border border-border/70 bg-background/80 p-2 shadow-inner focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/40 transition-all">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to present (e.g. 'Create an 8-slide pitch deck about our Enterprise Cloud Security platform highlighting real-time threat detection, AI agent verification, and revenue impact...')"
              className="min-h-[100px] w-full resize-none border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 shadow-none p-2 leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/40 px-2 pb-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground w-full sm:w-auto">
                <span className="flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-primary" />
                  Gemini Free Tier Ready
                </span>
                <span className="text-border">&bull;</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  100% Offline HTML Export
                </span>
              </div>

              <Button
                type="submit"
                disabled={!prompt.trim()}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 shadow-lg shadow-primary/25 transition-all"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Configure &amp; Generate
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground font-medium">Quick prompts:</span>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(item)}
                className="text-xs bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md border border-border/50 transition-colors"
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
