'use client';

import React from 'react';
import {
  Type,
  Layout,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  MoveRight,
  TrendingUp,
  Tag,
  Layers,
  Calendar,
  Columns2,
  SplitSquareVertical,
  Quote,
  AlignLeft,
  CheckCircle2,
  ExternalLink,
  Palette,
  Wand2,
  Loader2,
  Clock,
  GitCompare,
  CheckSquare,
  ListOrdered,
} from 'lucide-react';
import {
  Slide,
  SlideLayout,
  ThemeName,
  AnimationPreset,
  TransitionType,
  StatisticItem,
  FeatureCard,
  TimelineItem,
  ComparisonColumn,
} from '@ai-slide-studio/shared';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/components/i18n-provider';
import { api } from '@/services/api';

const ICON_OPTIONS = [
  'zap',
  'cpu',
  'shield',
  'database',
  'activity',
  'layers',
  'lock',
  'rocket',
  'globe',
  'users',
  'check',
  'server',
  'gauge',
  'network',
  'target',
] as const;

interface PropertyPanelProps {
  slide: Slide;
  theme: ThemeName;
  presentationId?: string;
  onUpdateContent: (contentUpdates: Partial<Slide['content']>) => void;
  onReplaceSlide?: (newSlide: Slide) => void;
  onSetLayout: (layout: SlideLayout) => void;
  onSetTheme: (theme: ThemeName) => void;
  onSetAnimation: (preset: AnimationPreset, duration?: number) => void;
  onSetTransition: (type: TransitionType) => void;
  onSetNotes: (notes: string) => void;
}

export function PropertyPanel({
  slide,
  theme,
  presentationId,
  onUpdateContent,
  onReplaceSlide,
  onSetLayout,
  onSetTheme,
  onSetAnimation,
  onSetTransition,
  onSetNotes,
}: PropertyPanelProps) {
  const { t, locale } = useI18n();
  const content = slide.content || { title: '' };

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [selectedTargetLayout, setSelectedTargetLayout] = React.useState<string>('keep');
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  const handleAiUpdate = async () => {
    if (!aiPrompt.trim() || !presentationId || !onReplaceSlide) return;
    try {
      setIsGeneratingAi(true);
      setAiError(null);
      const targetLayout = selectedTargetLayout !== 'keep' ? (selectedTargetLayout as SlideLayout) : undefined;
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('slidestudio_custom_gemini_api_key') || undefined : undefined;
      const updated = await api.regenerateSlide(presentationId, slide.id, {
        prompt: aiPrompt.trim(),
        layout: targetLayout,
        preserveNotes: true,
        apiKey,
      });
      onReplaceSlide(updated);
      setAiPrompt('');
    } catch (err: any) {
      console.error('AI update failed:', err);
      setAiError(err.message || 'Failed to update slide with AI');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handlers for Basic Info
  const handleBadgeChange = (val: string) => onUpdateContent({ badge: val });
  const handleTitleChange = (val: string) => onUpdateContent({ title: val });
  const handleSubtitleChange = (val: string) => onUpdateContent({ subtitle: val });
  const handleBodyChange = (val: string) => onUpdateContent({ body: val });

  // Feature Cards Handlers (for feature-grid)
  const handleAddFeature = () => {
    const current: FeatureCard[] = [...(content.features || [])];
    current.push({
      id: `feat-${Date.now()}`,
      title: 'New Feature Module',
      description: 'Describe the core capability, user workflow, and technical benefits.',
      icon: 'zap',
      badge: `PILLAR ${current.length + 1}`,
    });
    onUpdateContent({ features: current });
  };

  const handleUpdateFeature = (index: number, field: keyof FeatureCard, val: string) => {
    const current = [...(content.features || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: val };
      onUpdateContent({ features: current });
    }
  };

  const handleRemoveFeature = (index: number) => {
    const current = (content.features || []).filter((_, i) => i !== index);
    onUpdateContent({ features: current });
  };

  // Timeline Handlers (for timeline)
  const handleAddTimeline = () => {
    const current: TimelineItem[] = [...(content.timeline || [])];
    current.push({
      id: `time-${Date.now()}`,
      phase: `PHASE 0${current.length + 1}`,
      title: 'Strategic Milestone',
      description: 'Milestone objectives and delivery scope.',
      dateRange: 'Q1 - Q2',
      status: 'in-progress',
    });
    onUpdateContent({ timeline: current });
  };

  const handleUpdateTimeline = (index: number, field: keyof TimelineItem, val: any) => {
    const current = [...(content.timeline || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: val };
      onUpdateContent({ timeline: current });
    }
  };

  const handleRemoveTimeline = (index: number) => {
    const current = (content.timeline || []).filter((_, i) => i !== index);
    onUpdateContent({ timeline: current });
  };

  // Comparison Handlers (for comparison)
  const handleUpdateComparison = (side: 'left' | 'right', field: keyof ComparisonColumn, val: any) => {
    const current = content.comparison || {
      left: { title: 'Traditional', subtitle: 'Legacy', points: [], isHighlighted: false },
      right: { title: 'Modern', subtitle: 'Automated', points: [], isHighlighted: true },
    };
    onUpdateContent({
      comparison: {
        ...current,
        [side]: {
          ...current[side],
          [field]: val,
        },
      },
    });
  };

  const handleAddComparisonPoint = (side: 'left' | 'right') => {
    const current = content.comparison || {
      left: { title: 'Traditional', subtitle: 'Legacy', points: [], isHighlighted: false },
      right: { title: 'Modern', subtitle: 'Automated', points: [], isHighlighted: true },
    };
    const points = [...(current[side].points || [])];
    points.push('New operational distinction or point');
    handleUpdateComparison(side, 'points', points);
  };

  const handleUpdateComparisonPoint = (side: 'left' | 'right', pointIdx: number, val: string) => {
    const current = content.comparison;
    if (!current) return;
    const points = [...(current[side].points || [])];
    points[pointIdx] = val;
    handleUpdateComparison(side, 'points', points);
  };

  const handleRemoveComparisonPoint = (side: 'left' | 'right', pointIdx: number) => {
    const current = content.comparison;
    if (!current) return;
    const points = (current[side].points || []).filter((_, i) => i !== pointIdx);
    handleUpdateComparison(side, 'points', points);
  };

  // Bullet points handlers
  const handleBulletChange = (index: number, val: string) => {
    const current = [...(content.bulletPoints || [])];
    current[index] = val;
    onUpdateContent({ bulletPoints: current });
  };

  const handleAddBullet = () => {
    const current = [...(content.bulletPoints || [])];
    current.push('New key takeaway or supporting point');
    onUpdateContent({ bulletPoints: current });
  };

  const handleRemoveBullet = (index: number) => {
    const current = (content.bulletPoints || []).filter((_, i) => i !== index);
    onUpdateContent({ bulletPoints: current });
  };

  // Takeaways handlers
  const handleTakeawayChange = (index: number, val: string) => {
    const current = [...(content.takeaways || [])];
    current[index] = val;
    onUpdateContent({ takeaways: current });
  };

  const handleAddTakeaway = () => {
    const current = [...(content.takeaways || [])];
    current.push('Key strategic principle or recommendation');
    onUpdateContent({ takeaways: current });
  };

  const handleRemoveTakeaway = (index: number) => {
    const current = (content.takeaways || []).filter((_, i) => i !== index);
    onUpdateContent({ takeaways: current });
  };

  // Statistics metric handlers
  const handleAddStat = () => {
    const current: StatisticItem[] = [...(content.statistics || [])];
    current.push({
      id: `stat-${Date.now()}`,
      value: '+45%',
      label: 'Efficiency Gain',
      subtext: 'Year-over-Year',
      icon: 'activity',
      trend: 'up',
    });
    onUpdateContent({ statistics: current });
  };

  const handleUpdateStat = (index: number, field: keyof StatisticItem, val: any) => {
    const current = [...(content.statistics || [])];
    if (current[index]) {
      current[index] = { ...current[index], [field]: val };
      onUpdateContent({ statistics: current });
    }
  };

  const handleRemoveStat = (index: number) => {
    const current = (content.statistics || []).filter((_, i) => i !== index);
    onUpdateContent({ statistics: current });
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-border bg-card flex flex-col shrink-0 h-full overflow-hidden shadow-xl z-20">
      <Tabs defaultValue="content" className="flex flex-col h-full">
        {/* Tab Headers */}
        <div className="p-3 border-b border-border/50 bg-card backdrop-blur-md">
          <TabsList className="grid grid-cols-3 w-full h-8 bg-secondary/80 dark:bg-stone-900 border border-border/60">
            <TabsTrigger value="content" className="text-xs">
              {t.editor.content}
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              {t.editor.design}
            </TabsTrigger>
            <TabsTrigger value="animation" className="text-xs">
              {t.editor.motion}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* =========================================================================
            Tab 1: Slide Content & Deep Customization
        ========================================================================= */}
        <TabsContent value="content" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          {/* =========================================================================
              AI Copilot Prompt to Edit / Update
          ========================================================================= */}
          {presentationId && onReplaceSlide && (
            <div className="rounded-xl border border-brand/40 bg-brand/5 dark:bg-stone-900/90 p-3.5 space-y-3 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <Sparkles className="size-4 animate-pulse" />
                  <span>{t.editor.aiPromptTitle || 'AI Prompt to Edit / Update'}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand/20 text-brand font-medium">
                  Gemini AI
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-tight">
                {t.editor.aiPromptDesc || 'Instruct Gemini AI to rewrite, add elements, or update this slide'}
              </p>

              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={
                  t.editor.aiPromptPlaceholder ||
                  'e.g. Add 4 security feature cards, make bullet points punchier, or translate into Khmer...'
                }
                rows={2}
                className="text-xs resize-none bg-background dark:bg-stone-950/90 border-border/80 text-foreground dark:text-stone-100 placeholder:text-muted-foreground dark:placeholder:text-stone-400 focus-visible:ring-1 focus-visible:ring-brand"
              />

              {/* Quick Prompt Suggestion Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Wand2 className="size-3 text-brand" />
                  {t.editor.quickPromptLabel || 'Quick Suggestions'}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'punchy', text: t.editor.quickPrompts?.punchy || 'Make more punchy' },
                    { key: 'metrics', text: t.editor.quickPrompts?.metrics || 'Add statistics & metrics' },
                    { key: 'features', text: t.editor.quickPrompts?.features || 'Convert to feature cards', layout: 'feature-grid' },
                    { key: 'timeline', text: t.editor.quickPrompts?.timeline || 'Convert to timeline', layout: 'timeline' },
                    { key: 'translateKhmer', text: t.editor.quickPrompts?.translateKhmer || 'Translate to Khmer' },
                    { key: 'professional', text: t.editor.quickPrompts?.professional || 'More executive & professional' },
                  ].map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => {
                        setAiPrompt(chip.text);
                        if (chip.layout) setSelectedTargetLayout(chip.layout as SlideLayout);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-secondary hover:bg-brand/15 hover:text-brand border border-border/60 text-foreground dark:bg-stone-800/80 dark:text-stone-300 transition-colors cursor-pointer"
                    >
                      + {chip.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Layout Selector (Optional) */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  {t.editor.targetLayoutLabel || 'Target Layout'}:
                </label>
                <Select
                  value={selectedTargetLayout}
                  onValueChange={(val) => setSelectedTargetLayout(val)}
                >
                  <SelectTrigger className="h-7 text-[11px] bg-background dark:bg-stone-950 border-border/80 flex-1">
                    <SelectValue placeholder="Keep Current Layout" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-xs">
                    <SelectItem value="keep">{t.editor.keepCurrentLayout || 'Keep Current Layout'}</SelectItem>
                    <SelectItem value="feature-grid">Feature Cards Grid</SelectItem>
                    <SelectItem value="timeline">Timeline Milestones</SelectItem>
                    <SelectItem value="comparison">Comparison Columns</SelectItem>
                    <SelectItem value="statistics">Metric Statistics</SelectItem>
                    <SelectItem value="title-content">Title & Bullet Points</SelectItem>
                    <SelectItem value="two-columns">Two Columns</SelectItem>
                    <SelectItem value="key-takeaways">Key Takeaways</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Action Button */}
              <Button
                type="button"
                disabled={isGeneratingAi || !aiPrompt.trim()}
                onClick={handleAiUpdate}
                className="w-full h-8 bg-brand hover:bg-brand/90 text-stone-950 font-semibold text-xs gap-1.5 shadow-md shadow-brand/10 cursor-pointer"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>{t.editor.updatingWithAi || 'Updating with AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span>{t.editor.updateWithAiBtn || 'Update with AI'}</span>
                  </>
                )}
              </Button>

              {aiError && (
                <p className="text-[10px] text-destructive font-medium leading-tight">{aiError}</p>
              )}
            </div>
          )}
          {/* Eyebrow / Category Badge */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-brand" />
              {t.editor.badgeField || 'Eyebrow / Category Badge'}
            </label>
            <Input
              value={content.badge || ''}
              onChange={(e) => handleBadgeChange(e.target.value)}
              placeholder="e.g. — ARCHITECTURE or KEY LESSONS"
              className="text-xs focus-visible:ring-1 focus-visible:ring-brand"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-brand" />
              {t.editor.titleField}
            </label>
            <Input
              value={content.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t.editor.titleField}
              className="text-xs focus-visible:ring-1 focus-visible:ring-brand font-medium"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{t.editor.subtitleField}</label>
            <Textarea
              value={content.subtitle || ''}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              placeholder="Slide subtitle or lead description"
              rows={2}
              className="text-xs resize-none focus-visible:ring-1 focus-visible:ring-brand"
            />
          </div>

          {/* Body Paragraph (if title-content, image-text, or has body) */}
          {(slide.layout === 'title-content' || slide.layout === 'image-text' || content.body) && (
            <div className="space-y-1.5 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <AlignLeft className="h-3.5 w-3.5 text-brand" />
                {t.editor.bodyField || 'Body Paragraph'}
              </label>
              <Textarea
                value={content.body || ''}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder="Detailed narrative or body context for this slide..."
                rows={3}
                className="text-xs resize-none focus-visible:ring-1 focus-visible:ring-brand"
              />
            </div>
          )}

          {/* =========================================================================
              FEATURE CARDS CUSTOMIZATION (feature-grid)
          ========================================================================= */}
          {(slide.layout === 'feature-grid' || content.features) && (
            <div className="space-y-3 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-brand" />
                  {t.editor.features || 'Feature Cards'} ({(content.features || []).length})
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddFeature}
                  className="h-6 px-2 text-[11px] text-brand hover:bg-brand/10 gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  {t.editor.addFeature || 'Add Feature'}
                </Button>
              </div>

              <div className="space-y-3">
                {(content.features || []).map((feat, idx) => (
                  <div
                    key={feat.id || idx}
                    className="p-3 rounded-xl bg-secondary/40 dark:bg-stone-900/90 border border-border/80 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="size-5 rounded-full bg-brand/20 text-brand text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                          {feat.title || `Card ${idx + 1}`}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveFeature(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Remove Card"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {/* Icon selector */}
                        <div className="w-24 shrink-0">
                          <label className="text-[10px] text-muted-foreground block mb-0.5">
                            {t.editor.featureIcon || 'Icon'}
                          </label>
                          <Select
                            value={feat.icon || 'zap'}
                            onValueChange={(val) => handleUpdateFeature(idx, 'icon', val)}
                          >
                            <SelectTrigger className="h-7 text-xs border-border/80">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map((ic) => (
                                <SelectItem key={ic} value={ic} className="text-xs">
                                  {ic}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tag/Badge */}
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground block mb-0.5">
                            {t.editor.featureBadge || 'Pillar / Tag'}
                          </label>
                          <Input
                            value={feat.badge || ''}
                            onChange={(e) => handleUpdateFeature(idx, 'badge', e.target.value)}
                            placeholder="e.g. PILLAR 1"
                            className="h-7 text-xs border-border/80"
                          />
                        </div>
                      </div>

                      {/* Card Title */}
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">
                          {t.editor.featureTitle || 'Card Title'}
                        </label>
                        <Input
                          value={feat.title}
                          onChange={(e) => handleUpdateFeature(idx, 'title', e.target.value)}
                          placeholder="Module or Feature Name"
                          className="h-7.5 text-xs border-border/80 font-semibold"
                        />
                      </div>

                      {/* Card Description */}
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">
                          {t.editor.featureDesc || 'Description'}
                        </label>
                        <Textarea
                          value={feat.description}
                          onChange={(e) => handleUpdateFeature(idx, 'description', e.target.value)}
                          placeholder="Operational details and capabilities..."
                          rows={2}
                          className="text-xs resize-none border-border/80 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TIMELINE CUSTOMIZATION (timeline)
          ========================================================================= */}
          {(slide.layout === 'timeline' || content.timeline) && (
            <div className="space-y-3 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand" />
                  {t.editor.timeline || 'Timeline Milestones'} ({(content.timeline || []).length})
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddTimeline}
                  className="h-6 px-2 text-[11px] text-brand hover:bg-brand/10 gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  {t.editor.addTimeline || 'Add Milestone'}
                </Button>
              </div>

              <div className="space-y-3">
                {(content.timeline || []).map((milestone, idx) => (
                  <div
                    key={milestone.id || idx}
                    className="p-3 rounded-xl bg-secondary/40 dark:bg-stone-900/90 border border-border/80 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="size-5 rounded-full bg-brand/20 text-brand text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <Input
                          value={milestone.phase || ''}
                          onChange={(e) => handleUpdateTimeline(idx, 'phase', e.target.value)}
                          placeholder="PHASE 01"
                          className="h-6 text-[11px] font-mono uppercase border-border/80 w-24"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveTimeline(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <Input
                      value={milestone.title}
                      onChange={(e) => handleUpdateTimeline(idx, 'title', e.target.value)}
                      placeholder="Milestone Title"
                      className="h-7 text-xs font-semibold border-border/80"
                    />

                    <Textarea
                      value={milestone.description}
                      onChange={(e) => handleUpdateTimeline(idx, 'description', e.target.value)}
                      placeholder="Scope, key deliverables, and deliverables..."
                      rows={2}
                      className="text-xs resize-none border-border/80"
                    />

                    <div className="flex items-center gap-2">
                      <Input
                        value={milestone.dateRange || ''}
                        onChange={(e) => handleUpdateTimeline(idx, 'dateRange', e.target.value)}
                        placeholder="e.g. Month 1 - 2"
                        className="h-7 text-xs border-border/80 flex-1 font-mono"
                      />
                      <Select
                        value={milestone.status || 'in-progress'}
                        onValueChange={(val) => handleUpdateTimeline(idx, 'status', val)}
                      >
                        <SelectTrigger className="h-7 text-xs border-border/80 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              COMPARISON CUSTOMIZATION (comparison)
          ========================================================================= */}
          {(slide.layout === 'comparison' || content.comparison) && (
            <div className="space-y-4 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <SplitSquareVertical className="h-3.5 w-3.5 text-brand" />
                {t.editor.comparison || 'Comparison Columns'}
              </label>

              {/* Left Column */}
              <div className="p-3 rounded-xl bg-secondary/40 dark:bg-stone-900/90 border border-border/80 space-y-2">
                <span className="text-[11px] font-mono uppercase text-muted-foreground font-bold">
                  Column 1 (Left / Legacy)
                </span>
                <Input
                  value={content.comparison?.left?.title || ''}
                  onChange={(e) => handleUpdateComparison('left', 'title', e.target.value)}
                  placeholder="e.g. Traditional Workflow"
                  className="h-7 text-xs font-semibold"
                />
                <Input
                  value={content.comparison?.left?.subtitle || ''}
                  onChange={(e) => handleUpdateComparison('left', 'subtitle', e.target.value)}
                  placeholder="e.g. Manual, fragmented, slow"
                  className="h-7 text-xs"
                />
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-semibold">Points:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddComparisonPoint('left')}
                      className="h-5 px-1.5 text-[10px] text-brand hover:bg-brand/10"
                    >
                      + Point
                    </Button>
                  </div>
                  {(content.comparison?.left?.points || []).map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-1.5">
                      <Input
                        value={pt}
                        onChange={(e) => handleUpdateComparisonPoint('left', pIdx, e.target.value)}
                        className="h-6 text-xs flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveComparisonPoint('left', pIdx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="p-3 rounded-xl bg-brand/5 dark:bg-stone-900/90 border border-brand/50 space-y-2">
                <span className="text-[11px] font-mono uppercase text-brand font-bold">
                  Column 2 (Right / Recommended)
                </span>
                <Input
                  value={content.comparison?.right?.title || ''}
                  onChange={(e) => handleUpdateComparison('right', 'title', e.target.value)}
                  placeholder="e.g. AI Slide Studio"
                  className="h-7 text-xs font-semibold"
                />
                <Input
                  value={content.comparison?.right?.subtitle || ''}
                  onChange={(e) => handleUpdateComparison('right', 'subtitle', e.target.value)}
                  placeholder="e.g. Automated, unified, responsive"
                  className="h-7 text-xs"
                />
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-semibold">Points:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddComparisonPoint('right')}
                      className="h-5 px-1.5 text-[10px] text-brand hover:bg-brand/10"
                    >
                      + Point
                    </Button>
                  </div>
                  {(content.comparison?.right?.points || []).map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-1.5">
                      <Input
                        value={pt}
                        onChange={(e) => handleUpdateComparisonPoint('right', pIdx, e.target.value)}
                        className="h-6 text-xs flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveComparisonPoint('right', pIdx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TWO COLUMNS CUSTOMIZATION (two-columns)
          ========================================================================= */}
          {slide.layout === 'two-columns' && (
            <div className="space-y-3 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Columns2 className="h-3.5 w-3.5 text-brand" />
                {t.editor.twoColumns || 'Two Columns Content'}
              </label>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">Left Column:</span>
                <Textarea
                  value={content.leftColumn || ''}
                  onChange={(e) => onUpdateContent({ leftColumn: e.target.value })}
                  placeholder="Heading and paragraphs for left column..."
                  rows={4}
                  className="text-xs resize-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-0.5">Right Column:</span>
                <Textarea
                  value={content.rightColumn || ''}
                  onChange={(e) => onUpdateContent({ rightColumn: e.target.value })}
                  placeholder="Heading and paragraphs for right column..."
                  rows={4}
                  className="text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              KEY TAKEAWAYS (key-takeaways)
          ========================================================================= */}
          {(slide.layout === 'key-takeaways' || content.takeaways) && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                  {t.editor.takeaways || 'Key Takeaways'}
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddTakeaway}
                  className="h-6 px-2 text-[11px] text-brand hover:bg-brand/10 gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {(content.takeaways || []).map((tway, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground mt-2 w-4">
                      {idx + 1}.
                    </span>
                    <Textarea
                      value={tway}
                      onChange={(e) => handleTakeawayChange(idx, e.target.value)}
                      rows={2}
                      className="text-xs resize-none focus-visible:ring-1 focus-visible:ring-brand flex-1 min-h-[46px]"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveTakeaway(idx)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 mt-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              BULLET POINTS (title-content, image-text, etc.)
          ========================================================================= */}
          {(slide.layout === 'title-content' || slide.layout === 'image-text' || (content.bulletPoints && content.bulletPoints.length > 0)) && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">{t.editor.bulletPoints}</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddBullet}
                  className="h-6 px-2 text-[11px] text-brand hover:bg-brand/10 gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Add Point
                </Button>
              </div>

              <div className="space-y-2">
                {(content.bulletPoints || []).map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground mt-2 w-4">
                      {idx + 1}.
                    </span>
                    <Textarea
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      rows={2}
                      className="text-xs resize-none focus-visible:ring-1 focus-visible:ring-brand flex-1 min-h-[46px]"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveBullet(idx)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 mt-1 cursor-pointer"
                      title="Remove point"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              METRIC STATS (statistics, metric-highlight)
          ========================================================================= */}
          {(slide.layout === 'statistics' || slide.layout === 'metric-highlight' || (content.statistics && content.statistics.length > 0)) && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-brand" />
                  Metric Stats
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddStat}
                  className="h-6 px-2 text-[11px] text-brand hover:bg-brand/10 gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Add Stat
                </Button>
              </div>

              <div className="space-y-2">
                {(content.statistics || []).map((stat, idx) => (
                  <div
                    key={stat.id || idx}
                    className="p-2.5 rounded-lg bg-secondary/40 dark:bg-stone-900/90 border border-border/80 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={stat.value}
                        onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                        placeholder="e.g. 98.4%"
                        className="text-xs font-mono font-bold h-7 focus-visible:ring-1 focus-visible:ring-brand w-24"
                      />
                      <Input
                        value={stat.label}
                        onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                        placeholder="e.g. Accuracy Rate"
                        className="text-xs h-7 focus-visible:ring-1 focus-visible:ring-brand flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveStat(idx)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              QUOTE & AUTHOR (quote layout)
          ========================================================================= */}
          {slide.layout === 'quote' && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Quote className="h-3.5 w-3.5 text-brand" />
                Quote Text &amp; Author
              </label>
              <Textarea
                value={content.quote || ''}
                onChange={(e) => onUpdateContent({ quote: e.target.value })}
                placeholder="The quote itself..."
                rows={3}
                className="text-xs resize-none focus-visible:ring-1 focus-visible:ring-brand"
              />
              <Input
                value={content.author || ''}
                onChange={(e) => onUpdateContent({ author: e.target.value })}
                placeholder="Quote Author (e.g. Satya Nadella)"
                className="text-xs focus-visible:ring-1 focus-visible:ring-brand"
              />
              <Input
                value={content.authorRole || ''}
                onChange={(e) => onUpdateContent({ authorRole: e.target.value })}
                placeholder="Author Role (e.g. Chief Executive Officer)"
                className="text-xs focus-visible:ring-1 focus-visible:ring-brand"
              />
            </div>
          )}

          {/* =========================================================================
              CALL TO ACTION (closing layout)
          ========================================================================= */}
          {slide.layout === 'closing' && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-brand" />
                {t.editor.callToAction || 'Call to Action Button'}
              </label>
              <Input
                value={content.ctaText || ''}
                onChange={(e) => onUpdateContent({ ctaText: e.target.value })}
                placeholder="e.g. Start Free Trial or Contact Sales"
                className="text-xs font-semibold"
              />
              <Input
                value={content.ctaUrl || ''}
                onChange={(e) => onUpdateContent({ ctaUrl: e.target.value })}
                placeholder="https://... or #"
                className="text-xs font-mono"
              />
            </div>
          )}

          {/* Quick Add Content Modules / Sections */}
          <div className="pt-3 border-t border-border/40 space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
              <span>{locale === 'kh' ? 'បន្ថែមផ្នែកមាតិកាថ្មី' : 'Add Content Component'}</span>
              <span className="text-[10px] text-brand font-medium">{locale === 'kh' ? 'ប្តូរប្លង់ស្វ័យប្រវត្តិ' : 'Auto-switches layout'}</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {!content.features && slide.layout !== 'feature-grid' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleAddFeature();
                    onSetLayout('feature-grid');
                  }}
                  className="h-7 text-[11px] justify-start gap-1.5 border-border/70 hover:border-brand/50 text-foreground cursor-pointer"
                >
                  <Layers className="size-3 text-brand" />
                  <span>{locale === 'kh' ? '+ កាតមុខងារ' : '+ Feature Cards'}</span>
                </Button>
              )}

              {!content.timeline && slide.layout !== 'timeline' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleAddTimeline();
                    onSetLayout('timeline');
                  }}
                  className="h-7 text-[11px] justify-start gap-1.5 border-border/70 hover:border-brand/50 text-foreground cursor-pointer"
                >
                  <Clock className="size-3 text-brand" />
                  <span>{locale === 'kh' ? '+ ផែនទីពេលវេលា' : '+ Timeline'}</span>
                </Button>
              )}

              {!content.comparison && slide.layout !== 'comparison' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleAddComparisonPoint('left');
                    onSetLayout('comparison');
                  }}
                  className="h-7 text-[11px] justify-start gap-1.5 border-border/70 hover:border-brand/50 text-foreground cursor-pointer"
                >
                  <GitCompare className="size-3 text-brand" />
                  <span>{locale === 'kh' ? '+ ប្រៀបធៀប' : '+ Comparison'}</span>
                </Button>
              )}

              {!content.takeaways && slide.layout !== 'key-takeaways' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleAddTakeaway();
                    onSetLayout('key-takeaways');
                  }}
                  className="h-7 text-[11px] justify-start gap-1.5 border-border/70 hover:border-brand/50 text-foreground cursor-pointer"
                >
                  <CheckSquare className="size-3 text-brand" />
                  <span>{locale === 'kh' ? '+ ចំណុចសំខាន់' : '+ Takeaways'}</span>
                </Button>
              )}

              {(!content.statistics || content.statistics.length === 0) && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddStat}
                  className="h-7 text-[11px] justify-start gap-1.5 border-border/70 hover:border-brand/50 text-foreground cursor-pointer"
                >
                  <TrendingUp className="size-3 text-brand" />
                  <span>{locale === 'kh' ? '+ ទិន្នន័យស្ថិតិ' : '+ Metric Stats'}</span>
                </Button>
              )}

              {(!content.bulletPoints || content.bulletPoints.length === 0) && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddBullet}
                  className="h-7 text-[11px] justify-start gap-1.5 border-border/70 hover:border-brand/50 text-foreground cursor-pointer"
                >
                  <ListOrdered className="size-3 text-brand" />
                  <span>{locale === 'kh' ? '+ ចំណុចរាយ' : '+ Bullet Points'}</span>
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            Tab 2: Layout & Theme
        ========================================================================= */}
        <TabsContent value="layout" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          {/* Layout Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layout className="h-3.5 w-3.5 text-brand" />
              Slide Layout
            </label>
            <Select
              value={slide.layout}
              onValueChange={(val) => onSetLayout(val as SlideLayout)}
            >
              <SelectTrigger className="text-xs border-border/80">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover / Title Slide</SelectItem>
                <SelectItem value="title-content">Title &amp; Content (Executive)</SelectItem>
                <SelectItem value="feature-grid">Feature Grid (3-4 Pillar Cards)</SelectItem>
                <SelectItem value="statistics">Key Statistics &amp; Metrics</SelectItem>
                <SelectItem value="timeline">Milestone Timeline Roadmap</SelectItem>
                <SelectItem value="comparison">Side-by-Side Comparison</SelectItem>
                <SelectItem value="key-takeaways">Key Takeaways List</SelectItem>
                <SelectItem value="metric-highlight">Metric Highlight Spotlight</SelectItem>
                <SelectItem value="two-columns">Two Balanced Columns</SelectItem>
                <SelectItem value="image-text">Visual Media &amp; Narrative</SelectItem>
                <SelectItem value="quote">Inspirational Quote</SelectItem>
                <SelectItem value="closing">Closing / Thank You / CTA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Selector */}
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-brand" />
              Presentation Theme
            </label>
            <Select
              value={theme}
              onValueChange={(val) => onSetTheme(val as ThemeName)}
            >
              <SelectTrigger className="text-xs border-border/80">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern-dark">Modern Dark (Keynote Classic)</SelectItem>
                <SelectItem value="minimal-light">Minimal Light (Clean White)</SelectItem>
                <SelectItem value="corporate-blue">Corporate Blue (Enterprise)</SelectItem>
                <SelectItem value="editorial">Editorial (Warm Serif)</SelectItem>
                <SelectItem value="technology-gradient">Technology Gradient</SelectItem>
                <SelectItem value="elegant-monochrome">Elegant Monochrome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Settings */}
          {(slide.layout === 'image-text' || slide.layout === 'cover') && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground">Image Settings</label>
              <Input
                value={content.imagePrompt || ''}
                onChange={(e) => onUpdateContent({ imagePrompt: e.target.value })}
                placeholder="AI visual prompt or concept"
                className="text-xs focus-visible:ring-1 focus-visible:ring-brand"
              />
              <Input
                value={content.imageUrl || ''}
                onChange={(e) => onUpdateContent({ imageUrl: e.target.value })}
                placeholder="Image URL or data URI"
                className="text-xs focus-visible:ring-1 focus-visible:ring-brand"
              />
            </div>
          )}
        </TabsContent>

        {/* =========================================================================
            Tab 3: Motion & Speaker Notes
        ========================================================================= */}
        <TabsContent value="animation" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          {/* GSAP Animation Preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Element Animation Preset
            </label>
            <Select
              value={slide.animation?.preset || 'fade-in'}
              onValueChange={(val) =>
                onSetAnimation(val as AnimationPreset, slide.animation?.duration || 0.8)
              }
            >
              <SelectTrigger className="text-xs border-border/80">
                <SelectValue placeholder="Select animation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade-in">Fade In</SelectItem>
                <SelectItem value="slide-in-left">Slide In Left</SelectItem>
                <SelectItem value="slide-in-right">Slide In Right</SelectItem>
                <SelectItem value="slide-in-up">Slide In Up</SelectItem>
                <SelectItem value="slide-in-down">Slide In Down</SelectItem>
                <SelectItem value="zoom-in">Zoom In</SelectItem>
                <SelectItem value="blur-in">Blur In</SelectItem>
                <SelectItem value="typewriter">Typewriter Reveal</SelectItem>
                <SelectItem value="stagger-text">Stagger Text</SelectItem>
                <SelectItem value="reveal">Cinematic Reveal</SelectItem>
                <SelectItem value="parallax">Parallax Float</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animation Duration Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-mono text-foreground font-semibold">
                {slide.animation?.duration || 0.8}s
              </span>
            </div>
            <Slider
              value={[slide.animation?.duration || 0.8]}
              min={0.2}
              max={2.5}
              step={0.1}
              onValueChange={(val) =>
                onSetAnimation(slide.animation?.preset || 'fade-in', val[0])
              }
            />
          </div>

          {/* Slide Transition Type */}
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MoveRight className="h-3.5 w-3.5 text-brand" />
              Slide Transition
            </label>
            <Select
              value={slide.transition?.type || 'fade'}
              onValueChange={(val) => onSetTransition(val as TransitionType)}
            >
              <SelectTrigger className="text-xs bg-stone-900 border-border/80">
                <SelectValue placeholder="Select transition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">Fade Transition</SelectItem>
                <SelectItem value="slide">Horizontal Slide</SelectItem>
                <SelectItem value="zoom">Scale Zoom</SelectItem>
                <SelectItem value="none">Instant (None)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speaker Notes */}
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-brand" />
              Speaker Notes
            </label>
            <Textarea
              value={slide.notes || ''}
              onChange={(e) => onSetNotes(e.target.value)}
              placeholder="Private notes visible in presenter mode..."
              rows={4}
              className="text-xs resize-none bg-stone-900 border-border/80 text-stone-100 placeholder:text-stone-400 focus-visible:ring-1 focus-visible:ring-brand"
            />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
