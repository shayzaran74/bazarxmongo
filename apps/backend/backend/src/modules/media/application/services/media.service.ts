// apps/backend/src/modules/media/application/services/media.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Ok, Err, Result } from '@barterborsa/shared-core';
import {
  IMediaService,
  MediaSize,
  UploadedMediaResult,
} from '../../domain/media.service.interface';
import {
  IStorageAdapter,
  STORAGE_ADAPTER,
} from '../../domain/storage.adapter.interface';

@Injectable()
export class MediaService implements IMediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(STORAGE_ADAPTER)
    private readonly storage: IStorageAdapter,
  ) {}

  async resolveUrl(
    mediaIdOrUrl: string,
    size: MediaSize = 'original',
  ): Promise<string> {
    if (!mediaIdOrUrl) return '';

    if (mediaIdOrUrl.startsWith('http')) {
      return mediaIdOrUrl;
    }

    return this.storage.getUrl(mediaIdOrUrl, size);
  }

  async processAndUpload(
    file: any, // Express.Multer.File
    metadata?: Record<string, unknown>,
  ): Promise<Result<UploadedMediaResult>> {
    try {
      const subPath = (metadata?.subPath as string) ?? 'products';
      const { mediaId, publicUrl, blurhash } = await this.storage.upload(file, subPath);

      return Ok({
        mediaId,
        url: publicUrl,
        blurhash,
      });
    } catch (error) {
      this.logger.error('Medya yükleme hatası', error);
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async generateBlurhash(_url: string): Promise<string | null> {
    return null;
  }
}
