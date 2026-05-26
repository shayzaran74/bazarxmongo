// apps/backend/src/modules/media/infrastructure/minio-config.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioConfigService {
  private readonly logger = new Logger(MinioConfigService.name);
  private readonly minioClient: Minio.Client;
  private readonly publicBucket: string;
  private readonly privateBucket: string;

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
  }

  /**
   * Her iki bucket'ın varlığını kontrol eder ve yoksa oluşturur.
   * Kamu erişimli bucket için 'public-read' politikasını ayarlar.
   */
  async ensureBuckets(): Promise<void> {
    await this.ensureBucket(this.publicBucket, true);
    await this.ensureBucket(this.privateBucket, false);
  }

  private async ensureBucket(bucketName: string, isPublic: boolean): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
        this.logger.log(`Bucket oluşturuldu: ${bucketName}`);
      } else {
        this.logger.log(`Bucket zaten mevcut: ${bucketName}`);
      }

      if (isPublic) {
        // Kamu erişimli bucket politikası: Herkes nesneleri okuyabilir (public-read)
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        this.logger.log(`Kamu erişim (public-read) politikası uygulandı: ${bucketName}`);
      } else {
        // Özel (private) bucket politikası: Dışarıdan doğrudan erişim engellenir, sadece imzalı (presigned) URL'ler ile erişilebilir.
        // MinIO'da varsayılan politika private'tır. Varsa eski politikaları temizleyelim.
        try {
          await this.minioClient.setBucketPolicy(bucketName, '');
          this.logger.log(`Özel erişim (private) politikası uygulandı: ${bucketName}`);
        } catch {
          // Bazı sürümlerde boş politika set etmek hata verebilir, eğer politika yoksa yoksayabiliriz.
        }
      }
    } catch (error) {
      this.logger.error(`Bucket yapılandırma hatası (${bucketName}): ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
