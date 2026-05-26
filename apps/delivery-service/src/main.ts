import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('DeliveryService');
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  const config = app.get(ConfigService);

  // gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${config.get('grpcPort')}`,
      package: 'barterborsa.delivery',
      protoPath: config.get('resolvedProtoPath'),
    },
  });

  // Global Ayarlar
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();

  const port = config.get('port');
  const grpcPort = config.get('grpcPort');
  
  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
  
  logger.log(`Delivery Service is running on: http://localhost:${port}`);
  logger.log(`gRPC Microservice is running on: 0.0.0.0:${grpcPort}`);
}

bootstrap();
