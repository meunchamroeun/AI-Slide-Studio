import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockPrisma: any;
  let mockGemini: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    };
    mockGemini = {
      getModelName: vi.fn().mockReturnValue('gemini-2.5-flash'),
      isLiveApiConfigured: vi.fn().mockReturnValue(false),
    };
    controller = new HealthController(mockPrisma, mockGemini);
  });

  it('should return healthy status and database connection', async () => {
    const res = await controller.checkHealth();
    expect(res.status).toBe('ok');
    expect(res.database).toBe('connected');
    expect(res.aiModel).toBe('gemini-2.5-flash');
  });
});
