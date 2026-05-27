// apps/backend/src/modules/media/domain/media.service.interface.ts
import { Result } from '@barterborsa/shared-core';

export type MediaSize = 'thumb' | 'medium' | 'large' | 'original';

export interface UploadedMediaResult {
  mediaId: string;
  url: string;
  blurhash: string | null;
  width?: number;
  height?: number;
}

export interface IMediaService {
  // async olarak tanımlıyoruz — B'de signed URL async üretilecek
  resolveUrl(mediaIdOrUrl: string, size?: MediaSize): Promise<string>;
  processAndUpload(
    file: any, // Multer.File tipi
    metadata?: Record<string, unknown>
  ): Promise<Result<UploadedMediaResult>>; // string yerine zengin DTO
  generateBlurhash(url: string): Promise<string | null>;
}

export const MEDIA_SERVICE = 'IMediaService';
