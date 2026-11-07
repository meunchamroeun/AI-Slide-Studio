import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { PrismaService } from '../database/prisma.service';

export const SUPER_ADMIN_EMAIL = 'meunchamroeun09@gmail.com';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly prisma: PrismaService,
  ) {}

  async getAdminOverview() {
    let presentationCount = 0;
    let jobCount = 0;
    let recentJobs: any[] = [];

    try {
      presentationCount = await this.prisma.presentation.count();
      jobCount = await this.prisma.generationJob.count();
      recentJobs = await this.prisma.generationJob.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      this.logger.warn(`Could not fetch prisma counts: ${e}`);
    }

    const serverConfig = this.geminiService.getServerConfig();

    return {
      superAdminEmail: SUPER_ADMIN_EMAIL,
      serverConfig: {
        hasApiKey: serverConfig.hasApiKey,
        model: serverConfig.model,
        isLive: serverConfig.isLive,
      },
      stats: {
        totalPresentations: presentationCount,
        totalGenerationJobs: jobCount,
        recentJobs,
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
      },
      users: [
        {
          id: 'usr-admin-01',
          name: 'Chamroeun Meun',
          email: SUPER_ADMIN_EMAIL,
          role: 'admin',
          isSuperAdmin: true,
          status: 'Active',
          lastActive: new Date().toISOString(),
        },
        {
          id: 'usr-demo-01',
          name: 'Alex Morgan',
          email: 'alex.morgan@slidestudio.ai',
          role: 'user',
          isSuperAdmin: false,
          status: 'Active',
          lastActive: new Date().toISOString(),
        },
      ],
    };
  }

  async updateServerConfig(data: { apiKey?: string; model?: string }) {
    this.logger.log(`Admin ${SUPER_ADMIN_EMAIL} updating server Gemini config`);
    return this.geminiService.updateServerConfig(data.apiKey, data.model);
  }

  async testConnection(data?: { apiKey?: string }) {
    this.logger.log(`Testing Gemini API connection...`);
    return this.geminiService.testApiKey(data?.apiKey);
  }

  async getAllPresentations() {
    return this.prisma.presentation.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        theme: true,
        aspectRatio: true,
        slideCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deletePresentation(id: string) {
    this.logger.log(`Admin deleting presentation: ${id}`);
    return this.prisma.presentation.delete({
      where: { id },
    });
  }
}
