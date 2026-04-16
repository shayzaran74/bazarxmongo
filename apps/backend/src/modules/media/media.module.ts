// apps/backend/src/modules/media/media.module.ts
import { Global, Module } from '@nestjs/common';
import { MediaService } from './application/services/media.service';
import { MediaController } from './presentation/media.controller';
import { LocalStorageAdapter } from './infrastructure/local-storage.adapter';
import { STORAGE_ADAPTER } from './domain/storage.adapter.interface';
import { MEDIA_SERVICE } from './domain/media.service.interface';

@Global()
@Module({
  controllers: [MediaController],
  providers: [
    {
      provide: STORAGE_ADAPTER,
      useClass: LocalStorageAdapter,
    },
    {
      provide: MEDIA_SERVICE,
      useClass: MediaService,
    },
  ],
  exports: [MEDIA_SERVICE],
})
export class MediaModule {}
