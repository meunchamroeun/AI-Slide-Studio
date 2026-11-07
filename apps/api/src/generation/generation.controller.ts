import { Controller, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { GenerationService } from './generation.service';
import {
  GeneratePresentationDto,
  RegenerateSlideDto,
  RewriteContentDto,
} from '@ai-slide-studio/shared';

@Controller('generation')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('presentations')
  @HttpCode(HttpStatus.CREATED)
  async generatePresentation(@Body() dto: GeneratePresentationDto) {
    return this.generationService.generatePresentation(dto);
  }

  @Post('presentations/:presentationId/slides/:slideId/regenerate')
  async regenerateSlide(
    @Param('presentationId') presentationId: string,
    @Param('slideId') slideId: string,
    @Body() dto: RegenerateSlideDto,
  ) {
    return this.generationService.regenerateSlide(presentationId, slideId, dto);
  }

  @Post('slides/rewrite')
  async rewriteContent(@Body() dto: RewriteContentDto) {
    return this.generationService.rewriteContent(dto);
  }
}
