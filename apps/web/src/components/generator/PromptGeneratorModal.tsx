'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  SlidersHorizontal,
  Layers,
  Palette,
  Monitor,
  Volume2,
  Users,
  Wand2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import {
  GeneratePresentationDto,
  ThemeName,
  AspectRatio,
} from '@ai-slide-studio/shared';

interface PromptGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
}

const GENERATION_STAGES = [
  { id: 'preparing', label: 'Preparing prompt & context' },
  { id: 'outline', label: 'Generating presentation outline with Gemini' },
  { id: 'slides', label: 'Synthesizing structured slide elements & layouts' },
  { id: 'validating', label: 'Validating animations, metrics & schemas' },
  { id: 'saving', label: 'Finalizing database record and editor launch' },
];

export function PromptGeneratorModal({
  open,
  onOpenChange,
  initialPrompt = '',
}: PromptGeneratorModalProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState(initialPrompt);
  const [slideCount, setSlideCount] = useState<number>(8);
  const [theme, setTheme] = useState<ThemeName>('modern-dark');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [language, setLanguage] = useState<string>('English');
  const [audience, setAudience] = useState<string>('General Professional');
  const [tone, setTone] = useState<string>('Professional');
  const [presentationStyle, setPresentationStyle] = useState<string>('Modern SaaS Dark');
  const [animationStyle, setAnimationStyle] = useState<'subtle' | 'dynamic' | 'cinematic' | 'minimal'>('dynamic');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initialPrompt
  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setCurrentStageIndex(0);

    // Realistic stage progression timer while backend processes
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < GENERATION_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1400);

    try {
      const payload: GeneratePresentationDto = {
        prompt: prompt.trim(),
        slideCount,
        theme,
        aspectRatio,
        language,
        audience,
        tone,
        style: presentationStyle,
        animationStyle,
        visualAssetPreference: 'mixed',
      };

      const result = await api.generatePresentation(payload);

      clearInterval(stageTimer);
      setCurrentStageIndex(GENERATION_STAGES.length - 1);

      setTimeout(() => {
        setIsGenerating(false);
        onOpenChange(false);
        router.push(`/presentations/${result.id}`);
      }, 500);
    } catch (err: any) {
      clearInterval(stageTimer);
      setIsGenerating(false);
      setErrorMessage(
        err?.message || 'Failed to generate presentation. Please check API configuration and try again.'
      );
    }
  };

  const samplePrompts = [
    'Create an 8-slide executive pitch for an Enterprise AI Loss Management and Audit Intelligence platform.',
    'Build a 10-slide high-impact presentation on Autonomous Agents in Software Engineering with market forecasts.',
    'Create a 6-slide quarterly business review covering product velocity, key revenue metrics, and strategic roadmap.',
  ];

  return (
    <Dialog open={open} onOpenChange={isGenerating ? () => {} : onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/80 text-foreground p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/20">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Generate AI Presentation
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter your topic, requirements, or outline. Gemini AI will generate structured,
            high-converting slides with custom layouts and synchronized GSAP animations.
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="p-8 py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                <Wand2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-1.5 max-w-md">
              <h3 className="text-base font-semibold text-foreground">
                Synthesizing Presentation
              </h3>
              <p className="text-xs text-muted-foreground">
                Analyzing instructions, selecting layout themes, and drafting timeline animations...
              </p>
            </div>

            <div className="w-full max-w-md space-y-2.5 bg-secondary/30 p-4 rounded-xl border border-border/60">
              {GENERATION_STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={stage.id}
                    className="flex items-center gap-3 text-xs transition-colors duration-300"
                  >
                    {isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                    )}
                    <span
                      className={
                        isCurrent
                          ? 'text-foreground font-semibold'
                          : isPassed
                          ? 'text-muted-foreground line-through'
                          : 'text-muted-foreground/60'
                      }
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-destructive/15 border border-destructive/30 flex items-start gap-2.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Prompt or Topic Outline</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Be descriptive for best results
                </span>
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Create a 10-slide professional presentation about Artificial Intelligence, its development, applications, challenges, and future."
                rows={4}
                className="resize-none bg-background/60 text-sm leading-relaxed border-border/70 focus:border-primary"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1 self-center">Try:</span>
                {samplePrompts.map((sPrompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(sPrompt)}
                    className="text-[11px] bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground px-2 py-0.5 rounded border border-border/50 transition-colors text-left truncate max-w-[260px]"
                  >
                    {sPrompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 p-3.5 rounded-xl bg-secondary/20 border border-border/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Number of Slides
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {slideCount} slides
                  </Badge>
                </div>
                <Slider
                  value={[slideCount]}
                  min={3}
                  max={30}
                  step={1}
                  onValueChange={(val) => setSlideCount(val[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>3 (Brief)</span>
                  <span>8 (Standard)</span>
                  <span>30 (Extensive)</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/20 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  Color Theme
                </label>
                <Select value={theme} onValueChange={(val) => setTheme(val as ThemeName)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern-dark">Modern Dark (Deep Charcoal &amp; Indigo)</SelectItem>
                    <SelectItem value="minimal-light">Minimal Light (Clean White &amp; Slate)</SelectItem>
                    <SelectItem value="corporate-blue">Corporate Blue (Navy &amp; Royal Accent)</SelectItem>
                    <SelectItem value="editorial">Editorial (Warm Ivory &amp; Bronze)</SelectItem>
                    <SelectItem value="technology-gradient">Technology Gradient (Cyber Dark &amp; Cyan)</SelectItem>
                    <SelectItem value="elegant-monochrome">Elegant Monochrome (Pure Black &amp; Neutral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/20 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 text-primary" />
                  Aspect Ratio
                </label>
                <Select value={aspectRatio} onValueChange={(val) => setAspectRatio(val as AspectRatio)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 Widescreen (Modern Displays)</SelectItem>
                    <SelectItem value="4:3">4:3 Standard (Classic Presentations)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/20 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Audience Profile
                </label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Professional">General Professional</SelectItem>
                    <SelectItem value="Executive & Leadership">Executive &amp; Leadership</SelectItem>
                    <SelectItem value="Technical & Engineers">Technical &amp; Engineers</SelectItem>
                    <SelectItem value="Investors & Venture Capital">Investors &amp; Venture Capital</SelectItem>
                    <SelectItem value="Sales & Prospects">Sales &amp; Prospects</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/20 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  Voice &amp; Tone
                </label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Professional &amp; Direct</SelectItem>
                    <SelectItem value="Inspirational">Inspirational &amp; Visionary</SelectItem>
                    <SelectItem value="Persuasive">Persuasive &amp; Pitch-ready</SelectItem>
                    <SelectItem value="Analytical">Analytical &amp; Data-driven</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/20 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                  Animation Preset Style
                </label>
                <Select
                  value={animationStyle}
                  onValueChange={(val) => setAnimationStyle(val as 'subtle' | 'dynamic' | 'cinematic' | 'minimal')}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Dynamic &amp; Smooth</SelectItem>
                    <SelectItem value="subtle">Subtle &amp; Executive</SelectItem>
                    <SelectItem value="cinematic">Cinematic &amp; Bold</SelectItem>
                    <SelectItem value="minimal">Minimalist Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-lg shadow-primary/25 px-5 font-semibold"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Generate Presentation
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
