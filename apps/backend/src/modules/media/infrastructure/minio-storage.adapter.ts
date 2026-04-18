// apps/backend/src/modules/media/infrastructure/minio-storage.adapter.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { IStorageAdapter, StorageUploadResult } from '../domain/storage.adapter.interface';

@Injectable()
export class MinioStorageAdapter implements IStorageAdapter, OnModuleInit {
  private readonly logger = new Logger(MinioStorageAdapter.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly config: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get<string>('MINIO_PORT', '9000'), 10),
      useSSL: this.config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.config.get<string>('MINIO_BUCKET_NAME', 'bazarx-media');
  }

  async onModuleInit() {
    await this.initBucket();
  }

  private async initBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        this.logger.log(`Bucket oluşturuluyor: ${this.bucketName}`);
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
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

  async upload(
    file: any, // Express.Multer.File
    subPath: string = 'products',
  ): Promise<StorageUploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${randomUUID()}${ext}`;
    const objectKey = `${subPath}/${fileName}`;

    try {
      if (file.path) {
        // Disk storage kullanılıyorsa dosyayı oku
        const buffer = await fs.readFile(file.path);
        await this.minioClient.putObject(this.bucketName, objectKey, buffer, buffer.length, {
          'Content-Type': file.mimetype,
        });
        // Temp dosyayı temizle
        await fs.unlink(file.path).catch(err => this.logger.warn(`Temp dosya silinemedi: ${err.message}`));
      } else if (file.buffer) {
        // Bellek storage kullanılıyorsa doğrudan buffer'ı gönder
        await this.minioClient.putObject(this.bucketName, objectKey, file.buffer, file.size, {
          'Content-Type': file.mimetype,
        });
      }

      this.logger.log(`Dosya MinIO'ya yüklendi: ${objectKey}`);

      // Başlangıçta URL'yi hemen dönüyoruz (1 saatlik geçerlilik)
      const publicUrl = await this.getUrl(objectKey);

      return {
        mediaId: objectKey,
        publicUrl,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`MinIO upload hatası: ${message}`);
      throw error;
    }
  }

  async getUrl(mediaId: string, _size?: string): Promise<string> {
    if (!mediaId) return '';
    try {
      // 1 saatlik (3600 sn) Presigned URL üretimi
      return await this.minioClient.presignedGetObject(this.bucketName, mediaId, 3600);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`URL üretme hatası (${mediaId}): ${message}`);
      return '';
    }
  }

  async delete(mediaId: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, mediaId);
      this.logger.log(`Dosya MinIO'dan silindi: ${mediaId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Dosya silinemedi (${mediaId}): ${message}`);
    }
  }

  // Health check için kullanılacak metod
  async checkConnection(): Promise<boolean> {
    try {
      await this.minioClient.listBuckets();
      return true;
    } catch {
      return false;
    }
  }
}
