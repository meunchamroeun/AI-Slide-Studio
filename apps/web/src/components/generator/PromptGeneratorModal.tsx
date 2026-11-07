'use client';

import React, { useState, useRef } from 'react';
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
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Upload,
  FileText,
  Trash2,
  FileUp,
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
import { useI18n } from '@/components/i18n-provider';
import {
  extractTextFromFile,
  composePromptWithAttachment,
  ExtractedFile,
} from '@/lib/file-extractor';

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
  const { t } = useI18n();

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

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<ExtractedFile | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  // Gemini API Key: Server Admin Default vs BYOK (User custom key)
  const [apiKeySource, setApiKeySource] = useState<'server' | 'custom'>('server');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Load custom API key from localStorage on mount
  React.useEffect(() => {
    try {
      const savedKey = localStorage.getItem('slidestudio_custom_gemini_api_key');
      const savedSource = localStorage.getItem('slidestudio_api_key_source') as 'server' | 'custom' | null;
      if (savedKey) {
        setCustomApiKey(savedKey);
      }
      if (savedSource === 'custom' || savedSource === 'server') {
        setApiKeySource(savedSource);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleApiKeySourceChange = (source: 'server' | 'custom') => {
    setApiKeySource(source);
    try {
      localStorage.setItem('slidestudio_api_key_source', source);
    } catch {}
  };

  const handleCustomApiKeyChange = (val: string) => {
    setCustomApiKey(val);
    try {
      localStorage.setItem('slidestudio_custom_gemini_api_key', val.trim());
    } catch {}
  };

  const handleProcessFile = async (file: File) => {
    try {
      setIsReadingFile(true);
      setErrorMessage(null);
      const extracted = await extractTextFromFile(file);
      setAttachedFile(extracted);
    } catch (err: any) {
      setErrorMessage(`Failed to read file: ${err?.message || 'Unsupported format'}`);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sync initialPrompt
  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    const effectivePrompt = composePromptWithAttachment(prompt, attachedFile);
    if (!effectivePrompt.trim()) return;

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
        prompt: effectivePrompt,
        slideCount,
        theme,
        aspectRatio,
        language,
        audience,
        tone,
        style: presentationStyle,
        animationStyle,
        visualAssetPreference: 'mixed',
        apiKey: apiKeySource === 'custom' && customApiKey.trim() ? customApiKey.trim() : undefined,
        attachedFileName: attachedFile?.name,
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
      <DialogContent className="max-w-2xl bg-card border-border/80 text-foreground p-0 overflow-hidden shadow-2xl rounded-2xl ring-1 ring-border/50">
        {/* Specular top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent z-20" />

        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/30">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="size-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <DialogTitle className="text-xl font-serif font-medium tracking-tight">
              {t.modal.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t.modal.desc}
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="p-8 py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="size-16 rounded-2xl bg-brand/10 flex items-center justify-center border border-brand/20 animate-pulse">
                <Wand2 className="size-8 text-brand animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-1.5 max-w-md">
              <h3 className="text-base font-serif font-medium text-foreground">
                {t.modal.synthesizing}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t.modal.synthesizingDesc}
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
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="size-4 text-brand animate-spin shrink-0" />
                    ) : (
                      <div className="size-4 rounded-full border border-border shrink-0" />
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
              <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 flex items-start gap-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv,.tsv,.json,.yaml,.yml,.xml"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <span>{t.modal.promptLabel}</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 font-medium cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  <span>{attachedFile ? 'Change Attached File' : 'Attach Document (.pdf, .docx, .txt)'}</span>
                </button>
              </div>

              {attachedFile && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand/10 border border-brand/30 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="size-4 text-brand shrink-0" />
                    <span className="font-medium text-foreground truncate max-w-[280px]">
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({attachedFile.sizeFormatted} · {attachedFile.charCount.toLocaleString()} chars)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  attachedFile
                    ? 'Optional: add specific presentation instructions for the attached document...'
                    : 'e.g. Create a 10-slide professional presentation about Artificial Intelligence, its development, applications, challenges, and future.'
                }
                rows={4}
                className="resize-none bg-background/60 text-sm leading-relaxed border-border/70 focus:border-brand/60 focus:ring-1 focus:ring-brand/30 rounded-xl"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1 self-center">Try:</span>
                {samplePrompts.map((sPrompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(sPrompt)}
                    className="text-[11px] bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full border border-border/50 transition-colors text-left truncate max-w-[260px] cursor-pointer"
                  >
                    {sPrompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="size-3.5 text-brand" />
                    {t.modal.slideCount}
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs rounded-full px-2.5">
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
                  <span>3</span>
                  <span>8</span>
                  <span>30</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Palette className="size-3.5 text-brand" />
                  {t.modal.themeLabel}
                </label>
                <Select value={theme} onValueChange={(val) => setTheme(val as ThemeName)}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80">
                    <SelectItem value="modern-dark">Modern Dark (Deep Charcoal &amp; Indigo)</SelectItem>
                    <SelectItem value="minimal-light">Minimal Light (Clean White &amp; Slate)</SelectItem>
                    <SelectItem value="corporate-blue">Corporate Blue (Navy &amp; Royal Accent)</SelectItem>
                    <SelectItem value="editorial">Editorial (Warm Ivory &amp; Bronze)</SelectItem>
                    <SelectItem value="technology-gradient">Technology Gradient (Cyber Dark &amp; Cyan)</SelectItem>
                    <SelectItem value="elegant-monochrome">Elegant Monochrome (Pure Black &amp; Neutral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Monitor className="size-3.5 text-brand" />
                  {t.modal.aspectRatio}
                </label>
                <Select value={aspectRatio} onValueChange={(val) => setAspectRatio(val as AspectRatio)}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80">
                    <SelectItem value="16:9">16:9 Widescreen (Modern Displays)</SelectItem>
                    <SelectItem value="4:3">4:3 Standard (Classic Presentations)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-brand" />
                  {t.modal.audience}
                </label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80">
                    <SelectItem value="General Professional">General Professional</SelectItem>
                    <SelectItem value="Executive & Leadership">Executive &amp; Leadership</SelectItem>
                    <SelectItem value="Technical & Engineers">Technical &amp; Engineers</SelectItem>
                    <SelectItem value="Investors & Venture Capital">Investors &amp; Venture Capital</SelectItem>
                    <SelectItem value="Sales & Prospects">Sales &amp; Prospects</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Volume2 className="size-3.5 text-brand" />
                  {t.modal.tone}
                </label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80">
                    <SelectItem value="Professional">Professional &amp; Direct</SelectItem>
                    <SelectItem value="Inspirational">Inspirational &amp; Visionary</SelectItem>
                    <SelectItem value="Persuasive">Persuasive &amp; Pitch-ready</SelectItem>
                    <SelectItem value="Analytical">Analytical &amp; Data-driven</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3.5 text-brand" />
                  {t.modal.animation}
                </label>
                <Select
                  value={animationStyle}
                  onValueChange={(val) => setAnimationStyle(val as 'subtle' | 'dynamic' | 'cinematic' | 'minimal')}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/80">
                    <SelectItem value="dynamic">Dynamic &amp; Smooth</SelectItem>
                    <SelectItem value="subtle">Subtle &amp; Executive</SelectItem>
                    <SelectItem value="cinematic">Cinematic &amp; Bold</SelectItem>
                    <SelectItem value="minimal">Minimalist Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gemini API Key Source Section */}
            <div className="space-y-3 p-4 rounded-xl bg-secondary/20 border border-border/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="size-3.5 text-brand" />
                  <span>{t.modal.apiKeySourceLabel || 'Gemini AI API Key Source'}</span>
                </label>
                <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/60">
                  <button
                    type="button"
                    onClick={() => handleApiKeySourceChange('server')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      apiKeySource === 'server'
                        ? 'bg-brand/15 text-brand shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ShieldCheck className="size-3" />
                    <span>{t.modal.apiKeyServerDefault || 'Server Default'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApiKeySourceChange('custom')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      apiKeySource === 'custom'
                        ? 'bg-brand/15 text-brand shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Key className="size-3" />
                    <span>{t.modal.apiKeyCustomBYOK || 'My Own Key (BYOK)'}</span>
                  </button>
                </div>
              </div>

              {apiKeySource === 'custom' ? (
                <div className="space-y-1.5 pt-1">
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={customApiKey}
                      onChange={(e) => handleCustomApiKeyChange(e.target.value)}
                      placeholder={t.modal.apiKeyPlaceholder || 'AIzaSy... paste your Gemini API key'}
                      className="w-full text-xs font-mono rounded-lg border border-border/80 bg-background/80 px-3 py-2 pr-9 text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-brand/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {t.modal.apiKeyCustomHint || 'Saved securely in your browser localStorage. Used directly for this generation.'}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Using server default Gemini API key configured by the administrator. No key required from you.
                </p>
              )}
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs rounded-full hover:bg-accent cursor-pointer"
              >
                {t.modal.cancel}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="rounded-full bg-primary hover:opacity-95 text-primary-foreground text-xs shadow-md px-5 h-9 font-semibold cursor-pointer"
              >
                <Sparkles className="mr-2 size-3.5 text-brand" />
                {t.modal.generateBtn}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
