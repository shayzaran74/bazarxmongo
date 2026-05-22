---
title: "BazarX Production Yönetim Rehberi"
type: summary
tags: [production, deployment, docker, mongodb, devops, nginx, sentry, prometheus, eşzamanlılık]
created: 2026-05-21
updated: 2026-05-22
source: raw/datasets/belge/sistem/BAZARX_PROD_REHBER.md
---

# BazarX Production Yönetim Rehberi

## Özet

BazarX platformunun production ortamındaki yönetimi, deployment ve bakımı için gerekli komutları ve bilgileri içeren doküman. Docker tabanlı orkestrasyon, MongoDB yönetimi, Nginx ve Ngrok konfigürasyonu ele alınır.

> **Veritabanı:** MongoDB + Mongoose. PostgreSQL/Prisma kullanılmamaktadır.
> **Transactions için** MongoDB replica set zorunludur.

---

## Temel Komutlar

### Sistem Yönetimi

```bash
# Başlatma
sudo docker compose -f docker-compose.prod.yml up -d

# Durdurma
sudo docker compose -f docker-compose.prod.yml down

# Yeniden başlatma
sudo docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### Log İzleme

```bash
# Backend logları
sudo docker logs -f bazarx_backend

# Nginx logları
sudo docker logs bazarx_nginx

# Ngrok (dış erişim)
sudo docker logs bazarx_ngrok
```

---

## MongoDB Yönetimi

### Bağlantı
```bash
sudo docker exec -it bazarx_mongo mongosh -u admin -p <MONGODB_PASSWORD> --authenticationDatabase admin
```

### Replica Set (ilk kurulumda bir kez)
```bash
sudo docker exec -it bazarx_mongo mongosh --eval "rs.initiate()"
sudo docker exec -it bazarx_mongo mongosh --eval "rs.status()"
```

### Yedekleme
```bash
# Dump
sudo docker exec bazarx_mongo mongodump \
  --uri="mongodb://admin:<MONGODB_PASSWORD>@localhost:27017/bazarx?authSource=admin" \
  --out=/backup/$(date +%Y%m%d)

# Restore
sudo docker exec bazarx_mongo mongorestore \
  --uri="mongodb://admin:<MONGODB_PASSWORD>@localhost:27017/bazarx?authSource=admin" \
  /backup/<tarih>/bazarx
```

### Sağlık Kontrolleri
```bash
# Backend API
curl http://localhost:3001/health

# MongoDB ping
sudo docker exec bazarx_mongo mongosh --eval "db.adminCommand({ ping: 1 })"

# Replica set durumu
sudo docker exec bazarx_mongo mongosh --eval "rs.status()"

# Redis
sudo docker exec bazarx_redis redis-cli -a <REDIS_PASSWORD> ping
```

---

## Deployment Adımları

```bash
# 1. Dosyaları gönder
rsync -avz ./apps/backend bazarx_server:~/bazarx/apps/

# 2. Backend rebuild
sudo docker compose -f docker-compose.prod.yml up -d --build backend

# 3. Index sync (schema değişikliği varsa)
sudo docker exec -it bazarx_backend sh -c "node dist/scripts/sync-indexes.js"
```

---

## Kritik ENV Değişkenleri

| Değişken | Açıklama |
|---|---|
| `MONGODB_URI` | `mongodb://admin:<PASS>@mongo:27017/bazarx?authSource=admin&replicaSet=rs0` |
| `REDIS_URL` | `redis://:<REDIS_PASSWORD>@redis:6379` |
| `JWT_SECRET` | `openssl rand -base64 64` ile üretilir |
| `FINANCIAL_GRPC_URL` | `financial-service:50051` |
| `IYZICO_API_KEY` | Canlı ödeme için |
| `GOOGLE_CLIENT_ID` | OAuth için |
| `CORS_ORIGIN` | `https://bazarx.info,https://www.bazarx.info` — boş bırakılırsa CORS tamamen kapalı |
| `WS_CORS_ORIGIN` | WebSocket CORS origin — boş bırakılırsa WS bağlantısı reddedilir |
| `SENTRY_DSN` | `https://xxx@xxx.ingest.sentry.io/xxx` — boşsa Sentry pasif |
| `APP_VERSION` | Sentry release tag için (örn: `1.0.0`) |

---

## Sistem Portları

| Servis | Port | Not |
|---|---|---|
| Backend | 3001 | Ana API |
| Frontend | 3002 | Nuxt 3 |
| MongoDB | 27017 | Replica set zorunlu |
| Redis | 6379 | |
| Nginx | 80 | HTTP |
| Ngrok | 4040 | Tunnel |

---

## İlgili Kavramlar

[[canliya-alma]], [[teknik-mimari]]

## Son Eklenenler (2026-05-22)

- `docker-compose.prod.yml` oluşturuldu (önceden yoktu) — 10 servis, DB portları dışarıya kapalı
- CORS wildcard güvenlik açığı giderildi (`origin: true → false`)
- WebSocket CORS wildcard giderildi
- Nginx HSTS + Referrer-Policy + Permissions-Policy eklendi
- Nginx `/socket.io/` → `backend:3001` yönlendirme düzeltildi
- Prometheus `/metrics` endpoint eklendi (`prom-client`)
- Sentry hata takibi entegre edildi (`@sentry/nestjs`)
- Auction OCC (Optimistic Concurrency Control) uygulandı
- Lottery atomic transaction uygulandı (kota aşımı önlendi)
- CI `--passWithNoTests` kaldırıldı

## Bu Kaynaktan Çıkarılan Kavramlar

- Docker compose tabanlı production deployment
- MongoDB replica set zorunluluğu (transactions için)
- Ngrok ile güvenli dış erişim
- Rsync ile incremental code deployment
- Eşzamanlılık güvenliği: OCC + atomic transaction pattern'leri