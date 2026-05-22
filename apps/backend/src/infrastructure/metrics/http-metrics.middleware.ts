// apps/backend/src/infrastructure/metrics/http-metrics.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      // Route pattern'i al (örn: /api/v1/products/:id yerine /api/v1/products/)
      const route = req.route?.path ?? req.path ?? 'unknown';
      const method = req.method;
      const statusCode = String(res.statusCode);

      this.metrics.httpRequestTotal.inc({ method, route, status_code: statusCode });
      this.metrics.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    });

    next();
  }
}
