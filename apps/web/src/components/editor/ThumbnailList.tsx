'use client';

import React from 'react';
import {
  Plus,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Slide, SlideLayout } from '@ai-slide-studio/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/i18n-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThumbnailListProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
}

export function ThumbnailList({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
}: ThumbnailListProps) {
  const { t } = useI18n();

  const layoutOptions: { id: SlideLayout; label: string }[] = [
    { id: 'cover', label: 'Cover Slide' },
    { id: 'title-content', label: 'Title & Content' },
    { id: 'two-columns', label: 'Two Columns' },
    { id: 'image-text', label: 'Image & Text' },
    { id: 'quote', label: 'Executive Quote' },
    { id: 'statistics', label: 'Statistics & Metrics' },
    { id: 'timeline', label: 'Timeline Milestones' },
    { id: 'comparison', label: 'Comparison Grid' },
    { id: 'key-takeaways', label: 'Key Takeaways' },
    { id: 'closing', label: 'Closing & Contact' },
  ];

  return (
    <aside className="w-56 border-r border-border/60 bg-card/40 flex flex-col justify-between shrink-0 h-full overflow-hidden">
      {/* Top Header & Add Slide Button */}
      <div className="p-3 border-b border-border/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          {t.editor.slides} ({slides.length})
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1"
            >
              <Plus className="h-3 w-3" />
              {t.common.add}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 text-xs max-h-80 overflow-y-auto">
            {layoutOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onAddSlide(opt.id)}
                className="cursor-pointer"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thumbnails Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          const isFirst = index === 0;
          const isLast = index === slides.length - 1;

          return (
            <div
              key={slide.id || index}
              onClick={() => onSelectSlide(index)}
              className={cn(
                'group relative rounded-lg border transition-all duration-150 p-2 cursor-pointer flex flex-col justify-between',
                isActive
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/40 shadow-sm'
                  : 'bg-card/70 border-border/70 hover:border-border hover:bg-secondary/40'
              )}
            >
              {/* Thumbnail Header Bar */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {index + 1}
                </span>

                {/* Quick actions on hover */}
                <div
                  className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isFirst}
                    onClick={() => onMoveSlide(index, index - 1)}
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    title="Move Up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isLast}
                    onClick={() => onMoveSlide(index, index + 1)}
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    title="Move Down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDuplicateSlide(index)}
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    title="Duplicate Slide"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={slides.length <= 1}
                    onClick={() => onDeleteSlide(index)}
                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                    title="Delete Slide"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Mini Slide Preview Card */}
              <div className="aspect-video w-full rounded bg-background/80 border border-border/50 p-2 flex flex-col justify-between overflow-hidden">
                <p className="text-[10px] font-bold text-foreground line-clamp-1 leading-tight">
                  {slide.content?.title || `Slide ${index + 1}`}
                </p>
                <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                  <span className="truncate max-w-[80px] font-mono uppercase">{slide.layout}</span>
                  <span className="font-mono">{slide.animation?.preset || 'fade'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-border/40 text-[10px] text-muted-foreground text-center">
        <span>Use &uarr; &darr; to navigate slides</span>
      </div>
    </aside>
  );
}
