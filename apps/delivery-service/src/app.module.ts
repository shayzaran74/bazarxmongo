import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { LoggerModule, HealthModule } from '@barterborsa/shared-observability';
import appConfig from './config/app.config';
import mongodbConfig from './config/mongodb.config';
import grpcConfig from './config/grpc.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { ShipmentModule } from './modules/shipment/shipment.module';
import { TrackingModule } from './modules/tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/delivery-service/.env'],
      load: [appConfig, mongodbConfig, grpcConfig, rabbitmqConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') || config.get<string>('uri'),
        maxPoolSize: 50,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
      }),
    }),
    RabbitMQModule,
    LoggerModule,
    HealthModule,
    ShipmentModule,
    TrackingModule,
  ],
})
export class AppModule {}
