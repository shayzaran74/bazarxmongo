# CI/CD Pipeline — Kurulum Kılavuzu

## Dosya Yerleşimi

```
barterbackend/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    ← YENİ (her push/PR'da çalışır)
│   │   └── deploy.yml                ← YENİ (main'e merge'de çalışır)
│   └── pull_request_template.md      ← YENİ (PR template)
└── infra/
    └── dockerfiles/
        └── backend.Dockerfile        ← GÜNCELLE (multi-stage)
```

## Kurulum Adımları

### Adım 1: Dosyaları kopyala

```bash
# Workflow klasörü oluştur
mkdir -p .github/workflows

# Dosyaları kopyala
cp ci.yml .github/workflows/
cp deploy.yml .github/workflows/
cp pull_request_template.md .github/
cp backend.Dockerfile infra/dockerfiles/backend.Dockerfile
```

### Adım 2: GitHub'a push et

```bash
git add .github/ infra/dockerfiles/backend.Dockerfile
git commit -m "ci: CI/CD pipeline eklendi (build, test, deploy)"
git push origin main
```

### Adım 3: GitHub Branch Protection ayarla

GitHub repo → Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Seç: "Build & Type Check", "Unit Tests", "E2E Tests", "Quality Checks"
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

Bu ayarlarla:
- Kimse doğrudan main'e push yapamaz
- Her PR'da CI pipeline çalışır
- Testler geçmeden merge edilemez

### Adım 4: Geliştirme akışı

```bash
# 1. Yeni branch oluştur
git checkout -b feature/yeni-ozellik

# 2. Değişiklikleri yap
# ...

# 3. Commit ve push
git add .
git commit -m "feat: yeni özellik eklendi"
git push origin feature/yeni-ozellik

# 4. GitHub'da PR aç
# CI otomatik çalışır → build → unit test → e2e test → quality check

# 5. Tüm check'ler yeşil → Review → Merge to main

# 6. Main'e merge → Deploy workflow çalışır → Docker image build + push
```

## Pipeline Akışı

```
Push/PR
  │
  ├── ci.yml
  │   ├── Job 1: Build & Type Check (2-3 dk)
  │   │   ├── pnpm install
  │   │   ├── prisma generate
  │   │   ├── pnpm build (tüm paketler)
  │   │   └── tsc --noEmit
  │   │
  │   ├── Job 2: Unit Tests (3-5 dk) ← build'e bağımlı
  │   │   ├── jest --ci --coverage
  │   │   └── coverage threshold kontrolü
  │   │
  │   ├── Job 3: E2E Tests (5-8 dk) ← build'e bağımlı
  │   │   ├── PostgreSQL, Redis, RabbitMQ container'ları
  │   │   ├── prisma db push (test DB)
  │   │   └── jest --config test/jest-e2e.json
  │   │
  │   └── Job 4: Quality Checks (1-2 dk) ← build'e bağımlı
  │       ├── any kullanım kontrolü
  │       ├── ts-ignore kontrolü
  │       └── dependency audit
  │
  └── deploy.yml (sadece main branch)
      ├── Backend Docker image → ghcr.io
      ├── Financial Service Docker image → ghcr.io
      └── Delivery Service Docker image → ghcr.io
```

## CI Süresi Tahmini

| Job | Süre | Paralel? |
|-----|------|----------|
| Build & Type Check | 2-3 dk | — |
| Unit Tests | 3-5 dk | ✅ (build sonrası paralel) |
| E2E Tests | 5-8 dk | ✅ (build sonrası paralel) |
| Quality Checks | 1-2 dk | ✅ (build sonrası paralel) |
| **Toplam** | **~8-10 dk** | (paralel çalışır) |

## Docker Image'lar

Deploy workflow GitHub Container Registry (ghcr.io) kullanır:
- `ghcr.io/shayzaran74/barterborsav1/backend:latest`
- `ghcr.io/shayzaran74/barterborsav1/financial-service:latest`
- `ghcr.io/shayzaran74/barterborsav1/delivery-service:latest`

Her image SHA hash ile de tag'lenir (rollback için).

## Notlar

- pnpm-lock.yaml dosyasının güncel olması ŞART (`--frozen-lockfile` kullanılıyor)
- E2E testlerde PostgreSQL, Redis, RabbitMQ GitHub Actions service container olarak çalışır
- Deploy workflow'da `GITHUB_TOKEN` otomatik sağlanır (ek secret gerekmez)
- Docker image'lar non-root user ile çalışır (güvenlik)
- Healthcheck tanımlı (orchestrator'lar için — K8s, Docker Swarm)
