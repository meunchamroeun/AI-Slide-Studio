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
} from 'lucide-react';
import { PresentationDocument } from '@ai-slide-studio/shared';
import { Button } from '@/components/ui/button';
import { SlideRenderer } from '@/components/slides/SlideRenderer';
import { useFitScale } from '@/hooks/useFitScale';

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
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, onClose, router, document.id]);

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
    }, 3000);
  };

  const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none cursor-default"
    >
      {/* Top Bar (Auto-fades) */}
      <div
        className={`absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between z-30 transition-opacity duration-300 ${
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
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay Speed */}
          <div className="flex items-center rounded-lg bg-white/10 p-1 text-xs">
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

      {/* Main Slide Stage */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden"
      >
        <div
          style={{
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className="shrink-0 overflow-hidden"
        >
          <SlideRenderer
            key={currentSlide.id}
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
              Speaker Notes (Slide {currentSlideIndex + 1})
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
        className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent px-6 flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={prevSlide}
            className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/15"
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
            className="h-9 w-9 text-white/90 hover:text-white hover:bg-white/15"
            title="Next (Right Arrow or Space)"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Slide Counter */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-white/90 tracking-wider">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
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
