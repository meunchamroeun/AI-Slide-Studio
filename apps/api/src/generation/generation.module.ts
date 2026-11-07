import { Module } from '@nestjs/common';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { GeminiModule } from '../gemini/gemini.module';
import { PresentationsModule } from '../presentations/presentations.module';

@Module({
  imports: [GeminiModule, PresentationsModule],
  controllers: [GenerationController],
  providers: [GenerationService],
  exports: [GenerationService],
})
export class GenerationModule {}
