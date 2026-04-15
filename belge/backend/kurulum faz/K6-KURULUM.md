# K6 Load Testing — Kurulum ve Kullanım Kılavuzu

## K6 Kurulumu (macOS)

```bash
brew install k6
```

Veya Docker ile:
```bash
docker pull grafana/k6
```

## Dosya Yapısı

```
infra/k6/
├── helpers/
│   ├── config.js          # Base URL, threshold'lar
│   └── auth.js            # Kullanıcı oluşturma, login, header helper'ları
├── scenarios/
│   ├── smoke-test.js      # Duman testi (1 VU, 30s) — sistem çalışıyor mu?
│   ├── auth-load.js       # Auth yük testi (10→100 VU) — kayıt/giriş performansı
│   ├── checkout-load.js   # Checkout yük testi (5→100 VU) — sipariş akışı
│   ├── barter-load.js     # Barter yük testi (5→60 VU) — takas akışı
│   └── stress-test.js     # Stres testi (10→300 VU) — kırılma noktası
└── reports/               # Test raporları (JSON)
```

## Testleri Çalıştırma

### Önkoşul: Backend çalışıyor olmalı
```bash
cd apps/backend && pnpm start:dev
# Veya production mode:
cd apps/backend && pnpm start:prod
```

### 1. Duman Testi (İlk çalıştır — sistem sağlıklı mı?)
```bash
k6 run infra/k6/scenarios/smoke-test.js
```
- 1 kullanıcı, 30 saniye
- Health, ready, metrics endpoint'leri
- Beklenen: Tüm istekler 200ms altında

### 2. Auth Yük Testi
```bash
k6 run infra/k6/scenarios/auth-load.js
```
- 10 → 50 → 100 kullanıcı kademeli artış
- Register + login + profil görüntüleme
- Süre: ~5 dakika
- Beklenen: p95 < 500ms, hata < %1

### 3. Checkout Yük Testi (EN KRİTİK)
```bash
k6 run infra/k6/scenarios/checkout-load.js
```
- 5 → 20 → 50 → 100 kullanıcı
- Tam akış: sepete ekle → checkout → sipariş kontrol → %30 iptal
- Süre: ~5 dakika
- Beklenen: p95 < 2s, başarı > %95, stok çakışması < 20

### 4. Barter Yük Testi
```bash
k6 run infra/k6/scenarios/barter-load.js
```
- 5 → 20 → 40 → 60 kullanıcı
- İki kullanıcı eşleştirme → teklif → kabul
- Süre: ~5 dakika
- Beklenen: p95 < 1s, başarı > %90

### 5. Stres Testi (Kırılma Noktası)
```bash
k6 run infra/k6/scenarios/stress-test.js
```
- 10 → 50 → 100 → 150 → 200 → 250 → 300 kullanıcı
- Karışık trafik: %30 health, %30 auth, %25 browse, %15 checkout
- Süre: ~7 dakika
- Kırılma noktası: hata oranı %5'i geçtiğinde

## Özel URL ile Çalıştırma

```bash
# Farklı ortam
k6 run -e BASE_URL=https://api.barterborsa.com infra/k6/scenarios/smoke-test.js

# Daha fazla VU
k6 run --vus 200 --duration 5m infra/k6/scenarios/checkout-load.js
```

## Sonuç Okuma

```
     ✓ checkout başarılı
     ✗ sepete eklendi
      ↳  95% — ✓ 475 / ✗ 25

     checks.........................: 95.00% ✓ 475   ✗ 25
     checkout_duration..............: avg=856ms  min=120ms  p(95)=1850ms  p(99)=2100ms
     cart_add_duration..............: avg=45ms   min=12ms   p(95)=180ms
     http_req_duration..............: avg=340ms  min=8ms    p(95)=980ms   p(99)=1500ms
     http_req_failed................: 2.00%  ✓ 50    ✗ 2450
     http_reqs......................: 2500   52.08/s
     vus............................: 100    min=0   max=100
```

Dikkat edilecek metrikler:
- **p(95)**: İsteklerin %95'inin tamamlandığı süre — en önemli metrik
- **http_req_failed**: Hata oranı — %1 altında olmalı (checkout dışı)
- **http_reqs rate**: Saniyedeki istek sayısı (throughput)
- **checkout_duration p(95)**: Checkout işlem süresi — 2s altında olmalı
- **stock_conflicts**: Stok çakışması sayısı — yüksekse pessimistic locking gerekebilir

## Sorun Giderme

### "connection refused" hatası
Backend çalışmıyor. `pnpm start:dev` çalıştır.

### Çok fazla "stock conflict"
Aynı listing'e çok fazla concurrent checkout. Çözüm:
- Daha fazla test listing oluştur
- Stok miktarını artır

### p95 çok yüksek (>2s)
- PostgreSQL connection pool artır (`DATABASE_URL`'e `?connection_limit=20` ekle)
- Redis cache kullan (sık okunan veriler için)
- Prisma query'lerini optimize et (N+1 kontrolü)

### Hata oranı yüksek (>5%)
- `k6 run --http-debug` ile hata detaylarını gör
- Backend loglarını kontrol et: `docker logs barterborsa-backend`
- RAM/CPU kullanımını kontrol et: `docker stats`

## CI/CD Entegrasyonu

`ci.yml`'e opsiyonel k6 job eklenebilir:

```yaml
  load-test:
    name: Smoke Test
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: infra/k6/scenarios/smoke-test.js
        env:
          BASE_URL: http://localhost:3001
```
