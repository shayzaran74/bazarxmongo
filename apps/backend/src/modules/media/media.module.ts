// apps/backend/src/modules/media/media.module.ts

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './application/services/media.service';
import { MediaController, UploadController } from './presentation/media.controller';
import { LocalStorageAdapter } from './infrastructure/local-storage.adapter';
import { MinioStorageAdapter } from './infrastructure/minio-storage.adapter';
import { STORAGE_ADAPTER } from './domain/storage.adapter.interface';
import { MEDIA_SERVICE } from './domain/media.service.interface';
import { MediaHealthIndicator } from './presentation/media-health.indicator';

@Global()
@Module({
  controllers: [MediaController, UploadController],
  providers: [
    MinioStorageAdapter,
    LocalStorageAdapter,
    MediaHealthIndicator,
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
  exports: [MEDIA_SERVICE, MediaHealthIndicator],
})
export class MediaModule {}
