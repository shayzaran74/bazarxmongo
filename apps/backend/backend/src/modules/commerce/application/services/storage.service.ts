// apps/backend/src/modules/commerce/application/services/storage.service.ts
// Fatura PDF'lerini MinIO'ya yükler.
// Eski versiyon lokal FS kullanıyordu — container restart'ta dosyalar kayboluyordu.
// MinIO bucket: MINIO_INVOICE_BUCKET (default: bazarx-invoices)

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export interface StorageUploadResult {
  url: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>('MINIO_INVOICE_BUCKET', 'bazarx-invoices');
    this.publicUrl = config.get<string>('MINIO_CDN_BASE', 'https://storage.bazarx.com');

    this.client = new Minio.Client({
      endPoint: config.get<string>('MINIO_ENDPOINT', 'minio'),
      port: parseInt(config.get<string>('MINIO_PORT', '9000'), 10),
      useSSL: config.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: config.get<string>('MINIO_ACCESS_KEY', ''),
      secretKey: config.get<string>('MINIO_SECRET_KEY', ''),
    });

    this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'eu-central-1');
        this.logger.log(`Bucket oluşturuldu: ${this.bucket}`);
      }
    } catch (err: unknown) {
      this.logger.warn(`Bucket kontrol hatası: ${(err instanceof Error ? (err instanceof Error ? (err instanceof Error ? (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) : String(err)) : String(err)) : String(err))}`);
    }
  }

  async upload(
    buffer: Buffer,
    key: string,
    mimeType = 'application/pdf',
  ): Promise<StorageUploadResult> {
    await this.client.putObject(
      this.bucket,
      key,
      buffer,
      buffer.length,
      {
        'Content-Type': mimeType,
        'Cache-Control': 'private, max-age=86400',
      },
    );

    this.logger.log(`Dosya MinIO'ya yüklendi: ${this.bucket}/${key}`);

    return {
      url: `${this.publicUrl}/${this.bucket}/${key}`,
      key,
    };
  }

  async getBuffer(key: string): Promise<Buffer | null> {
    try {
      const stream = await this.client.getObject(this.bucket, key);
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'NoSuchKey') return null;
      throw err;
    }
  }

  /** Geçici imzalı URL üret (private invoice'lar için) */
  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }
}
