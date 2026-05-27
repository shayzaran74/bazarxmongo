// apps/backend/src/infrastructure/metrics/metrics.controller.ts

import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { MetricsService } from './metrics.service';

@ApiExcludeController()
@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const [metrics, contentType] = await Promise.all([
      this.metricsService.getMetrics(),
      Promise.resolve(this.metricsService.getContentType()),
    ]);
    res.set('Content-Type', contentType);
    res.end(metrics);
  }
}
