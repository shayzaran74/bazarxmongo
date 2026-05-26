// apps/backend/src/modules/media/media.module.ts

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './application/services/media.service';
import { MediaController, UploadController } from './presentation/media.controller';
import { LocalStorageAdapter } from './infrastructure/local-storage.adapter';
import { MinioStorageAdapter } from './infrastructure/minio-storage.adapter';
import { MinioConfigService } from './infrastructure/minio-config.service';
import { STORAGE_ADAPTER } from './domain/storage.adapter.interface';
import { MEDIA_SERVICE } from './domain/media.service.interface';
import { MediaHealthIndicator } from './presentation/media-health.indicator';
import { MediaStreamService } from './application/services/media-stream.service';

@Module({
  controllers: [MediaController, UploadController],
  providers: [
    MinioStorageAdapter,
    LocalStorageAdapter,
    MinioConfigService,
    MediaHealthIndicator,
    MediaService,
    MediaStreamService,
    {
      provide: STORAGE_ADAPTER,
      useFactory: (config: ConfigService, minio: MinioStorageAdapter, local: LocalStorageAdapter) => {
        const type = config.get<string>('STORAGE_TYPE', 'local');
        return type === 'minio' ? minio : local;
      },
      inject: [ConfigService, MinioStorageAdapter, LocalStorageAdapter],
    },
    {
      provide: MEDIA_SERVICE,
      useClass: MediaService,
    },
  ],
  exports: [MEDIA_SERVICE, MediaService, MediaHealthIndicator, STORAGE_ADAPTER, MinioConfigService, MediaStreamService],
})
export class MediaModule implements OnModuleInit {
  constructor(private readonly minioConfig: MinioConfigService) {}

  async onModuleInit() {
    await this.minioConfig.ensureBuckets();
  }
}
