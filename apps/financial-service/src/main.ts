// apps/financial-service/src/main.ts

import { NestFactory } from '@nestjs/core';
import { 
  FastifyAdapter, 
  NestFastifyApplication 
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('FinancialBootstrap');
  
  // Create NestJS app with Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // gRPC Microservice Configuration
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'financial',
      protoPath: join(__dirname, './grpc/financial.proto'),
      url: '0.0.0.0:50051',
    },
  });

  // REST API Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Start Microservices
  await app.startAllMicroservices();
  
  // Start REST Server
  const port = process.env.FINANCIAL_PORT || 3004;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`Financial Service is running on REST: ${port} and gRPC: 50051`);
}

bootstrap();
