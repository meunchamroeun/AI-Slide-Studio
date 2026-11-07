import { Controller, Get, Post, Param, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';

@Controller('presentations')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get(':id/export/html')
  async exportHtml(@Param('id') id: string, @Res() res: Response) {
    const { filename, html } = await this.exportService.exportHtml(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  }

  @Get(':id/export/pdf')
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const { filename, buffer } = await this.exportService.exportPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id/export/json')
  async exportJson(@Param('id') id: string, @Res() res: Response) {
    const { filename, json } = await this.exportService.exportJson(id);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(json);
  }

  @Post('import/json')
  async importJson(@Body('json') json: string) {
    return this.exportService.importJson(json);
  }
}
