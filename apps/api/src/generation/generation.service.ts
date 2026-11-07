import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { PresentationsService } from '../presentations/presentations.service';
import { PrismaService } from '../database/prisma.service';
import {
  GeneratePresentationDto,
  GeneratePresentationDtoSchema,
  RegenerateSlideDto,
  RegenerateSlideDtoSchema,
  RewriteContentDto,
  RewriteContentDtoSchema,
  PresentationDocument,
  Slide,
} from '@ai-slide-studio/shared';

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly presentationsService: PresentationsService,
    private readonly prisma: PrismaService,
  ) {}

  async generatePresentation(input: GeneratePresentationDto): Promise<PresentationDocument> {
    const validatedDto = GeneratePresentationDtoSchema.parse(input);
    const startTime = Date.now();

    let jobRecord: any = null;
    try {
      jobRecord = await this.prisma.generationJob.create({
        data: {
          prompt: validatedDto.prompt,
          model: this.geminiService.getModelName(),
          status: 'pending',
          slideCount: validatedDto.slideCount,
        },
      });
    } catch (e) {
      this.logger.warn(`Could not log initial generation job: ${e}`);
    }

    try {
      // Generate document via Gemini / Deterministic AI service
      const document = await this.geminiService.generatePresentation(validatedDto);

      // Save to database
      const saved = await this.presentationsService.create(document);

      if (jobRecord) {
        await this.prisma.generationJob.update({
          where: { id: jobRecord.id },
          data: {
            presentationId: saved.id,
            status: 'completed',
            durationMs: Date.now() - startTime,
          },
        });
      }

      return saved;
    } catch (error: any) {
      this.logger.error(`Generation error: ${error.message || error}`);
      if (jobRecord) {
        await this.prisma.generationJob.update({
          where: { id: jobRecord.id },
          data: {
            status: 'failed',
            error: error.message || 'Unknown generation error',
            durationMs: Date.now() - startTime,
          },
        });
      }
      throw error;
    }
  }

  async regenerateSlide(presentationId: string, slideId: string, input: RegenerateSlideDto): Promise<Slide> {
    const validatedDto = RegenerateSlideDtoSchema.parse(input);
    const presentation = await this.presentationsService.findOne(presentationId);

    const slideIndex = presentation.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) {
      throw new NotFoundException(`Slide "${slideId}" was not found in presentation "${presentationId}".`);
    }

    const existingSlide = presentation.slides[slideIndex];
    const regenerated = await this.geminiService.regenerateSlide(
      existingSlide.slideNumber,
      existingSlide,
      validatedDto.prompt,
      validatedDto.layout,
    );

    // Keep existing notes if requested
    if (validatedDto.preserveNotes && existingSlide.notes) {
      regenerated.notes = existingSlide.notes;
    }

    // Update in presentation document
    presentation.slides[slideIndex] = regenerated;
    await this.presentationsService.update(presentationId, {
      slides: presentation.slides,
    });

    return regenerated;
  }

  async rewriteContent(input: RewriteContentDto): Promise<{ text: string }> {
    const validatedDto = RewriteContentDtoSchema.parse(input);
    const rewritten = await this.geminiService.rewriteText(validatedDto.text, validatedDto.instruction);
    return { text: rewritten };
  }
}
