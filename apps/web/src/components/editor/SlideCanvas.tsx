'use client';

import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { Slide, ThemeName, AspectRatio } from '@ai-slide-studio/shared';
import { Button } from '@/components/ui/button';
import { SlideRenderer } from '@/components/slides/SlideRenderer';
import { useFitScale } from '@/hooks/useFitScale';

interface SlideCanvasProps {
  slide: Slide;
  theme: ThemeName;
  aspectRatio: AspectRatio;
  currentIndex: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onReplayAnimation: () => void;
  onPresent: () => void;
  onSelectAspectRatio?: (ratio: AspectRatio) => void;
}

export function SlideCanvas({
  slide,
  theme,
  aspectRatio,
  currentIndex,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onReplayAnimation,
  onPresent,
  onSelectAspectRatio,
}: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localReplay, setLocalReplay] = useState(0);

  const is169 = aspectRatio === '16:9';
  const targetWidth = is169 ? 1920 : 1440;
  const targetHeight = 1080;

  const { scale } = useFitScale(containerRef, aspectRatio);

  const handleReplay = () => {
    setLocalReplay((c) => c + 1);
    onReplayAnimation();
  };

  return (
    <div className="flex-1 flex flex-col bg-background/95 overflow-hidden h-full">
      {/* Canvas Header / Controls */}
      <div className="h-10 px-4 border-b border-border/40 bg-card/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-foreground">
            Slide {currentIndex + 1} of {totalSlides}
          </span>
          <span className="text-border">&bull;</span>
          <span className="font-mono uppercase text-[10px]">{slide.layout}</span>
          <span className="text-border">&bull;</span>
          <span className="font-mono text-[10px] text-primary capitalize">
            {slide.animation?.preset || 'fade-in'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Aspect Ratio Toggle */}
          {onSelectAspectRatio && (
            <div className="flex items-center rounded-md bg-secondary/50 p-0.5 border border-border/50 text-[10px]">
              <button
                type="button"
                onClick={() => onSelectAspectRatio('16:9')}
                className={`px-2 py-0.5 rounded font-mono transition-colors ${
                  aspectRatio === '16:9'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                16:9
              </button>
              <button
                type="button"
                onClick={() => onSelectAspectRatio('4:3')}
                className={`px-2 py-0.5 rounded font-mono transition-colors ${
                  aspectRatio === '4:3'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                4:3
              </button>
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReplay}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 transition-all active:scale-95"
            title="Replay GSAP and CSS animations"
          >
            <RotateCcw className="h-3 w-3 text-primary animate-pulse" />
            <span className="hidden sm:inline font-medium text-foreground">Animate</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onPresent}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            title="Present Fullscreen"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Fullscreen</span>
          </Button>
        </div>
      </div>

      {/* Main Viewport where 1920x1080 stage is scaled */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-hidden relative"
      >
        <div
          style={{
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl shadow-black/80 rounded-2xl overflow-hidden shrink-0 border border-border/60 bg-black/40"
        >
          <SlideRenderer
            key={`${slide.id}-${localReplay}`}
            slide={slide}
            themeName={theme}
            isInteractive={false}
            replayTrigger={localReplay}
          />
        </div>
      </div>

      {/* Canvas Bottom Navigation Bar */}
      <div className="h-12 border-t border-border/40 bg-card/30 px-6 flex items-center justify-between shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={onPrevSlide}
          disabled={currentIndex <= 0}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Slide
        </Button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onNextSlide}
          disabled={currentIndex >= totalSlides - 1}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 gap-1"
        >
          Next Slide
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
