'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Layers,
  Monitor,
  X,
  Palette,
  Upload,
  FileText,
  FileUp,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
  Wand2,
  Key,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/components/i18n-provider';
import { api } from '@/services/api';
import {
  GeneratePresentationDto,
  ThemeName,
  AspectRatio,
} from '@ai-slide-studio/shared';
import {
  extractTextFromFile,
  composePromptWithAttachment,
  ExtractedFile,
} from '@/lib/file-extractor';

const GENERATION_STAGES = [
  { id: 'preparing', label: 'Preparing prompt & source document context' },
  { id: 'outline', label: 'Generating presentation outline with Gemini AI' },
  { id: 'slides', label: 'Synthesizing structured slide elements & layouts' },
  { id: 'validating', label: 'Validating animations, metrics & schemas' },
  { id: 'saving', label: 'Finalizing database record and launching editor' },
];

interface GenerateTabContentProps {
  initialPrompt?: string;
  onPresentationCreated?: (id: string) => void;
}

export function GenerateTabContent({
  initialPrompt = '',
  onPresentationCreated,
}: GenerateTabContentProps) {
  const router = useRouter();
  const { t, locale } = useI18n();

  // Mode: 'topic' | 'attach' | 'curated'
  const [activeInputMode, setActiveInputMode] = useState<'topic' | 'attach' | 'curated'>('topic');

  // Core Form State
  const [prompt, setPrompt] = useState(initialPrompt);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [slideCount, setSlideCount] = useState<number>(8);
  const [theme, setTheme] = useState<ThemeName>('modern-dark');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [language, setLanguage] = useState<string>(locale === 'kh' ? 'Khmer' : 'English');
  const [audience, setAudience] = useState<string>('General Professional');
  const [tone, setTone] = useState<string>('Professional');
  const [presentationStyle, setPresentationStyle] = useState<string>('Modern SaaS Dark');
  const [animationStyle, setAnimationStyle] = useState<'subtle' | 'dynamic' | 'cinematic' | 'minimal'>('dynamic');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<ExtractedFile | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Settings Accordion State
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Gemini API Key: Server Admin Default vs BYOK
  const [apiKeySource, setApiKeySource] = useState<'server' | 'custom'>('server');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Generation Processing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load custom API key from localStorage on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('slidestudio_custom_gemini_api_key');
      const savedSource = localStorage.getItem('slidestudio_api_key_source') as 'server' | 'custom' | null;
      if (savedKey) setCustomApiKey(savedKey);
      if (savedSource === 'custom' || savedSource === 'server') setApiKeySource(savedSource);
    } catch {}
  }, []);

  // Update language when locale changes
  useEffect(() => {
    setLanguage(locale === 'kh' ? 'Khmer' : 'English');
  }, [locale]);

  const handleCustomApiKeyChange = (val: string) => {
    setCustomApiKey(val);
    try {
      localStorage.setItem('slidestudio_custom_gemini_api_key', val.trim());
    } catch {}
  };

  const handleApiKeySourceChange = (src: 'server' | 'custom') => {
    setApiKeySource(src);
    try {
      localStorage.setItem('slidestudio_api_key_source', src);
    } catch {}
  };

  // File processing handler
  const handleProcessFile = async (file: File) => {
    try {
      setIsReadingFile(true);
      setErrorMessage(null);
      const extracted = await extractTextFromFile(file);
      setAttachedFile(extracted);
      setActiveInputMode('attach');
    } catch (err: any) {
      setErrorMessage(`Failed to parse file: ${err?.message || 'Unsupported format'}`);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
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

  // Generation Handler
  const handleGenerate = async () => {
    // Validate that either prompt or attached file exists
    const effectivePrompt = activeInputMode === 'attach' && attachedFile
      ? composePromptWithAttachment(additionalNotes, attachedFile)
      : prompt.trim();

    if (!effectivePrompt) {
      setErrorMessage('Please enter a presentation topic or attach a document.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setCurrentStageIndex(0);

    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < GENERATION_STAGES.length - 1) return prev + 1;
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
        if (onPresentationCreated) {
          onPresentationCreated(result.id);
        } else {
          router.push(`/presentations/${result.id}`);
        }
      }, 500);
    } catch (err: any) {
      clearInterval(stageTimer);
      setIsGenerating(false);
      setErrorMessage(
        err?.message || 'Failed to generate presentation. Please check your network and Gemini API configuration.'
      );
    }
  };

  const suggestions = t.hero.suggestions || [
    '10-slide pitch for a Next-Gen AI Risk & Compliance Platform',
    '8-slide technical overview of Distributed Vector Indexing',
    '6-slide quarterly executive report on sales and revenue metrics',
    '7-slide strategic vision for automated cloud observability',
  ];

  const curatedTemplates = [
    {
      title: 'Executive Pitch Deck',
      category: 'Investor & Venture',
      slides: 8,
      theme: 'corporate-blue' as ThemeName,
      prompt: '8-slide executive pitch deck for an enterprise software platform highlighting problem, total addressable market, proprietary architecture, revenue metrics, and growth roadmap.',
    },
    {
      title: 'Technical Deep-Dive',
      category: 'Engineering & Cloud',
      slides: 10,
      theme: 'technology-gradient' as ThemeName,
      prompt: '10-slide technical architecture keynote covering microservices topography, real-time message queues, database sharding, latency metrics, and fault-tolerance.',
    },
    {
      title: 'Quarterly Business Review (QBR)',
      category: 'Operations & Strategy',
      slides: 6,
      theme: 'modern-dark' as ThemeName,
      prompt: '6-slide executive quarterly review analyzing revenue achievement, operational velocity, customer retention rates, and high-priority strategic objectives for next quarter.',
    },
    {
      title: 'Product Launch Keynote',
      category: 'Product & Marketing',
      slides: 7,
      theme: 'minimal-light' as ThemeName,
      prompt: '7-slide high-energy product launch presentation unveiling core customer benefits, competitive advantages, product pricing tiers, and go-to-market rollout schedule.',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl ring-1 ring-border/50 transition-all duration-300">
      {/* Specular top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />

      {/* Generation Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-8 space-y-6">
          <div className="size-16 rounded-2xl bg-brand/10 flex items-center justify-center border border-brand/20 animate-pulse">
            <Wand2 className="size-8 text-brand animate-spin" />
          </div>

          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-lg font-serif font-medium text-foreground">
              {locale === 'kh' ? 'កំពុងបង្កើតបទបង្ហាញ AI...' : 'Generating Keynote Presentation...'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === 'kh'
                ? 'Google Gemini AI កំពុងរៀបចំស្លាយ ប្លង់ និងចលនា GSAP...'
                : 'Google Gemini AI is structuring layout hierarchy, slide content, and GSAP timeline animations.'}
            </p>
          </div>

          {/* Stepper */}
          <div className="w-full max-w-sm space-y-2.5 pt-2">
            {GENERATION_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                    isPast
                      ? 'text-foreground font-medium'
                      : isCurrent
                      ? 'text-brand font-semibold'
                      : 'text-muted-foreground/40'
                  }`}
                >
                  <div
                    className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
                      isPast
                        ? 'bg-brand text-background'
                        : isCurrent
                        ? 'bg-brand/20 text-brand ring-2 ring-brand/40 animate-pulse'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="size-3" /> : idx + 1}
                  </div>
                  <span>{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full p-5 sm:p-8 space-y-6">
        {/* Header telemetry and badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/80 text-xs font-medium text-foreground">
            <span className="size-2 rounded-full bg-brand animate-pulse" />
            <Sparkles className="size-3.5 text-brand" />
            <span>{t.dashboardTabs?.generateTab || 'Generate AI Presentation'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
              <Cpu className="size-3.5 text-brand" />
              <span>{t.hero.geminiReady}</span>
            </span>
            <span className="text-border">&bull;</span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>{t.hero.offlineExport}</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-foreground">
            {t.hero.titlePrefix}{' '}
            <span className="italic font-normal bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              {t.hero.titleAccent}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-light">
            {t.hero.description}
          </p>
        </div>

        {/* Mode Selector Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/60 border border-border/70 max-w-fit">
          <button
            type="button"
            onClick={() => setActiveInputMode('topic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeInputMode === 'topic'
                ? 'bg-background text-foreground shadow-sm border border-border/80 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="size-3.5 text-brand" />
            <span>{t.dashboardTabs?.modeTopic || 'Topic & Prompt'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputMode('attach')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeInputMode === 'attach'
                ? 'bg-background text-foreground shadow-sm border border-border/80 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="size-3.5 text-brand" />
            <span>{t.dashboardTabs?.modeAttachFile || 'Attach / Upload File'}</span>
            {attachedFile && (
              <span className="size-2 rounded-full bg-brand" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveInputMode('curated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeInputMode === 'curated'
                ? 'bg-background text-foreground shadow-sm border border-border/80 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="size-3.5 text-brand" />
            <span>{t.dashboardTabs?.modeCurated || 'Curated Outlines'}</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv,.tsv,.json,.yaml,.yml,.xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Mode 1: Topic / Prompt Composer */}
        {activeInputMode === 'topic' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl border border-border/80 bg-background/50 p-3 sm:p-4 shadow-inner focus-within:border-brand/70 focus-within:ring-2 focus-within:ring-brand/20 transition-all backdrop-blur-sm">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.hero.placeholder}
                rows={4}
                className="w-full resize-none border-0 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 shadow-none p-0 leading-relaxed"
              />

              {/* Bottom bar inside composer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-2 border-t border-border/50">
                <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground">
                    <Layers className="size-3 text-brand" />
                    <span>{slideCount} {locale === 'kh' ? 'ស្លាយ' : 'Slides'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground">
                    <Monitor className="size-3 text-brand" />
                    <span>{aspectRatio}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground capitalize">
                    <Palette className="size-3 text-brand" />
                    <span>{theme.replace('-', ' ')}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/10 hover:bg-brand/20 border border-brand/30 text-[11px] text-brand transition-colors cursor-pointer"
                  >
                    <Upload className="size-3" />
                    <span>{t.dashboardTabs?.attachFileToPrompt || 'Attach File'}</span>
                  </button>
                </div>

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
                    type="button"
                    onClick={handleGenerate}
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

            {/* Quick Suggestions Chips */}
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
          </div>
        )}

        {/* Mode 2: Attach / Upload File Mode */}
        {activeInputMode === 'attach' && (
          <div className="space-y-4">
            {!attachedFile ? (
              /* Drag & Drop Zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                  isDraggingFile
                    ? 'border-brand bg-brand/5 scale-[1.01]'
                    : 'border-border/80 hover:border-brand/50 hover:bg-secondary/40 bg-background/40'
                }`}
              >
                <div className="size-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                  <FileUp className="size-7" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    {isReadingFile
                      ? (t.dashboardTabs?.readingFile || 'Reading and analyzing document...')
                      : (t.dashboardTabs?.uploadDropzoneTitle || 'Drag and drop documents or click to browse')}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    {t.dashboardTabs?.uploadFormats || 'Supports PDF, Word (.docx), Markdown, Text (.txt), CSV, JSON (up to 25MB)'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs gap-1.5 border-border/80 pointer-events-none"
                >
                  <Upload className="size-3.5 text-brand" />
                  <span>{locale === 'kh' ? 'ជ្រើសរើសឯកសារ' : 'Browse Files'}</span>
                </Button>
              </div>
            ) : (
              /* Attached File Card */
              <div className="rounded-2xl border border-brand/30 bg-card/90 p-4 sm:p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-brand/15 text-brand flex items-center justify-center border border-brand/20 shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate max-w-[260px] sm:max-w-md">
                          {attachedFile.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">
                          {attachedFile.type || 'DOC'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{attachedFile.sizeFormatted}</span>
                        <span>&bull;</span>
                        <span className="text-brand font-medium">
                          {attachedFile.charCount.toLocaleString()} {t.dashboardTabs?.extractedChars || 'characters extracted'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilePreview(!showFilePreview)}
                      className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showFilePreview ? <EyeOff className="size-3.5 mr-1" /> : <Eye className="size-3.5 mr-1" />}
                      <span>{showFilePreview ? (locale === 'kh' ? 'បិទ' : 'Hide') : (locale === 'kh' ? 'មើល' : 'Preview')}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {t.dashboardTabs?.replaceFile || 'Replace'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-xs h-8 px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Collapsible preview */}
                {showFilePreview && (
                  <div className="rounded-xl bg-background/80 border border-border/80 p-3 text-xs text-muted-foreground font-mono max-h-40 overflow-y-auto leading-relaxed">
                    {attachedFile.preview}
                  </div>
                )}

                {/* Additional instructions textarea */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    <span>{t.dashboardTabs?.additionalInstructions || 'Additional Prompt / Instructions (Optional)'}</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      {locale === 'kh' ? 'ណែនាំចំណុចដែលត្រូវសង្កត់ធ្ងន់' : 'Guide what to focus on'}
                    </span>
                  </label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder={
                      t.dashboardTabs?.additionalPlaceholder ||
                      'e.g. Focus on executive summary, key growth drivers, and market opportunities from this file...'
                    }
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border/80 bg-background/50 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-brand p-3"
                  />
                </div>

                {/* Bottom Action inside attached file */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground">
                      <Layers className="size-3 text-brand" />
                      <span>{slideCount} {locale === 'kh' ? 'ស្លាយ' : 'Slides'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/70 border border-border/60 text-[11px] text-muted-foreground capitalize">
                      <Palette className="size-3 text-brand" />
                      <span>{theme.replace('-', ' ')}</span>
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGenerate}
                    className="rounded-full bg-primary hover:opacity-95 text-primary-foreground text-xs sm:text-sm font-semibold px-6 h-10 shadow-lg shadow-brand/10 gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <Sparkles className="size-4 text-brand" />
                    <span>{t.dashboardTabs?.generateFromDocBtn || 'Generate Slides from Document'}</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 3: Curated Outlines Gallery */}
        {activeInputMode === 'curated' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {curatedTemplates.map((template, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPrompt(template.prompt);
                  setSlideCount(template.slides);
                  setTheme(template.theme);
                  setActiveInputMode('topic');
                }}
                className="group/card rounded-2xl border border-border/80 bg-background/50 hover:bg-secondary/40 p-4 text-left transition-all hover:border-brand/40 hover:shadow-md cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                    {template.category}
                  </Badge>
                  <span className="text-[11px] text-brand font-mono font-medium">
                    {template.slides} {locale === 'kh' ? 'ស្លាយ' : 'slides'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground group-hover/card:text-brand transition-colors">
                    {template.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {template.prompt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground font-medium">
                  <span className="capitalize">{template.theme.replace('-', ' ')}</span>
                  <span className="inline-flex items-center gap-1 text-brand group-hover/card:translate-x-0.5 transition-transform">
                    <span>{locale === 'kh' ? 'ប្រើប្រាស់គ្រោងនេះ' : 'Use this outline'}</span>
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Advanced Settings Toggle */}
        <div className="border-t border-border/50 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center justify-between w-full py-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-brand" />
              <span className="font-semibold text-foreground">
                {locale === 'kh' ? 'ការកំណត់លម្អិត & ម៉ាស៊ីន AI' : 'Slide Parameters & AI Engine Configuration'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span>{showAdvancedSettings ? (locale === 'kh' ? 'បិទ' : 'Hide') : (locale === 'kh' ? 'បង្ហាញ' : 'Customize')}</span>
              {showAdvancedSettings ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </div>
          </button>

          {/* Collapsible Advanced Parameters */}
          {showAdvancedSettings && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-2">
              {/* Slide Count */}
              <div className="space-y-2 p-3.5 rounded-xl bg-background/50 border border-border/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{t.modal.slideCount}</span>
                  <span className="font-mono text-brand font-semibold">{slideCount}</span>
                </div>
                <Slider
                  value={[slideCount]}
                  min={3}
                  max={20}
                  step={1}
                  onValueChange={(val) => setSlideCount(val[0])}
                  className="py-1 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>3</span>
                  <span>8</span>
                  <span>15</span>
                  <span>20</span>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/80">
                <label className="text-xs font-medium text-foreground">{t.modal.themeLabel}</label>
                <Select value={theme} onValueChange={(val) => setTheme(val as ThemeName)}>
                  <SelectTrigger className="h-9 text-xs bg-card border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern-dark">Modern Dark (Keynote Classic)</SelectItem>
                    <SelectItem value="minimal-light">Minimal Light (Clean White)</SelectItem>
                    <SelectItem value="corporate-blue">Corporate Blue (Enterprise)</SelectItem>
                    <SelectItem value="editorial">Editorial (Warm Serif)</SelectItem>
                    <SelectItem value="technology-gradient">Tech Gradient (Modern)</SelectItem>
                    <SelectItem value="elegant-monochrome">Monochrome (Executive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language Selection */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/80">
                <label className="text-xs font-medium text-foreground">{t.common.language}</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-9 text-xs bg-card border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English (Roboto)</SelectItem>
                    <SelectItem value="Khmer">ភាសាខ្មែរ (Kantumruy Pro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/80">
                <label className="text-xs font-medium text-foreground">{t.modal.aspectRatio}</label>
                <Select value={aspectRatio} onValueChange={(val) => setAspectRatio(val as AspectRatio)}>
                  <SelectTrigger className="h-9 text-xs bg-card border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Widescreen Keynote HD)</SelectItem>
                    <SelectItem value="4:3">4:3 (Classic Slide Deck)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Animation Preset Style */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/80">
                <label className="text-xs font-medium text-foreground">{t.modal.animation}</label>
                <Select value={animationStyle} onValueChange={(val: any) => setAnimationStyle(val)}>
                  <SelectTrigger className="h-9 text-xs bg-card border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Dynamic (Staggered Reveals)</SelectItem>
                    <SelectItem value="subtle">Subtle (Smooth Fades)</SelectItem>
                    <SelectItem value="cinematic">Cinematic (Zoom & Optical Blur)</SelectItem>
                    <SelectItem value="minimal">Minimal (Zero Distraction)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gemini API Key Source */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-background/50 border border-border/80">
                <label className="text-xs font-medium text-foreground">{t.modal.apiKeySourceLabel}</label>
                <Select value={apiKeySource} onValueChange={(val: any) => handleApiKeySourceChange(val)}>
                  <SelectTrigger className="h-9 text-xs bg-card border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="server">Server Default (gemini-3.5-flash)</SelectItem>
                    <SelectItem value="custom">BYOK: Custom API Key</SelectItem>
                  </SelectContent>
                </Select>
                {apiKeySource === 'custom' && (
                  <div className="relative pt-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={customApiKey}
                      onChange={(e) => handleCustomApiKeyChange(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full h-8 px-2.5 pr-8 rounded-lg bg-background border border-border text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-destructive hover:opacity-75 cursor-pointer ml-2"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
