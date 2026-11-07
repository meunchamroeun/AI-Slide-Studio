import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './database/prisma.module';
import { GeminiModule } from './gemini/gemini.module';
import { PresentationsModule } from './presentations/presentations.module';
import { GenerationModule } from './generation/generation.module';
import { ExportModule } from './export/export.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    GeminiModule,
    PresentationsModule,
    GenerationModule,
    ExportModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
