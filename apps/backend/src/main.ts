// apps/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { 
  FastifyAdapter, 
  NestFastifyApplication 
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // CORS: Frontend'in backend ile konuşabilmesi için şart
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefix: /api/v1
  app.setGlobalPrefix('api/v1');
  
  // Statik dosyalar (Uploads)
  app.useStaticAssets({
    root: join(process.cwd(), 'public/uploads'),
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
  
  logger.log(`Backend ${port} portunda çalışmaya başladı.`);
}

bootstrap();
