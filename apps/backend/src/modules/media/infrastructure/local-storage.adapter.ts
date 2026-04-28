// apps/backend/src/modules/media/infrastructure/local-storage.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import {
  IStorageAdapter,
  StorageUploadResult,
} from '../domain/storage.adapter.interface';

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR', './public/uploads');
    this.baseUrl = this.config.get<string>(
      'APP_BASE_URL',
      'http://localhost:3001',
    );
  }

  async upload(
    file: any, // Express.Multer.File
    subPath: string = 'products',
  ): Promise<StorageUploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const mediaId = `${randomUUID()}${ext}`;
    const targetDir = path.resolve(this.uploadDir, subPath);
    const targetPath = path.join(targetDir, mediaId);

    await fs.mkdir(targetDir, { recursive: true });
    
    // DiskStorage kullanıldığında file.path dolu gelir, buffer yerine dosyayı taşıyalım
    if (file.path) {
      await fs.rename(file.path, targetPath);
    } else if (file.buffer) {
      await fs.writeFile(targetPath, file.buffer);
    }

    this.logger.log(`Dosya taşındı/kaydedildi: ${targetPath}`);

    return {
      mediaId: `${subPath}/${mediaId}`,
      publicUrl: `${this.baseUrl}/uploads/${subPath}/${mediaId}`,
      blurhash: null,
    };
  }

  async getUrl(mediaId: string, _size?: string): Promise<string> {
    if (!mediaId) return '';
    if (mediaId.startsWith('http')) return mediaId;
    
    return `${this.baseUrl}/uploads/${mediaId}`;
  }

  async delete(mediaId: string): Promise<void> {
    const targetPath = path.join(this.uploadDir, mediaId);
    try {
      await fs.unlink(targetPath);
      this.logger.log(`Dosya silindi: ${targetPath}`);
    } catch {
      this.logger.warn(`Silinecek dosya bulunamadı: ${targetPath}`);
    }
  }
}
