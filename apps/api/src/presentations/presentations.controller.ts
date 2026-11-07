import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { PresentationDocument } from '@ai-slide-studio/shared';

@Controller('presentations')
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) {}

  @Get()
  async findAll() {
    return this.presentationsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() document: PresentationDocument) {
    return this.presentationsService.create(document);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.presentationsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<PresentationDocument>) {
    return this.presentationsService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.presentationsService.remove(id);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(@Param('id') id: string) {
    return this.presentationsService.duplicate(id);
  }
}
