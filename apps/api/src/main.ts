import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 4000;
  const apiPrefix = configService.get<string>('apiPrefix') || 'api';
  const corsOrigin = configService.get<string>('corsOrigin') || 'http://localhost:3000';

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible presentation preview & iframe scaling
    }),
  );

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 120, // limit each IP to 120 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        message: 'Too many requests, please try again later.',
      },
    }),
  );

  // CORS configuration supporting local dev, Vercel deployments, and custom domains
  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server or requests without origin
      if (!origin) return callback(null, true);
      if (
        corsOrigin === '*' ||
        origin === corsOrigin ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.ice-tea.me') ||
        origin === 'https://ice-tea.me' ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      const allowedList = corsOrigin.split(',').map((s) => s.trim());
      if (allowedList.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global route prefix
  app.setGlobalPrefix(apiPrefix);

  await app.listen(port);
  logger.log(`AI Slide Animation Studio API is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health endpoint: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();
