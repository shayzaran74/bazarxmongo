# FAZ 9: Observability & Hardening — Kurulum Kılavuzu

## Dosya Yerleşimi

Aşağıdaki dosyaları belirtilen path'lere kopyala:

### 1. Shared Observability — YENİ DOSYALAR

```
packages/shared/shared-observability/src/tracing/tracing.module.ts     ← YENİ
packages/shared/shared-observability/src/metrics/metrics.module.ts     ← YENİ
packages/shared/shared-observability/src/metrics/prometheus.service.ts ← YENİ
packages/shared/shared-observability/src/metrics/metrics.interceptor.ts ← YENİ
packages/shared/shared-observability/src/metrics/metrics.controller.ts ← YENİ
packages/shared/shared-observability/src/index.ts                      ← GÜNCELLE (üzerine yaz)
```

### 2. Shared Observability — GÜNCELLENEN DOSYALAR

```
packages/shared/shared-observability/src/health/health.controller.ts   ← GÜNCELLE (üzerine yaz)
packages/shared/shared-observability/src/health/health.module.ts       ← GÜNCELLE (üzerine yaz)
```

### 3. Backend — GÜNCELLENEN DOSYALAR

```
apps/backend/src/main.ts          ← GÜNCELLE (üzerine yaz)
apps/backend/nest-cli.json        ← GÜNCELLE (üzerine yaz)
```

### 4. Backend — YENİ DOSYALAR

```
apps/backend/test/app.e2e-spec.ts  ← YENİ
apps/backend/test/jest-e2e.json    ← YENİ
```

## Bağımlılık Kurulumu

Önce shared-observability'ye yeni dependency'ler ekle:

```bash
cd packages/shared/shared-observability
pnpm add prom-client@^15.0.0 \
  @opentelemetry/sdk-node@^0.52.0 \
  @opentelemetry/exporter-trace-otlp-grpc@^0.52.0 \
  @opentelemetry/resources@^1.25.0 \
  @opentelemetry/semantic-conventions@^1.25.0 \
  @opentelemetry/instrumentation-http@^0.52.0 \
  @opentelemetry/instrumentation-fastify@^0.38.0 \
  @opentelemetry/sdk-trace-base@^1.25.0 \
  @prisma/instrumentation@^5.10.0 \
  --save
cd ../../..
```

Backend'e yeni dependency'ler ekle:

```bash
cd apps/backend
pnpm add @fastify/helmet@^11.0.0 --save
pnpm add -D @nestjs/testing@^10.0.0 ts-jest@^29.0.0 jest@^29.0.0 @types/jest@^29.0.0
cd ../..
```

## Backend package.json Script Güncellemesi

`apps/backend/package.json` dosyasının scripts bölümüne şunları ekle:

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config test/jest-e2e.json --forceExit"
  }
}
```

## app.module.ts Güncelleme

`apps/backend/src/app.module.ts` dosyasına `MetricsModule` import'u ekle:

```typescript
import { MetricsModule, MetricsController } from '@barterborsa/shared-observability';

@Module({
  imports: [
    // ... mevcut import'lar
    MetricsModule,  // ← EKLE
  ],
  controllers: [
    // ... mevcut controller'lar
    MetricsController,  // ← EKLE (veya MetricsModule'ün kendi controller'ı)
  ],
})
```

NOT: MetricsModule @Global() olduğu için bir kez import etmek yeterli.
MetricsController ayrıca eklenmeli çünkü /metrics endpoint'ini sunar.

## Build ve Test

```bash
# 1. Bağımlılıkları kur
pnpm install

# 2. Build
pnpm build

# 3. Backend'i başlat (health + metrics test)
cd apps/backend && pnpm start:dev

# 4. Ayrı terminalde kontrol:
curl http://localhost:3001/health
curl http://localhost:3001/ready
curl http://localhost:3001/metrics

# 5. E2E test (opsiyonel — DB bağlantısı gerekir)
cd apps/backend && pnpm test:e2e
```

## .env.example Güncelleme

Şunları ekle:

```bash
# CORS
CORS_ORIGIN=http://localhost:3000

# OpenTelemetry (opsiyonel — Jaeger/Tempo yoksa yorum satırı yap)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## Docker Compose — Opsiyonel Observability Stack

İstersen `infra/docker-compose.observability.yml` ekle:

```yaml
version: "3.9"
services:
  # Jaeger — distributed tracing UI
  jaeger:
    image: jaegertracing/all-in-one:1.57
    ports:
      - "16686:16686"  # Jaeger UI
      - "4317:4317"    # OTLP gRPC
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  # Prometheus — metrics toplama
  prometheus:
    image: prom/prometheus:v2.53.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  # Grafana — dashboard
  grafana:
    image: grafana/grafana:11.0.0
    ports:
      - "3333:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

Ve `infra/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'barterborsa-backend'
    static_configs:
      - targets: ['host.docker.internal:3001']
    metrics_path: '/metrics'

  - job_name: 'barterborsa-financial'
    static_configs:
      - targets: ['host.docker.internal:3004']
    metrics_path: '/metrics'

  - job_name: 'barterborsa-delivery'
    static_configs:
      - targets: ['host.docker.internal:3005']
    metrics_path: '/metrics'
```

## Faz 9 ile Eklenen Özellikler Özeti

| Özellik | Endpoint/Dosya | Açıklama |
|---------|---------------|----------|
| Health Check | GET /health | Liveness — "uygulama canlı mı" |
| Readiness Check | GET /ready | DB, Redis, RabbitMQ bağlantı durumu |
| Prometheus Metrics | GET /metrics | HTTP metrikleri + iş metrikleri + Node.js metrikleri |
| OpenTelemetry Tracing | — | Dağıtık izleme (Jaeger/Tempo'ya gönderir) |
| CORS | — | Configurable origin, credentials, headers |
| Helmet | — | Güvenlik header'ları (XSS, clickjacking koruma) |
| Graceful Shutdown | — | SIGTERM/SIGINT yakalama, temiz kapatma |
| E2E Bootstrap Test | test/app.e2e-spec.ts | Uygulama ayağa kalkıyor mu testi |
| Proto Assets | nest-cli.json | gRPC proto dosyaları dist'e kopyalanır |
| Swagger (dev only) | /api/docs | Production'da kapalı |
