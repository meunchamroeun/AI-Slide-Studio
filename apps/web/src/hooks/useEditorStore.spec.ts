import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from './useEditorStore';
import { PresentationDocument } from '@ai-slide-studio/shared';

describe('useEditorStore', () => {
  const initialDoc: PresentationDocument = {
    id: 'test-pres-1',
    title: 'Initial Presentation',
    description: 'A test presentation',
    theme: 'modern-dark',
    aspectRatio: '16:9',
    slides: [
      {
        id: 's-1',
        slideNumber: 1,
        layout: 'cover',
        content: { title: 'First Slide', subtitle: 'Hello World' },
        notes: '',
        animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      },
      {
        id: 's-2',
        slideNumber: 2,
        layout: 'title-content',
        content: { title: 'Second Slide', bulletPoints: ['Bullet 1'] },
        notes: '',
        animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
        transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
      },
    ],
    metadata: {
      topic: 'Test Topic',
      language: 'English',
      audience: 'Engineers',
      tone: 'Professional',
      style: 'Modern SaaS Dark',
      theme: 'modern-dark',
      aspectRatio: '16:9',
      animationStyle: 'dynamic',
      visualAssetPreference: 'mixed',
      version: '1.0.0',
    },
  };

  it('initializes with document and default active slide', () => {
    const { result } = renderHook(() => useEditorStore(initialDoc));
    expect(result.current.document.title).toBe('Initial Presentation');
    expect(result.current.activeSlideIndex).toBe(0);
    expect(result.current.activeSlide?.content.title).toBe('First Slide');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('updates title and supports undo / redo', () => {
    const { result } = renderHook(() => useEditorStore(initialDoc));

    act(() => {
      result.current.setTitle('Updated Title');
    });

    expect(result.current.document.title).toBe('Updated Title');
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.document.title).toBe('Initial Presentation');
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });

    expect(result.current.document.title).toBe('Updated Title');
  });

  it('adds a new slide', () => {
    const { result } = renderHook(() => useEditorStore(initialDoc));

    act(() => {
      result.current.addSlide('quote');
    });

    expect(result.current.document.slides.length).toBe(3);
    expect(result.current.activeSlideIndex).toBe(1);
    expect(result.current.activeSlide?.layout).toBe('quote');
  });

  it('duplicates an active slide', () => {
    const { result } = renderHook(() => useEditorStore(initialDoc));

    act(() => {
      result.current.duplicateSlide(0);
    });

    expect(result.current.document.slides.length).toBe(3);
    expect(result.current.document.slides[1].content.title).toBe('First Slide');
  });

  it('deletes a slide without leaving empty document', () => {
    const { result } = renderHook(() => useEditorStore(initialDoc));

    act(() => {
      result.current.deleteSlide(0);
    });

    expect(result.current.document.slides.length).toBe(1);
    expect(result.current.document.slides[0].content.title).toBe('Second Slide');

    // Deleting last remaining slide is prevented
    act(() => {
      result.current.deleteSlide(0);
    });

    expect(result.current.document.slides.length).toBe(1);
  });

  it('reorders slides correctly', () => {
    const { result } = renderHook(() => useEditorStore(initialDoc));

    act(() => {
      result.current.moveSlide(0, 1);
    });

    expect(result.current.document.slides[0].content.title).toBe('Second Slide');
    expect(result.current.document.slides[1].content.title).toBe('First Slide');
  });
});
