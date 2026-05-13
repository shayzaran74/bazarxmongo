// apps/backend/src/modules/media/infrastructure/minio-storage.adapter.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { IStorageAdapter, StorageUploadResult } from '../domain/storage.adapter.interface';

@Injectable()
export class MinioStorageAdapter implements IStorageAdapter, OnModuleInit {
  private readonly logger = new Logger(MinioStorageAdapter.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly cdnBase: string;
  private readonly isProd: boolean;
  private readonly minioPublicEndpoint: string;

  constructor(private readonly config: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get<string>('MINIO_PORT', '9000'), 10),
      useSSL: this.config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.config.get<string>('MINIO_BUCKET_NAME', 'bazarx-media');
    this.cdnBase = this.config.get<string>(
      'MINIO_CDN_BASE',
      'https://storage.bazarx.com.tr/bazarx-media',
    );
    const nodeEnv = process.env.NODE_ENV || this.config.get('NODE_ENV');
    const minioEndpoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    
    // Eğer NODE_ENV production ise VEYA minio endpoint 'minio' (docker internal) ise prod moduna geç
    const isProduction = nodeEnv === 'production' || minioEndpoint === 'minio';
    this.isProd = isProduction;

    // Local dev'de MinIO'nun doğrudan adresi (tarayıcının erişebileceği)
    const port     = this.config.get<string>('MINIO_PORT', '9000');
    this.minioPublicEndpoint = isProduction ? '' : `http://${minioEndpoint}:${port}`;
  }

  async onModuleInit() {
    await this.initBucket();
  }

  private async initBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket oluşturuldu: ${this.bucketName}`);
      } else {
        this.logger.log(`MinIO Connection OK. Bucket: ${this.bucketName}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('BucketAlreadyOwnedByYou') || message.includes('already own it')) {
        this.logger.log(`MinIO Connection OK. Bucket: ${this.bucketName} (Already owned)`);
        return;
      }
      this.logger.error(`MinIO başlatma hatası: ${message}`);
    }
  }

  async upload(file: any, subPath: string = 'products'): Promise<StorageUploadResult> {
    const buffer: Buffer = file.buffer;
    const uuid = randomUUID();
    const prefix = `${subPath}/${uuid}`;

    const variants: { name: string; width: number | null; quality: number }[] = [
      { name: 'thumb',    width: 300,  quality: 78 },
      { name: 'medium',   width: 600,  quality: 82 },
      { name: 'large',    width: 1200, quality: 85 },
      { name: 'original', width: null, quality: 88 },
    ];

    let blurhash: string | null = null;
    try {
      const { data, info } = await sharp(buffer)
        .resize(32, 32, { fit: 'inside' })
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });
      blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
    } catch (error) {
      this.logger.warn(`Blurhash üretilemedi: ${error instanceof Error ? error.message : String(error)}`);
    }

    await Promise.all(
      variants.map(async (v) => {
        const processedBuffer = v.width !== null
          ? await sharp(buffer)
              .resize(v.width, undefined, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: v.quality })
              .toBuffer()
          : await sharp(buffer)
              .webp({ quality: v.quality })
              .toBuffer();

        await this.minioClient.putObject(
          this.bucketName,
          `${prefix}/${v.name}.webp`,
          processedBuffer,
          processedBuffer.length,
          { 'Content-Type': 'image/webp' },
        );
      }),
    );

    this.logger.log(`Yüklendi: ${prefix} (4 varyant)`);

    const publicUrl = this.buildUrl(prefix, 'medium');
    return { mediaId: prefix, publicUrl, blurhash };
  }

  async getUrl(mediaId: string, size: string = 'medium'): Promise<string> {
    if (!mediaId) return '';
    return this.buildUrl(mediaId, size);
  }

  async delete(mediaId: string): Promise<void> {
    const objects = ['thumb', 'medium', 'large', 'original']
      .map((v) => `${mediaId}/${v}.webp`);

    const errors = await this.minioClient.removeObjects(this.bucketName, objects);

    const failed = errors.filter((e) => e && e.Error?.Code);
    if (failed.length > 0) {
      this.logger.warn(
        `Bazı varyantlar silinemedi (${mediaId}): ` +
        failed.map((e) => `${e?.Error?.Key}: ${e?.Error?.Code}`).join(', '),
      );
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.minioClient.listBuckets();
      return true;
    } catch {
      return false;
    }
  }

  private buildUrl(mediaId: string, size: string): string {
    const sizeMap: Record<string, string> = {
      thumb: 'thumb',
      medium: 'medium',
      large: 'large',
      original: 'original',
    };
    const sizeFile = sizeMap[size] ?? 'medium';
    const objectKey = `${mediaId}/${sizeFile}.webp`;

    if (this.isProd) {
      // Production: Uygulamanın ana domaini üzerinden /bazarx-media/ path'i ile eriş
      const appUrl = process.env.APP_BASE_URL || '';
      if (appUrl) {
        return `${appUrl}/bazarx-media/${objectKey}`;
      }
      return `${this.cdnBase}/${objectKey}`;
    }

    // Development: MinIO'nun doğrudan adresi — bucket adını da ekle
    return `${this.minioPublicEndpoint}/${this.bucketName}/${objectKey}`;
  }

  /** Presigned URL üret (private bucket'lar için) */
  async getPresignedUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucketName, objectKey, expirySeconds);
  }
}