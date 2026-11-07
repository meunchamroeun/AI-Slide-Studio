import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    const config = new ConfigService({
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash',
    });
    service = new GeminiService(config);
  });

  it('should generate a valid presentation document with correct slide count in fallback/deterministic mode', async () => {
    const result = await service.generatePresentation({
      prompt: 'Artificial Intelligence and Future Robotics',
      slideCount: 6,
      language: 'English',
      audience: 'Executive Leaders',
      tone: 'Inspiring',
      style: 'Modern SaaS Dark',
      theme: 'modern-dark',
      aspectRatio: '16:9',
      animationStyle: 'dynamic',
      visualAssetPreference: 'mixed',
    });

    expect(result).toBeDefined();
    expect(result.slides).toHaveLength(6);
    expect(result.slides[0].layout).toBe('cover');
    expect(result.slides[5].layout).toBe('closing');
    expect(result.theme).toBe('modern-dark');
  });

  it('should regenerate a single slide while preserving slide number', async () => {
    const existing = {
      id: 's-1',
      slideNumber: 2,
      layout: 'title-content' as const,
      content: {
        title: 'Initial Title',
      },
      notes: 'Initial notes',
      animation: { preset: 'fade-in' as const, duration: 0.8, delay: 0, easing: 'power2.out' as const, direction: 'none' as const },
      transition: { type: 'fade' as const, duration: 0.6, easing: 'power2.out' as const },
    };

    const regenerated = await service.regenerateSlide(2, existing, 'Updated Metrics', 'statistics');
    expect(regenerated.slideNumber).toBe(2);
    expect(regenerated.layout).toBe('statistics');
  });

  it('should rewrite text based on instruction', async () => {
    const text = 'Artificial Intelligence is really changing the way we develop software quickly.';
    const shortened = await service.rewriteText(text, 'shorten');
    expect(shortened).toBeDefined();

    const bulletPoints = await service.rewriteText('Planning, Building, Testing, Deploying', 'bullet-points');
    expect(bulletPoints).toContain('•');
  });
});
