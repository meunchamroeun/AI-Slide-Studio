'use client';

import React from 'react';
import {
  Type,
  Layout,
  Palette,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  MoveRight,
  TrendingUp,
} from 'lucide-react';
import {
  Slide,
  SlideLayout,
  ThemeName,
  AnimationPreset,
  TransitionType,
  StatisticItem,
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

interface PropertyPanelProps {
  slide: Slide;
  theme: ThemeName;
  onUpdateContent: (contentUpdates: Partial<Slide['content']>) => void;
  onSetLayout: (layout: SlideLayout) => void;
  onSetTheme: (theme: ThemeName) => void;
  onSetAnimation: (preset: AnimationPreset, duration?: number) => void;
  onSetTransition: (type: TransitionType) => void;
  onSetNotes: (notes: string) => void;
}

export function PropertyPanel({
  slide,
  theme,
  onUpdateContent,
  onSetLayout,
  onSetTheme,
  onSetAnimation,
  onSetTransition,
  onSetNotes,
}: PropertyPanelProps) {
  const { t } = useI18n();
  const content = slide.content || { title: '' };

  const handleTitleChange = (val: string) => {
    onUpdateContent({ title: val });
  };

  const handleSubtitleChange = (val: string) => {
    onUpdateContent({ subtitle: val });
  };

  // Bullet points handlers
  const handleBulletChange = (index: number, val: string) => {
    const currentBullets = [...(content.bulletPoints || [])];
    currentBullets[index] = val;
    onUpdateContent({ bulletPoints: currentBullets });
  };

  const handleAddBullet = () => {
    const currentBullets = [...(content.bulletPoints || [])];
    currentBullets.push('New key takeaway or supporting point');
    onUpdateContent({ bulletPoints: currentBullets });
  };

  const handleRemoveBullet = (index: number) => {
    const currentBullets = (content.bulletPoints || []).filter((_, i) => i !== index);
    onUpdateContent({ bulletPoints: currentBullets });
  };

  // Statistics metric handlers
  const handleAddStat = () => {
    const currentStats: StatisticItem[] = [...(content.statistics || [])];
    currentStats.push({
      id: `stat-${Date.now()}`,
      value: '+45%',
      label: 'Efficiency Gain',
      subtext: 'Year-over-Year',
      icon: 'activity',
    });
    onUpdateContent({ statistics: currentStats });
  };

  const handleUpdateStat = (index: number, field: keyof StatisticItem, val: string) => {
    const currentStats = [...(content.statistics || [])];
    if (currentStats[index]) {
      currentStats[index] = { ...currentStats[index], [field]: val };
      onUpdateContent({ statistics: currentStats });
    }
  };

  const handleRemoveStat = (index: number) => {
    const currentStats = (content.statistics || []).filter((_, i) => i !== index);
    onUpdateContent({ statistics: currentStats });
  };

  return (
    <aside className="w-80 border-l border-border/60 bg-card/40 flex flex-col shrink-0 h-full overflow-hidden">
      <Tabs defaultValue="content" className="flex flex-col h-full">
        {/* Tab Headers */}
        <div className="p-3 border-b border-border/50 bg-card/60">
          <TabsList className="grid grid-cols-3 w-full h-8 bg-secondary/50">
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

        {/* Tab 1: Slide Content */}
        <TabsContent value="content" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-primary" />
              {t.editor.titleField}
            </label>
            <Input
              value={content.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t.editor.titleField}
              className="text-xs bg-background/60"
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
              className="text-xs resize-none bg-background/60"
            />
          </div>

          {/* Bullet Points */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">{t.editor.bulletPoints}</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddBullet}
                className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10 gap-1"
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
                    className="text-xs resize-none bg-background/60 flex-1 min-h-[46px]"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveBullet(idx)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 mt-1"
                    title="Remove point"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics metrics */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Metric Stats
              </label>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddStat}
                className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10 gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Stat
              </Button>
            </div>

            <div className="space-y-2">
              {(content.statistics || []).map((stat, idx) => (
                <div
                  key={stat.id || idx}
                  className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={stat.value}
                      onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                      placeholder="e.g. 98.4%"
                      className="text-xs font-mono font-bold h-7 bg-background/60 w-24"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                      placeholder="e.g. Accuracy Rate"
                      className="text-xs h-7 bg-background/60 flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveStat(idx)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote & Author (if quote layout) */}
          {slide.layout === 'quote' && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground">Quote Text &amp; Author</label>
              <Textarea
                value={content.quote || ''}
                onChange={(e) => onUpdateContent({ quote: e.target.value })}
                placeholder="The quote itself..."
                rows={3}
                className="text-xs resize-none bg-background/60"
              />
              <Input
                value={content.author || ''}
                onChange={(e) => onUpdateContent({ author: e.target.value })}
                placeholder="Quote Author (e.g. Satya Nadella, CEO)"
                className="text-xs bg-background/60"
              />
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Layout & Theme */}
        <TabsContent value="layout" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          {/* Layout Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layout className="h-3.5 w-3.5 text-primary" />
              Slide Layout
            </label>
            <Select
              value={slide.layout}
              onValueChange={(val) => onSetLayout(val as SlideLayout)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover Slide</SelectItem>
                <SelectItem value="title-content">Title &amp; Content</SelectItem>
                <SelectItem value="two-columns">Two Columns</SelectItem>
                <SelectItem value="image-text">Image &amp; Text</SelectItem>
                <SelectItem value="quote">Executive Quote</SelectItem>
                <SelectItem value="statistics">Statistics &amp; Metrics</SelectItem>
                <SelectItem value="timeline">Timeline Milestones</SelectItem>
                <SelectItem value="comparison">Comparison Grid</SelectItem>
                <SelectItem value="key-takeaways">Key Takeaways</SelectItem>
                <SelectItem value="closing">Closing Slide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Global Presentation Theme */}
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-primary" />
              Presentation Theme
            </label>
            <Select
              value={theme}
              onValueChange={(val) => onSetTheme(val as ThemeName)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern-dark">Modern Dark</SelectItem>
                <SelectItem value="minimal-light">Minimal Light</SelectItem>
                <SelectItem value="corporate-blue">Corporate Blue</SelectItem>
                <SelectItem value="editorial">Editorial Warm</SelectItem>
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
                className="text-xs bg-background/60"
              />
              <Input
                value={content.imageUrl || ''}
                onChange={(e) => onUpdateContent({ imageUrl: e.target.value })}
                placeholder="Image URL or data URI"
                className="text-xs bg-background/60"
              />
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Motion & Speaker Notes */}
        <TabsContent value="animation" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
          {/* GSAP Animation Preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Element Animation Preset
            </label>
            <Select
              value={slide.animation?.preset || 'fade-in'}
              onValueChange={(val) =>
                onSetAnimation(val as AnimationPreset, slide.animation?.duration || 0.8)
              }
            >
              <SelectTrigger className="text-xs">
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
              <MoveRight className="h-3.5 w-3.5 text-primary" />
              Slide Transition
            </label>
            <Select
              value={slide.transition?.type || 'fade'}
              onValueChange={(val) => onSetTransition(val as TransitionType)}
            >
              <SelectTrigger className="text-xs">
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
              <FileText className="h-3.5 w-3.5 text-primary" />
              Speaker Notes
            </label>
            <Textarea
              value={slide.notes || ''}
              onChange={(e) => onSetNotes(e.target.value)}
              placeholder="Private notes visible in presenter mode..."
              rows={4}
              className="text-xs resize-none bg-background/60"
            />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
