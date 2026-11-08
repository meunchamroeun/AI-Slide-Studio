import { useState, useCallback, useRef, useEffect } from 'react';
import {
  PresentationDocument,
  Slide,
  SlideLayout,
  ThemeName,
  AspectRatio,
  AnimationPreset,
  TransitionType,
} from '@ai-slide-studio/shared';
import { api } from '@/services/api';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export function useEditorStore(initialDocument: PresentationDocument) {
  const [document, setDocument] = useState<PresentationDocument>(initialDocument);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  // History stacks for Undo / Redo
  const pastRef = useRef<PresentationDocument[]>([]);
  const futureRef = useRef<PresentationDocument[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Debounced autosave timer
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateHistoryState = () => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };

  const scheduleAutosave = useCallback(
    (newDoc: PresentationDocument) => {
      setSaveStatus('unsaved');
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          setSaveStatus('saving');
          await api.updatePresentation(newDoc.id, newDoc);
          setSaveStatus('saved');
        } catch (error) {
          console.error('Autosave error:', error);
          setSaveStatus('error');
        }
      }, 1200);
    },
    [],
  );

  const pushState = useCallback((newDoc: PresentationDocument) => {
    pastRef.current.push(document);
    if (pastRef.current.length > 30) {
      pastRef.current.shift(); // keep max 30 history states
    }
    futureRef.current = [];
    updateHistoryState();
    setDocument(newDoc);
    scheduleAutosave(newDoc);
  }, [document, scheduleAutosave]);

  // Undo
  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current.pop()!;
    futureRef.current.push(document);
    updateHistoryState();
    setDocument(previous);
    scheduleAutosave(previous);
  }, [document, scheduleAutosave]);

  // Redo
  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    pastRef.current.push(document);
    updateHistoryState();
    setDocument(next);
    scheduleAutosave(next);
  }, [document, scheduleAutosave]);

  // Active slide
  const activeSlide: Slide | undefined = document.slides[activeSlideIndex] || document.slides[0];

  // Slide mutations
  const updateActiveSlide = useCallback(
    (updater: (slide: Slide) => Slide) => {
      if (!activeSlide) return;
      const updatedSlides = document.slides.map((s, idx) => {
        if (idx === activeSlideIndex) {
          return updater(s);
        }
        return s;
      });

      const updatedDoc = {
        ...document,
        slides: updatedSlides,
        updatedAt: new Date().toISOString(),
      };

      pushState(updatedDoc);
    },
    [activeSlide, activeSlideIndex, document, pushState],
  );

  const updateSlideContent = useCallback(
    (contentUpdates: Partial<Slide['content']>) => {
      updateActiveSlide((slide) => ({
        ...slide,
        content: {
          ...slide.content,
          ...contentUpdates,
        },
      }));
    },
    [updateActiveSlide],
  );

  const setSlideLayout = useCallback(
    (layout: SlideLayout) => {
      updateActiveSlide((slide) => ({
        ...slide,
        layout,
      }));
    },
    [updateActiveSlide],
  );

  const setSlideAnimation = useCallback(
    (preset: AnimationPreset, duration = 0.8) => {
      updateActiveSlide((slide) => ({
        ...slide,
        animation: {
          ...slide.animation,
          preset,
          duration,
        },
      }));
    },
    [updateActiveSlide],
  );

  const setSlideTransition = useCallback(
    (type: TransitionType) => {
      updateActiveSlide((slide) => ({
        ...slide,
        transition: {
          ...slide.transition,
          type,
        },
      }));
    },
    [updateActiveSlide],
  );

  const setSlideNotes = useCallback(
    (notes: string) => {
      updateActiveSlide((slide) => ({
        ...slide,
        notes,
      }));
    },
    [updateActiveSlide],
  );

  // Document level mutations
  const setTheme = useCallback(
    (theme: ThemeName) => {
      const updatedDoc = {
        ...document,
        theme,
        updatedAt: new Date().toISOString(),
      };
      pushState(updatedDoc);
    },
    [document, pushState],
  );

  const setAspectRatio = useCallback(
    (aspectRatio: AspectRatio) => {
      const updatedDoc = {
        ...document,
        aspectRatio,
        updatedAt: new Date().toISOString(),
      };
      pushState(updatedDoc);
    },
    [document, pushState],
  );

  const setTitle = useCallback(
    (title: string) => {
      const updatedDoc = {
        ...document,
        title,
        updatedAt: new Date().toISOString(),
      };
      pushState(updatedDoc);
    },
    [document, pushState],
  );

  // Add Slide
  const addSlide = useCallback(
    (layout: SlideLayout = 'title-content') => {
      const newSlide: Slide = {
        id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        slideNumber: document.slides.length + 1,
        layout,
        content: {
          title: 'New Slide Title',
          subtitle: 'Click on properties panel to customize content and layout',
          bulletPoints: ['First key insight or strategic takeaway', 'Second supporting data point or detail'],
        },
        notes: '',
        animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      };

      const insertIndex = activeSlideIndex + 1;
      const updatedSlides = [
        ...document.slides.slice(0, insertIndex),
        newSlide,
        ...document.slides.slice(insertIndex),
      ].map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

      const updatedDoc = {
        ...document,
        slides: updatedSlides,
        updatedAt: new Date().toISOString(),
      };

      pushState(updatedDoc);
      setActiveSlideIndex(insertIndex);
    },
    [activeSlideIndex, document, pushState],
  );

  // Duplicate Slide
  const duplicateSlide = useCallback(
    (indexToDuplicate = activeSlideIndex) => {
      const target = document.slides[indexToDuplicate];
      if (!target) return;

      const duplicated: Slide = {
        ...target,
        id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        content: JSON.parse(JSON.stringify(target.content)),
      };

      const insertIndex = indexToDuplicate + 1;
      const updatedSlides = [
        ...document.slides.slice(0, insertIndex),
        duplicated,
        ...document.slides.slice(insertIndex),
      ].map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

      const updatedDoc = {
        ...document,
        slides: updatedSlides,
        updatedAt: new Date().toISOString(),
      };

      pushState(updatedDoc);
      setActiveSlideIndex(insertIndex);
    },
    [activeSlideIndex, document, pushState],
  );

  // Delete Slide
  const deleteSlide = useCallback(
    (indexToDelete = activeSlideIndex) => {
      if (document.slides.length <= 1) return; // Keep at least one slide

      const updatedSlides = document.slides
        .filter((_, idx) => idx !== indexToDelete)
        .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

      const nextActiveIndex = Math.min(activeSlideIndex, updatedSlides.length - 1);

      const updatedDoc = {
        ...document,
        slides: updatedSlides,
        updatedAt: new Date().toISOString(),
      };

      pushState(updatedDoc);
      setActiveSlideIndex(nextActiveIndex);
    },
    [activeSlideIndex, document, pushState],
  );

  // Reorder Slides
  const moveSlide = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= document.slides.length || fromIndex === toIndex) return;

      const updatedSlides = [...document.slides];
      const [moved] = updatedSlides.splice(fromIndex, 1);
      updatedSlides.splice(toIndex, 0, moved);

      const reindexed = updatedSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

      const updatedDoc = {
        ...document,
        slides: reindexed,
        updatedAt: new Date().toISOString(),
      };

      pushState(updatedDoc);
      setActiveSlideIndex(toIndex);
    },
    [document, pushState],
  );

  // Explicit Save
  const saveNow = useCallback(async () => {
    try {
      setSaveStatus('saving');
      await api.updatePresentation(document.id, document);
      setSaveStatus('saved');
    } catch (e) {
      console.error('Manual save failed:', e);
      setSaveStatus('error');
    }
  }, [document]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  const replaceSlide = useCallback(
    (slideOrId: string | Slide, maybeSlide?: Slide) => {
      let targetId: string = '';
      let newSlide: Slide;

      if (typeof slideOrId === 'string' && maybeSlide) {
        targetId = slideOrId;
        newSlide = maybeSlide;
      } else if (typeof slideOrId === 'object' && slideOrId) {
        newSlide = slideOrId;
        targetId = newSlide.id || (activeSlide ? activeSlide.id : '');
      } else {
        return;
      }

      const updatedSlides = document.slides.map((s, idx) => {
        if (s.id === targetId || (!targetId && idx === activeSlideIndex) || (activeSlide && s.id === activeSlide.id)) {
          return {
            ...newSlide,
            id: s.id,
            slideNumber: s.slideNumber,
          };
        }
        return s;
      });

      const updatedDoc = {
        ...document,
        slides: updatedSlides,
        updatedAt: new Date().toISOString(),
      };

      pushState(updatedDoc);
    },
    [activeSlide, activeSlideIndex, document, pushState],
  );

  return {
    document,
    setDocument,
    activeSlide,
    activeSlideIndex,
    setActiveSlideIndex,
    saveStatus,
    canUndo,
    canRedo,
    undo,
    redo,
    saveNow,
    // Mutations
    updateActiveSlide,
    replaceSlide,
    updateSlideContent,
    setSlideLayout,
    setSlideAnimation,
    setSlideTransition,
    setSlideNotes,
    setTheme,
    setAspectRatio,
    setTitle,
    addSlide,
    duplicateSlide,
    deleteSlide,
    moveSlide,
  };
}
