import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getAdminOverview();
  }

  @Post('server-config')
  @HttpCode(HttpStatus.OK)
  async updateServerConfig(@Body() body: { apiKey?: string; model?: string }) {
    return this.adminService.updateServerConfig(body);
  }

  @Post('test-connection')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body() body: { apiKey?: string }) {
    return this.adminService.testConnection(body);
  }

  @Get('presentations')
  async getAllPresentations() {
    return this.adminService.getAllPresentations();
  }

  @Delete('presentations/:id')
  async deletePresentation(@Param('id') id: string) {
    return this.adminService.deletePresentation(id);
  }
}
