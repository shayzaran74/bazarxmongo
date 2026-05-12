# ADR-004: Turborepo + pnpm Monorepo Yapısı

**Durum:** Kabul Edildi  
**Tarih:** 2024-04-01

---

## Bağlam

BazarX üç ana uygulama ve birçok shared package içeriyor:
- **apps/backend**: NestJS API
- **apps/frontend**: Nuxt 3 SPA
- **apps/financial-service**: gRPC microservice
- **apps/mobile**: React Native (Expo)
- **packages/***: 8 shared package

Bağımlılık yönetimi ve build orchestration kritik.

---

## Karar

**Turborepo** + **pnpm workspaces** kullanılmasına karar verildi.

### Neden Turborepo?

| Özellik | Değer |
|---------|-------|
| **Task scheduling** | Build pipeline'da dependency order otomatik |
| **Remote cache** | CI'da build artifact cache (lazarys) |
| **Filtering** | `pnpm --filter backend build` ile spesifik package build |
| **Task graphs** | `dependsOn` ile build order tanımlama |

### Neden pnpm?

| Özellik | pnpm | npm | yarn |
|---------|------|-----|------|
| **Disk usage** | Symlink (çok daha az) | Copy | Copy |
| **Installation speed** | En hızlı | Yavaş | Orta |
| **workspace:* protocol** | ✅ Destekli | ❌ Hata | ⚠️ Destekli değil |
| **monorepo desteği** | Native | Lerna gerekli | Workspace var |

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/shared/*'
```

### turbo.json Pipeline
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Bağımlılıklar build olmalı
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {}  // Build'e bağlı DEĞİL (düzeltildi)
  }
}
```

---

## Sonuçlar

### Olumlu
- Tek komutla tüm monorepo build: `pnpm build`
- Bağımlılıklar workspace içinde type-safe import
- CI'da Remote cache ile hızlı build

### Olumsuz
- **pnpm workspace:* npm install uyumsuzluğu**: `npm install` hata verir, `pnpm install` kullanılmalı
- **Turborepo config complexity**: Büyük monorepo'larda pipeline tanımları karmaşıklaşabilir

---

## İlişkili Kararlar

- [ADR-001](adr-001-postgresql-prisma.md): PostgreSQL + Prisma
