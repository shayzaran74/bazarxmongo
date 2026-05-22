// apps/backend/src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, MongooseHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { MediaHealthIndicator } from '../media/presentation/media-health.indicator';
import { Public } from '@barterborsa/shared-security';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongooseHealth: MongooseHealthIndicator,
    private readonly mediaHealth: MediaHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'System health check', description: 'Checks database connectivity and media storage health.' })
  async check() {
    return this.health.check([
      () => this.mongooseHealth.pingCheck('database'),
      () => this.mediaHealth.isHealthy('media_storage'),
    ]);
  }
}
