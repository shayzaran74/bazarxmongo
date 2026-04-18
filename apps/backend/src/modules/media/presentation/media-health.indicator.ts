// apps/backend/src/modules/media/presentation/media-health.indicator.ts
import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { STORAGE_ADAPTER, IStorageAdapter } from '../domain/storage.adapter.interface';
import { MinioStorageAdapter } from '../infrastructure/minio-storage.adapter';

@Injectable()
export class MediaHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(STORAGE_ADAPTER)
    private readonly storage: IStorageAdapter,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!(this.storage instanceof MinioStorageAdapter)) {
      return this.getStatus(key, true, { message: 'Local storage is being used' });
    }

    const isConnected = await this.storage.checkConnection();
    if (isConnected) {
      return this.getStatus(key, true);
    }

    throw new HealthCheckError('MinIO connection failed', this.getStatus(key, false));
  }
}
