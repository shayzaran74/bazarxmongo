import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageUploadResult {
  url: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = process.env.STORAGE_PATH || './uploads/invoices';

  async upload(
    buffer: Buffer,
    key: string,
    mimeType: string = 'application/pdf'
  ): Promise<StorageUploadResult> {
    // TODO: S3 entegrasyonu eklendiğinde bu metot override edilecek
    // Şu an local filesystem kullanıyor

    const fullPath = path.join(this.uploadDir, key);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, buffer);
    this.logger.log(`File saved: ${fullPath}`);

    const baseUrl = process.env.STORAGE_BASE_URL || 'http://localhost:3001';
    return {
      url: `${baseUrl}/invoices/${key}`,
      key,
    };
  }

  async getBuffer(key: string): Promise<Buffer | null> {
    const fullPath = path.join(this.uploadDir, key);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath);
  }
}
