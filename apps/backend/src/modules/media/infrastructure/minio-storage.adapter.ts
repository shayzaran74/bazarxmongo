// apps/backend/src/modules/media/infrastructure/minio-storage.adapter.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { IStorageAdapter, StorageUploadResult } from '../domain/storage.adapter.interface';
import * as path from 'path';

// local-storage.adapter.ts ile aynı whitelist — bucket prefix injection önleme
const SAFE_SUBPATH_RE = /^[a-zA-Z0-9_-]+$/;
const ALLOWED_SUBPATHS = new Set(['products', 'avatars', 'documents', 'surplus', 'banners', 'categories', 'brands']);

function sanitizeSubPath(subPath: string): string {
  const cleaned = subPath.trim().toLowerCase();
  if (!SAFE_SUBPATH_RE.test(cleaned) || !ALLOWED_SUBPATHS.has(cleaned)) {
    throw new BadRequestException(`Geçersiz subPath: "${subPath}". İzin verilenler: ${[...ALLOWED_SUBPATHS].join(', ')}`);
  }
  return cleaned;
}

@Injectable()
export class MinioStorageAdapter implements IStorageAdapter {
  private readonly logger = new Logger(MinioStorageAdapter.name);
  private minioClient: Minio.Client;
  private readonly publicBucket: string;
  private readonly privateBucket: string;
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
    this.publicBucket = this.config.get<string>('MINIO_PUBLIC_BUCKET', 'bazarx-media');
    this.privateBucket = this.config.get<string>('MINIO_PRIVATE_BUCKET', 'bazarx-documents');
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

  private getBucketFromMediaId(mediaId: string): string {
    if (!mediaId) return this.publicBucket;
    const subPath = mediaId.split('/')[0];
    return subPath === 'documents' ? this.privateBucket : this.publicBucket;
  }

  async upload(file: Express.Multer.File, subPath: string = 'products'): Promise<StorageUploadResult> {
    const safeSubPath = sanitizeSubPath(subPath);
    const targetBucket = safeSubPath === 'documents' ? this.privateBucket : this.publicBucket;
    const buffer: Buffer = file.buffer;
    const uuid = randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = file.mimetype.startsWith('image/');

    // Eğer subPath 'documents' ise veya resim değilse, doğrudan orijinal dosyayı yükle (Sharp resizing pas geçilir)
    if (safeSubPath === 'documents' || !isImage) {
      const objectKey = `${safeSubPath}/${uuid}${ext || '.bin'}`;
      
      await this.minioClient.putObject(
        targetBucket,
        objectKey,
        buffer,
        buffer.length,
        { 'Content-Type': file.mimetype },
      );
      
      this.logger.log(`Dosya yüklendi (Doğrudan): ${objectKey} -> ${targetBucket}`);
      
      // Belgeler için varsayılan olarak getUrl çağrıldığında presigned URL dönecektir
      const publicUrl = await this.getUrl(objectKey, 'original');
      return { mediaId: objectKey, publicUrl, blurhash: null };
    }

    // Görsel dosyaları için 4 farklı varyant oluşturup yükleme
    const prefix = `${safeSubPath}/${uuid}`;
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
        try {
          const processedBuffer = v.width !== null
            ? await sharp(buffer)
                .resize(v.width, undefined, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: v.quality })
                .toBuffer()
            : await sharp(buffer)
                .webp({ quality: v.quality })
                .toBuffer();

          await this.minioClient.putObject(
            targetBucket,
            `${prefix}/${v.name}.webp`,
            processedBuffer,
            processedBuffer.length,
            { 'Content-Type': 'image/webp' },
          );
        } catch (err) {
          this.logger.error(`Varyant oluşturma hatası (${v.name}): ${err instanceof Error ? err.message : String(err)}`);
          if (v.name === 'original' || v.name === 'medium') throw err;
        }
      }),
    );

    this.logger.log(`Görsel varyantları yüklendi: ${prefix} -> ${targetBucket}`);

    const publicUrl = await this.getUrl(prefix, 'medium');
    return { mediaId: prefix, publicUrl, blurhash };
  }

  async getUrl(mediaId: string, size: string = 'medium'): Promise<string> {
    if (!mediaId) return '';
    const bucket = this.getBucketFromMediaId(mediaId);
    
    // Özel belgeler için doğrudan erişim yerine presigned (imzalı) URL üretilir
    if (bucket === this.privateBucket) {
      return this.getPresignedUrl(mediaId, 3600);
    }
    
    return this.buildUrl(mediaId, size);
  }

  async delete(mediaId: string): Promise<void> {
    const bucket = this.getBucketFromMediaId(mediaId);
    
    // Eğer uuid doğrudan dosya uzantısına sahipse tek bir obje silinir
    if (mediaId.includes('.')) {
      try {
        await this.minioClient.removeObject(bucket, mediaId);
        this.logger.log(`Dosya silindi: ${mediaId} -> ${bucket}`);
      } catch (err) {
        this.logger.error(`Dosya silme hatası: ${err instanceof Error ? err.message : String(err)}`);
      }
      return;
    }

    // Görsel varyantlarını topluca silme
    const objects = ['thumb', 'medium', 'large', 'original']
      .map((v) => `${mediaId}/${v}.webp`);

    const errors = await this.minioClient.removeObjects(bucket, objects);

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

    const appUrl = process.env.APP_BASE_URL;
    if (appUrl) {
      return `${appUrl}/bazarx-media/${objectKey}`;
    }
    return `${this.cdnBase}/${objectKey}`;
  }

  /** Presigned URL üret (private bucket'lar için) */
  async getPresignedUrl(objectKey: string, expirySeconds = 3600, bucketName?: string): Promise<string> {
    const targetBucket = bucketName || this.getBucketFromMediaId(objectKey);
    return this.minioClient.presignedGetObject(targetBucket, objectKey, expirySeconds);
  }
}