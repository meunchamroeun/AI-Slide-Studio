import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { GeminiModule } from '../gemini/gemini.module';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [GeminiModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
