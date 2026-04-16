// apps/backend/src/modules/media/infrastructure/minio-storage.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { IStorageAdapter, StorageUploadResult } from '../domain/storage.adapter.interface';

@Injectable()
export class MinioStorageAdapter implements IStorageAdapter {
  private readonly logger = new Logger(MinioStorageAdapter.name);

  async upload(file: any, path: string): Promise<StorageUploadResult> {
    this.logger.warn('MinioStorageAdapter henüz tam olarak uygulanmadı (İskelet)');
    
    // TODO: MinIO Client (S3) entegrasyonu buraya gelecek
    // 1. Minio client baslat
    // 2. putObject ile yukle
    
    return {
      mediaId: `minio_placeholder_${Date.now()}`,
      publicUrl: 'https://cdn.barterborsa.com/placeholder.webp',
    };
  }

  async getUrl(mediaId: string, size?: string): Promise<string> {
    // CDN üzerinden Signed URL üretimi veya Image Proxy (IPX) rotası
    return `https://cdn.barterborsa.com/${size || 'original'}/${mediaId}`;
  }

  async delete(mediaId: string): Promise<void> {
    this.logger.log(`MinIO'dan silme isteği: ${mediaId}`);
  }
}
