import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let exportService: ExportService;
  let mockPresentationsService: any;

  const mockDoc = {
    id: 'p-1',
    title: 'AI Studio Demo',
    description: 'Test presentation',
    theme: 'modern-dark' as const,
    aspectRatio: '16:9' as const,
    slides: [
      {
        id: 's-1',
        slideNumber: 1,
        layout: 'cover' as const,
        content: {
          title: 'AI Studio Demo',
          subtitle: 'Standalone HTML Export Test',
          badge: 'TESTING',
        },
        notes: 'Speaker notes here',
        animation: { preset: 'fade-in' as const, duration: 0.8, delay: 0, easing: 'power2.out' as const, direction: 'none' as const },
        transition: { type: 'fade' as const, duration: 0.6, easing: 'power2.out' as const },
      },
    ],
    metadata: {
      topic: 'AI',
      language: 'English',
      audience: 'Engineers',
      tone: 'Professional',
      style: 'Modern Dark',
      theme: 'modern-dark' as const,
      aspectRatio: '16:9' as const,
      animationStyle: 'dynamic' as const,
      visualAssetPreference: 'mixed' as const,
    },
  };

  beforeEach(() => {
    mockPresentationsService = {
      findOne: vi.fn().mockResolvedValue(mockDoc),
      create: vi.fn().mockImplementation((doc) => Promise.resolve(doc)),
    };
    exportService = new ExportService(mockPresentationsService);
  });

  it('should generate standalone HTML containing slide title and player scripts', async () => {
    const { filename, html } = await exportService.exportHtml('p-1');
    expect(filename).toContain('.html');
    expect(html).toContain('AI Studio Demo');
    expect(html).toContain('Standalone HTML Export Test');
    expect(html).toContain('fitStage');
    expect(html).toContain('goToSlide');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('should export and import JSON correctly', async () => {
    const { json } = await exportService.exportJson('p-1');
    expect(json).toContain('AI Studio Demo');

    const imported = await exportService.importJson(json);
    expect(imported.title).toBe('AI Studio Demo');
    expect(imported.id).not.toBe('p-1'); // New ID generated
  });
});
