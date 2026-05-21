import { Controller, Get, Query, UseGuards, Inject, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { STORAGE_ADAPTER, IStorageAdapter } from '../../media/domain/storage.adapter.interface';
import { ConfigService } from '@nestjs/config';
import { AuditLog } from '@barterborsa/shared-persistence/schemas/backend/auditLog.schema';
import * as Minio from 'minio';

@ApiTags('Admin Logs')
@ApiBearerAuth()
@Controller('admin/logs')
export class LogsAdminController {
  private readonly logger = new Logger(LogsAdminController.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(
    @Inject(STORAGE_ADAPTER) private readonly storage: IStorageAdapter,
    private readonly config: ConfigService,
  ) {
    const endPoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = parseInt(this.config.get<string>('MINIO_PORT', '9000'), 10);
    const useSSL = this.config.get<string>('MINIO_USE_SSL') === 'true';
    this.bucketName = this.config.get<string>('MINIO_LOG_BUCKET', 'bazarx-invoices');

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY'),
    });
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Arşivlenmiş logları/faturaları listele' })
  @Get('archived')
  async getArchivedLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('category') category?: string,
  ) {
    try {
      const objects: any[] = [];
      const bucketsToScan = [this.bucketName, 'bazarx-media'];
      
      for (const bucket of bucketsToScan) {
        try {
          const exists = await this.minioClient.bucketExists(bucket);
          if (!exists) continue;

          const stream = this.minioClient.listObjectsV2(bucket, '', true);
          for await (const obj of stream) {
            if (obj.name) {
              objects.push({
                id: obj.etag,
                fileName: obj.name.split('/').pop(),
                fileSize: obj.size,
                createdAt: obj.lastModified,
                category: this.detectCategory(obj.name),
                viewUrl: await this.storage.getPresignedUrl(obj.name, 3600, bucket),
              });
            }
          }
        } catch (e: unknown) {
          this.logger.warn(`Bucket tarama hatası (${bucket})`, { error: e instanceof Error ? e.message : String(e) });
        }
      }

      // Kategoriye göre filtrele (eğer kategori seçilmişse)
      const filteredObjects = category 
        ? objects.filter(obj => obj.category.toLowerCase() === category.toLowerCase())
        : objects;

      const total = filteredObjects.length;
      const start = (page - 1) * limit;
      const paginated = filteredObjects
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(start, start + limit);

      return {
        success: true,
        data: paginated,
        pagination: { total, page, limit }
      };
    } catch (error: unknown) {
      return { success: false, message: 'Arşivler listelenemedi', error: (error instanceof Error ? error.message : String(error)) };
    }
  }

  @ApiOperation({ summary: 'Audit loglarını listele' })
  @Get('audit')
  async getAuditLogs(@Query('limit') limit: number = 20): Promise<{ success: boolean; data: unknown[] }> {
    const data = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    return { success: true, data };
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Arşiv istatistiklerini getir' })
  @Get('stats')
  async getStats() {
    try {
      const buckets = [this.bucketName, 'bazarx-media'];
      let total = 0;
      let lastArchived: Date | null = null;

      for (const bucket of buckets) {
        try {
          const exists = await this.minioClient.bucketExists(bucket);
          if (!exists) continue;
          const stream = this.minioClient.listObjectsV2(bucket, '', true);
          for await (const obj of stream) {
            total++;
            if (!lastArchived || obj.lastModified > lastArchived) {
              lastArchived = obj.lastModified;
            }
          }
        } catch (e: unknown) {
          this.logger.warn(`İstatistik bucket tarama hatası (${bucket})`, { error: e instanceof Error ? e.message : String(e) });
        }
      }

      return {
        success: true,
        stats: {
          totalFiles: total,
          lastArchiveDate: lastArchived ? lastArchived.toISOString() : '-',
          serviceStatus: 'active'
        }
      };
    } catch (error) {
      return { success: false, data: { totalCount: 0, lastArchivedAt: null, serviceStatus: 'error' } };
    }
  }

  private detectCategory(fileName: string): string {
    const name = fileName.toLowerCase();
    if (name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) return 'IMAGE';
    if (name.includes('inv-') || name.endsWith('.pdf')) return 'INVOICE';
    if (name.includes('financial') || name.includes('trade')) return 'FINANCIAL';
    if (name.includes('error') || name.includes('exception')) return 'ERROR';
    if (name.includes('auth') || name.includes('login')) return 'SECURITY';
    return 'SYSTEM';
  }
}
