import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GeminiService } from '../gemini/gemini.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  @Get()
  async checkHealth() {
    let dbStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }

    return {
      status: 'ok',
      service: 'AI Slide Animation Studio API',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      aiModel: this.geminiService.getModelName(),
      liveGeminiConfigured: this.geminiService.isLiveApiConfigured(),
    };
  }
}
