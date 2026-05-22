// apps/backend/src/main.ts

import 'reflect-metadata';
import * as Sentry from '@sentry/node';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { HttpMetricsMiddleware } from './infrastructure/metrics/http-metrics.middleware';
import { MetricsService } from './infrastructure/metrics/metrics.service';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Sentry: SENTRY_DSN varsa production'da aktif
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
      release: process.env.APP_VERSION ?? 'unknown',
    });
    logger.log('Sentry hata izleme aktif.');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust proxy for rate limiting (ThrottlerGuard) behind Nginx/Cloudflare
  app.set('trust proxy', 1);

  // CORS: CORS_ORIGIN env boşsa credentials ile wildcard açılmasın
  const rawOrigin = process.env.CORS_ORIGIN || '';
  const corsOrigin: string | string[] | false = rawOrigin
    ? rawOrigin.split(',').map((o) => o.trim())
    : false;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
    forbidNonWhitelisted: false,
  }));

  // Prometheus HTTP metrikleri — tüm route'larda ölçüm
  const metricsService = app.get(MetricsService);
  app.use((req: Parameters<HttpMetricsMiddleware['use']>[0], res: Parameters<HttpMetricsMiddleware['use']>[1], next: Parameters<HttpMetricsMiddleware['use']>[2]) => {
    const middleware = new HttpMetricsMiddleware(metricsService);
    middleware.use(req, res, next);
  });

  // Global Exception Filter: Sentry entegreli — 5xx'leri raporlar
  app.useGlobalFilters(new SentryExceptionFilter());

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
  logger.log(`Backend ${port} portunda (Express) çalışmaya başladı — ${new Date().toISOString()}`);
}

bootstrap();
