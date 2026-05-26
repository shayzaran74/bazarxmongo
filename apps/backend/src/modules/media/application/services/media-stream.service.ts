// apps/backend/src/modules/media/application/services/media-stream.service.ts

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class MediaStreamService {
  private readonly logger = new Logger(MediaStreamService.name);
  private minioClient: Minio.Client | null = null;
  private readonly publicBucket: string;
  private readonly storageType: string;
  private readonly uploadDir: string;

  constructor(private readonly config: ConfigService) {
    this.storageType = this.config.get<string>('STORAGE_TYPE', 'local');
    this.publicBucket = this.config.get<string>('MINIO_PUBLIC_BUCKET', 'bazarx-media');
    this.uploadDir = this.config.get<string>('UPLOAD_DIR', './public/uploads');

    if (this.storageType === 'minio') {
      this.minioClient = new Minio.Client({
        endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
        port: parseInt(this.config.get<string>('MINIO_PORT', '9000'), 10),
        useSSL: this.config.get<string>('MINIO_USE_SSL') === 'true',
        accessKey: this.config.get<string>('MINIO_ACCESS_KEY'),
        secretKey: this.config.get<string>('MINIO_SECRET_KEY'),
      });
    }
  }

  /**
   * Path traversal ve güvenlik kontrolleri yapar.
   */
  private validateKey(objectKey: string): void {
    if (!objectKey) {
      throw new BadRequestException('Dosya anahtarı (objectKey) boş olamaz.');
    }

    // Path traversal (../ veya ..\) kontrolü
    const hasPathTraversal = objectKey.includes('..') || path.isAbsolute(objectKey);
    if (hasPathTraversal) {
      throw new BadRequestException('Geçersiz dosya anahtarı veya path traversal algılandı.');
    }

    // bazarx-documents (özel) bucket'ındaki verilerin çekilmesini engelle
    const firstSegment = objectKey.split('/')[0];
    if (firstSegment === 'documents') {
      throw new BadRequestException('Özel belgelere bu kanal üzerinden erişilemez.');
    }
  }

  /**
   * Dosya uzantısına göre MIME-Type belirler.
   */
  private lookupMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.webp':
        return 'image/webp';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      case '.pdf':
        return 'application/pdf';
      case '.txt':
        return 'text/plain';
      case '.json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Dosyanın mevcut olup olmadığını kontrol eder.
   */
  async objectExists(objectKey: string): Promise<boolean> {
    this.validateKey(objectKey);

    if (this.storageType === 'minio' && this.minioClient) {
      try {
        await this.minioClient.statObject(this.publicBucket, objectKey);
        return true;
      } catch (err: any) {
        if (err.code === 'NoSuchKey') {
          return false;
        }
        this.logger.error(`MinIO stat error for key ${objectKey}: ${err.message}`);
        return false;
      }
    } else {
      // Local depolama
      const resolvedUploadDir = path.resolve(this.uploadDir);
      const targetPath = path.join(resolvedUploadDir, objectKey);

      // Path traversal ek kontrolü
      if (!targetPath.startsWith(resolvedUploadDir + path.sep)) {
        return false;
      }

      try {
        await fsPromises.access(targetPath, fs.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Hedef görseli stream olarak okur ve gerekli metadata (contentType, size, etag) ile döner.
   */
  async streamObject(objectKey: string): Promise<{ stream: Readable; contentType: string; size: number; etag: string }> {
    this.validateKey(objectKey);

    if (this.storageType === 'minio' && this.minioClient) {
      try {
        const stat = await this.minioClient.statObject(this.publicBucket, objectKey);
        const stream = await this.minioClient.getObject(this.publicBucket, objectKey);

        const contentType = stat.metaData?.['content-type'] ||
                            this.lookupMimeType(objectKey);

        return {
          stream,
          contentType,
          size: stat.size,
          etag: stat.etag,
        };
      } catch (err: any) {
        this.logger.error(`MinIO stream get error for key ${objectKey}: ${err.message}`);
        throw new NotFoundException('Dosya bulunamadı.');
      }
    } else {
      // Local depolama
      const resolvedUploadDir = path.resolve(this.uploadDir);
      const targetPath = path.join(resolvedUploadDir, objectKey);

      if (!targetPath.startsWith(resolvedUploadDir + path.sep)) {
        throw new BadRequestException('Geçersiz dosya yolu.');
      }

      try {
        const stat = await fsPromises.stat(targetPath);
        const stream = fs.createReadStream(targetPath);
        const contentType = this.lookupMimeType(targetPath);
        const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;

        return {
          stream,
          contentType,
          size: stat.size,
          etag,
        };
      } catch (err: any) {
        throw new NotFoundException('Dosya bulunamadı.');
      }
    }
  }

  /**
   * Hedef görselin sadece metadata (contentType, size, etag) bilgilerini döner.
   */
  async getObjectStat(objectKey: string): Promise<{ contentType: string; size: number; etag: string }> {
    this.validateKey(objectKey);

    if (this.storageType === 'minio' && this.minioClient) {
      try {
        const stat = await this.minioClient.statObject(this.publicBucket, objectKey);
        const contentType = stat.metaData?.['content-type'] || this.lookupMimeType(objectKey);
        return {
          contentType,
          size: stat.size,
          etag: stat.etag,
        };
      } catch (err: any) {
        this.logger.error(`MinIO stat error for key ${objectKey}: ${err.message}`);
        throw new NotFoundException('Dosya bulunamadı.');
      }
    } else {
      // Local depolama
      const resolvedUploadDir = path.resolve(this.uploadDir);
      const targetPath = path.join(resolvedUploadDir, objectKey);

      if (!targetPath.startsWith(resolvedUploadDir + path.sep)) {
        throw new BadRequestException('Geçersiz dosya yolu.');
      }

      try {
        const stat = await fsPromises.stat(targetPath);
        const contentType = this.lookupMimeType(targetPath);
        const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;

        return {
          contentType,
          size: stat.size,
          etag,
        };
      } catch (err: any) {
        throw new NotFoundException('Dosya bulunamadı.');
      }
    }
  }

  /**
   * Hedef görselin sadece stream okuyucusunu döner.
   */
  async getObjectStream(objectKey: string): Promise<Readable> {
    this.validateKey(objectKey);

    if (this.storageType === 'minio' && this.minioClient) {
      try {
        return await this.minioClient.getObject(this.publicBucket, objectKey);
      } catch (err: any) {
        this.logger.error(`MinIO stream error for key ${objectKey}: ${err.message}`);
        throw new NotFoundException('Dosya bulunamadı.');
      }
    } else {
      // Local depolama
      const resolvedUploadDir = path.resolve(this.uploadDir);
      const targetPath = path.join(resolvedUploadDir, objectKey);

      if (!targetPath.startsWith(resolvedUploadDir + path.sep)) {
        throw new BadRequestException('Geçersiz dosya yolu.');
      }

      try {
        await fsPromises.access(targetPath, fs.constants.F_OK);
        return fs.createReadStream(targetPath);
      } catch (err: any) {
        throw new NotFoundException('Dosya bulunamadı.');
      }
    }
  }
}
