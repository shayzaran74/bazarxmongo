// apps/backend/src/main.ts

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  // CORS: Frontend'in backend ile konuşabilmesi için şart
  // Production'da origin whitelist kullan
  const corsOrigin = process.env.CORS_ORIGIN || '';
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : true,
    credentials: true,
  });

  // Cookie parser: httpOnly cookie'leri req.cookies olarak parse eder (JWT cookie auth için şart)
  app.use(cookieParser());

  // Security headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // Global prefix: /api/v1
  app.setGlobalPrefix('api/v1');
  
  // Statik dosyalar (Uploads) - Express formatına uygun güncellendi
  app.useStaticAssets(join(process.cwd(), 'public/uploads'), {
    prefix: '/uploads/',
  });

  // Global validation: whitelist, transform aktif
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Global Exception Filter: Tüm 500 hatalarını detaylı loglamak için
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Setup
  const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
  const config = new DocumentBuilder()
    .setTitle('BazarX API')
    .setDescription('BarterBorsa - BazarX V2 Backend API Dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`Backend ${port} portunda (Express) çalışmaya başladı.`);
}

bootstrap();
