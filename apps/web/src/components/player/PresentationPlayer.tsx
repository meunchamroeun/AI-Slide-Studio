'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Play,
  Pause,
  X,
  FileText,
  Clock,
  Languages,
} from 'lucide-react';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Button } from '@/components/ui/button';
import { SlideRenderer } from '@/components/slides/SlideRenderer';
import { useFitScale } from '@/hooks/useFitScale';
import { useI18n } from '@/components/i18n-provider';

interface PresentationPlayerProps {
  document: PresentationDocument;
  initialSlideIndex?: number;
  onClose?: () => void;
}

export function PresentationPlayer({
  document,
  initialSlideIndex = 0,
  onClose,
}: PresentationPlayerProps) {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(5000);
  const [showNotes, setShowNotes] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = document.slides.length;
  const currentSlide = document.slides[currentSlideIndex] || document.slides[0];

  const is169 = document.aspectRatio === '16:9';
  const targetWidth = is169 ? 1920 : 1440;
  const targetHeight = 1080;

  const { scale } = useFitScale(containerRef, document.aspectRatio);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        nextSlide();
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(totalSlides - 1);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          if (window.document.exitFullscreen) {
            window.document.exitFullscreen().catch(() => {});
          }
        } else if (onClose) {
          onClose();
        } else {
          router.push(`/presentations/${document.id}`);
        }
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'p') {
        setIsAutoplaying((prev) => !prev);
      } else if (e.key.toLowerCase() === 'l') {
        setLocale(locale === 'en' ? 'kh' : 'en');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, onClose, router, document.id, totalSlides, locale, setLocale]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoplaying) {
      timer = setInterval(() => {
        nextSlide();
      }, autoplayInterval);
    }
    return () => clearInterval(timer);
  }, [isAutoplaying, autoplayInterval, nextSlide]);

  const toggleFullscreen = () => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  // Canva-style side clicking (left 30% goes back, right 70% goes forward)
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, select, input, [role="button"]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.3) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none cursor-default font-sans"
    >
      {/* Top Bar (Auto-fades with smooth transition) */}
      <div
        className={`absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/85 via-black/40 to-transparent px-6 flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              if (onClose) onClose();
              else router.push(`/presentations/${document.id}`);
            }}
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            title="Exit Presentation"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-white/90 line-clamp-1 max-w-md">
            {document.title}
          </span>
          <span className="text-white/40 text-xs">&bull;</span>
          <span className="text-xs font-mono text-white/60 uppercase">
            {currentSlide.layout}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher (EN / KH) */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'kh' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white/90 border border-white/15 transition-all cursor-pointer"
            title="Toggle Language (L)"
          >
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span>{locale.toUpperCase()}</span>
          </button>

          {/* Autoplay Speed */}
          <div className="flex items-center rounded-lg bg-white/10 px-2 py-1 text-xs border border-white/15">
            <Clock className="h-3.5 w-3.5 mr-1 text-white/60" />
            <select
              value={autoplayInterval}
              onChange={(e) => setAutoplayInterval(Number(e.target.value))}
              className="bg-transparent text-white/90 text-xs focus:outline-none cursor-pointer"
            >
              <option value={3000} className="bg-neutral-900 text-white">3s</option>
              <option value={5000} className="bg-neutral-900 text-white">5s</option>
              <option value={8000} className="bg-neutral-900 text-white">8s</option>
              <option value={10000} className="bg-neutral-900 text-white">10s</option>
            </select>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            className={`h-9 w-9 ${
              showNotes ? 'text-primary bg-white/15' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Speaker Notes"
          >
            <FileText className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Slide Stage with Canva-style Click Navigation */}
      <div
        ref={containerRef}
        onClick={handleStageClick}
        className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden cursor-pointer"
        title="Click right side for Next, left side for Previous"
      >
        <div
          style={{
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className="shrink-0 overflow-hidden shadow-2xl rounded-2xl border border-white/10"
        >
          <SlideRenderer
            key={`${currentSlide.id}-${currentSlideIndex}`}
            slide={currentSlide}
            themeName={document.theme}
            isInteractive={false}
          />
        </div>
      </div>

      {/* Speaker Notes Drawer */}
      {showNotes && currentSlide.notes && (
        <div className="absolute bottom-16 right-6 z-40 max-w-sm w-full bg-neutral-900/95 border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {t.editor.speakerNotes} (Slide {currentSlideIndex + 1})
            </span>
            <button
              onClick={() => setShowNotes(false)}
              className="text-white/50 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {currentSlide.notes}
          </p>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-6 flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={prevSlide}
            disabled={currentSlideIndex <= 0}
            className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-30"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsAutoplaying(!isAutoplaying)}
            className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/15"
            title={isAutoplaying ? 'Pause Autoplay (P)' : 'Start Autoplay (P)'}
          >
            {isAutoplaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={nextSlide}
            disabled={currentSlideIndex >= totalSlides - 1}
            className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-30"
            title="Next (Right Arrow or Space)"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Slide Counter & Next indicator */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-white/90 tracking-wider">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          {currentSlideIndex < totalSlides - 1 && (
            <span className="text-xs text-white/50 hidden md:inline">
              Next: {document.slides[currentSlideIndex + 1]?.content.title}
            </span>
          )}
        </div>
      </div>

      {/* Thin Progress Bar at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-40">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
