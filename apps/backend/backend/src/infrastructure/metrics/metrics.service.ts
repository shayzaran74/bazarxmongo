// apps/backend/src/infrastructure/metrics/metrics.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  readonly httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Toplam HTTP istek sayısı',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [this.registry],
  });

  readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP istek süresi (saniye)',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [this.registry],
  });

  readonly activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Anlık aktif bağlantı sayısı',
    registers: [this.registry],
  });

  readonly dbQueryDuration = new Histogram({
    name: 'db_query_duration_seconds',
    help: 'Veritabanı sorgu süresi (saniye)',
    labelNames: ['operation', 'collection'] as const,
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    registers: [this.registry],
  });

  onModuleInit(): void {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'bazarx_',
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
