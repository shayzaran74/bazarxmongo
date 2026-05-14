import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { STORAGE_ADAPTER, IStorageAdapter } from '../../media/domain/storage.adapter.interface';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@ApiTags('Admin Logs')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/logs')
export class LogsAdminController {
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(
    @Inject(STORAGE_ADAPTER) private readonly storage: IStorageAdapter,
    private readonly config: ConfigService,
  ) {
    // Audit logları için doğrudan MinIO client'ı kullanıyoruz (listeleme yeteneği için)
    this.minioClient = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get<string>('MINIO_PORT', '9000'), 10),
      useSSL: this.config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.config.get<string>('MINIO_LOG_BUCKET', 'bazarx-logs');
  }

  @ApiOperation({ summary: 'Arşivlenmiş logları listele' })
  @Get('archived')
  async getArchivedLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
  ) {
    try {
      const objects: any[] = [];
      const prefix = category ? `archived/${category.toLowerCase()}/` : 'archived/';
      
      // MinIO'dan objeleri listele
      const stream = this.minioClient.listObjectsV2(this.bucketName, prefix, true);
      
      for await (const obj of stream) {
        if (obj.name?.endsWith('.gz') || obj.name?.endsWith('.log') || obj.name?.endsWith('.json')) {
          objects.push({
            id: obj.etag,
            fileName: obj.name.split('/').pop(),
            fileSize: obj.size,
            createdAt: obj.lastModified,
            category: this.detectCategory(obj.name),
            viewUrl: await this.storage.getPresignedUrl(obj.name, 3600),
          });
        }
      }

      // Manuel sayfalama (MinIO stream için basit çözüm)
      const total = objects.length;
      const start = (page - 1) * limit;
      const paginated = objects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                               .slice(start, start + limit);

      return {
        success: true,
        data: paginated,
        pagination: { total, page, limit }
      };
    } catch (error: any) {
      return { success: false, message: 'Arşivler listelenemedi', error: error.message || String(error) };
    }
  }

  @ApiOperation({ summary: 'Arşiv istatistiklerini getir' })
  @Get('stats')
  async getStats() {
    return {
      success: true,
      stats: {
        totalFiles: 0,
        lastArchiveDate: new Date().toISOString(),
      }
    };
  }

  private detectCategory(name: string): string {
    if (name.includes('financial')) return 'FINANCIAL';
    if (name.includes('system')) return 'SYSTEM_LOG';
    if (name.includes('legal')) return 'LEGAL';
    if (name.includes('trade')) return 'TRADE_PROOF';
    return 'SYSTEM_LOG';
  }
}
