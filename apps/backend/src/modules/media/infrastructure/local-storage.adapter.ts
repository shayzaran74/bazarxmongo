// apps/backend/src/modules/media/infrastructure/local-storage.adapter.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import {
  IStorageAdapter,
  StorageUploadResult,
} from '../domain/storage.adapter.interface';

// Güvenli subPath'ler: sadece harf, rakam, tire ve alt çizgi
const SAFE_SUBPATH_RE = /^[a-zA-Z0-9_-]+$/;
const ALLOWED_SUBPATHS = new Set(['products', 'avatars', 'documents', 'surplus', 'banners', 'categories']);

function sanitizeSubPath(subPath: string): string {
  const cleaned = subPath.trim().toLowerCase();
  if (!SAFE_SUBPATH_RE.test(cleaned) || !ALLOWED_SUBPATHS.has(cleaned)) {
    throw new BadRequestException(`Geçersiz subPath: "${subPath}". İzin verilenler: ${[...ALLOWED_SUBPATHS].join(', ')}`);
  }
  return cleaned;
}

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
    file: Express.Multer.File,
    subPath: string = 'products',
  ): Promise<StorageUploadResult> {
    const safeSubPath = sanitizeSubPath(subPath);
    const ext = path.extname(file.originalname).toLowerCase();
    const mediaId = `${randomUUID()}${ext}`;
    const resolvedUploadDir = path.resolve(this.uploadDir);
    const targetDir = path.join(resolvedUploadDir, safeSubPath);
    const targetPath = path.join(targetDir, mediaId);

    // Path traversal çift kontrolü: hedef klasör upload dizini içinde olmalı
    if (!targetDir.startsWith(resolvedUploadDir + path.sep) && targetDir !== resolvedUploadDir) {
      throw new BadRequestException('Geçersiz dosya yolu.');
    }

    await fs.mkdir(targetDir, { recursive: true });
    
    // DiskStorage kullanıldığında file.path dolu gelir, buffer yerine dosyayı taşıyalım
    if (file.path) {
      await fs.rename(file.path, targetPath);
    } else if (file.buffer) {
      await fs.writeFile(targetPath, file.buffer);
    }

    this.logger.log(`Dosya taşındı/kaydedildi: ${targetPath}`);

    return {
      mediaId: `${safeSubPath}/${mediaId}`,
      publicUrl: `${this.baseUrl}/uploads/${safeSubPath}/${mediaId}`,
      blurhash: null,
    };
  }

  async getUrl(mediaId: string, _size?: string): Promise<string> {
    if (!mediaId) return '';
    if (mediaId.startsWith('http')) return mediaId;
    
    return `${this.baseUrl}/uploads/${mediaId}`;
  }

  async delete(mediaId: string): Promise<void> {
    const resolvedUploadDir = path.resolve(this.uploadDir);
    const targetPath = path.resolve(resolvedUploadDir, mediaId);
    // Silme işlemi yalnızca upload dizini içinde
    if (!targetPath.startsWith(resolvedUploadDir + path.sep)) {
      this.logger.warn(`Geçersiz silme denemesi: ${mediaId}`);
      return;
    }
    try {
      await fs.unlink(targetPath);
      this.logger.log(`Dosya silindi: ${targetPath}`);
    } catch {
      this.logger.warn(`Silinecek dosya bulunamadı: ${targetPath}`);
    }
  }

  async getPresignedUrl(objectKey: string, _expiry?: number, _bucket?: string): Promise<string> {
    return `${this.baseUrl}/uploads/${objectKey}`;
  }
}
