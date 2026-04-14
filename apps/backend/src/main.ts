// apps/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { 
  FastifyAdapter, 
  NestFastifyApplication 
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

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

  // Global validation: whitelist, transform aktif
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Global Exception Filter: Tüm 500 hatalarını detaylı loglamak için
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`Backend ${port} portunda çalışmaya başladı.`);
}

bootstrap();
