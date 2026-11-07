import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  PresentationDocument,
  PresentationDocumentSchema,
  Slide,
} from '@ai-slide-studio/shared';

@Injectable()
export class PresentationsService {
  private readonly logger = new Logger(PresentationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.presentation.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        theme: true,
        aspectRatio: true,
        slideCount: true,
        createdAt: true,
        updatedAt: true,
        document: true,
      },
    });
  }

  async findOne(id: string): Promise<PresentationDocument> {
    const record = await this.prisma.presentation.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Presentation with ID "${id}" was not found.`);
    }

    // Parse and validate document JSON
    return PresentationDocumentSchema.parse(record.document);
  }

  async create(document: PresentationDocument) {
    const validated = PresentationDocumentSchema.parse(document);

    const record = await this.prisma.presentation.create({
      data: {
        id: validated.id,
        title: validated.title,
        description: validated.description || '',
        theme: validated.theme,
        aspectRatio: validated.aspectRatio,
        slideCount: validated.slides.length,
        document: validated as any,
      },
    });

    this.logger.log(`Created presentation ${record.id} ("${record.title}")`);
    return validated;
  }

  async update(id: string, updateData: Partial<PresentationDocument>) {
    const existing = await this.findOne(id);
    const updatedDocument: PresentationDocument = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    const validated = PresentationDocumentSchema.parse(updatedDocument);

    await this.prisma.presentation.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description || '',
        theme: validated.theme,
        aspectRatio: validated.aspectRatio,
        slideCount: validated.slides.length,
        document: validated as any,
      },
    });

    return validated;
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence
    await this.prisma.presentation.delete({
      where: { id },
    });
    this.logger.log(`Deleted presentation ${id}`);
    return { success: true, message: `Presentation ${id} deleted successfully.` };
  }

  async duplicate(id: string): Promise<PresentationDocument> {
    const original = await this.findOne(id);

    const duplicatedDoc: PresentationDocument = {
      ...original,
      id: `pres-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: original.slides.map((s, idx) => ({
        ...s,
        id: `slide-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    };

    return this.create(duplicatedDoc);
  }
}
