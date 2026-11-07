import { describe, it, expect } from 'vitest';
import {
  GeneratePresentationDtoSchema,
  PresentationDocumentSchema,
  SlideSchema,
} from './presentation.schema';

describe('Presentation Schema Validation', () => {
  it('should validate valid generate presentation DTO', () => {
    const input = {
      prompt: 'Create an 8-slide presentation on Artificial Intelligence and its future impact.',
      slideCount: 8,
      language: 'English',
      audience: 'Executive Leadership',
      tone: 'Visionary & Practical',
      style: 'Modern SaaS Dark',
      theme: 'modern-dark',
      aspectRatio: '16:9',
      animationStyle: 'dynamic',
      visualAssetPreference: 'mixed',
    };

    const parsed = GeneratePresentationDtoSchema.parse(input);
    expect(parsed.slideCount).toBe(8);
    expect(parsed.theme).toBe('modern-dark');
  });

  it('should reject invalid slide count', () => {
    const input = {
      prompt: 'Short presentation',
      slideCount: 1, // min is 3
    };

    expect(() => GeneratePresentationDtoSchema.parse(input)).toThrow();
  });

  it('should parse and populate defaults for SlideSchema', () => {
    const slide = {
      id: 'slide-1',
      slideNumber: 1,
      layout: 'cover',
      content: {
        title: 'Artificial Intelligence: The Next Frontier',
        subtitle: 'From foundation models to autonomous systems',
      },
    };

    const parsed = SlideSchema.parse(slide);
    expect(parsed.animation.preset).toBe('fade-in');
    expect(parsed.transition.type).toBe('fade');
    expect(parsed.notes).toBe('');
  });

  it('should validate full presentation document', () => {
    const document = {
      id: 'pres-123',
      title: 'AI Revolution',
      description: 'Comprehensive overview of modern generative AI',
      theme: 'modern-dark',
      aspectRatio: '16:9',
      slides: [
        {
          id: 's-1',
          slideNumber: 1,
          layout: 'cover',
          content: {
            title: 'AI Revolution',
            subtitle: 'Overview',
          },
        },
      ],
      metadata: {
        topic: 'AI',
        language: 'English',
        audience: 'Tech Leads',
        tone: 'Professional',
        style: 'Modern SaaS Dark',
        theme: 'modern-dark',
        aspectRatio: '16:9',
        animationStyle: 'dynamic',
        visualAssetPreference: 'mixed',
      },
    };

    const parsed = PresentationDocumentSchema.parse(document);
    expect(parsed.slides).toHaveLength(1);
    expect(parsed.title).toBe('AI Revolution');
  });
});
