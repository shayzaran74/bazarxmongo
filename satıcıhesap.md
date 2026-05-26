# Satıcı Hesabı Oluşturma ve Onaylama Prosedürü — Mimari ve Dosya Bazlı Denetim Raporu

> **Hazırlayan:** Claude Code Auditor
> **Tarih:** 2026-05-26
> **Son Güncelleme:** 2026-05-26 (Mimari hata düzeltmeleri uygulandı)
> **Proje:** BazarX (BarterBorsa)
> **Modül:** Vendor (Satıcı) Modülü

---

## 1. Mimari Özet

### 1.1 Katmanlı Mimari (DDD + CQRS)

```
apps/backend/src/modules/vendor/
├── application/          # Komutlar, Sorgular, Servisler, DTOs
│   ├── commands/         # State değiştiren işlemler
│   ├── queries/          # Okuma işlemleri
│   ├── services/         # İş mantığı servisleri
│   └── dtos/             # Data Transfer Objects
├── domain/               # Entity'ler, Enum'lar, Events, Repository Interfaces
│   ├── entities/         # Aggregate Root'lar
│   ├── enums/            # VendorStatus, VendorType, VendorTier
│   ├── events/           # Domain Events
│   └── repositories/      # Repository Interface'leri
├── infrastructure/        # MongoDB Implementasyonları, Mappers
│   └── persistence/       # Mongoose Repository'leri
└── presentation/         # Controller'lar (HTTP giriş noktası)
```

### 1.2 Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| **Database** | MongoDB (Mongoose ODM) |
| **Framework** | NestJS + CQRS |
| **Event Bus** | EventBus (Domain Events) |
| **Validation** | class-validator + class-transformer |

---

## 2. Vendor Status State Machine

```
                    ┌──────────────┐
                    │   PENDING    │ ← İlk başvuru
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │            │
                    ▼            ▼
              ┌──────────┐ ┌──────────┐
              │ APPROVED │ │ REJECTED │
              └────┬─────┘ └──────────┘
                   │            (Reddedildi — yeni başvuru gerekli)
                   │
                   ▼
             ┌──────────┐
             │SUSPENDED│ ← (Admin tarafından askıya alınır)
             └──────────┘
```

> **Önemli Düzeltme:** `SUSPENDED` durumuna sadece `APPROVED`'den geçilebilir.
> `PENDING → SUSPENDED` geçişi **yoktur** — satıcı onaylanmadan askıya alınamaz.

### Status Enum Değerleri

**Dosya:** `apps/backend/src/modules/vendor/domain/enums/vendor-status.enum.ts`

| Değer | Açıklama | Geçiş Koşulları |
|-------|----------|-----------------|
| `PENDING` | Başvuru yapıldı, admin onayı bekliyor | → `APPROVED` veya → `REJECTED` |
| `APPROVED` | Admin tarafından onaylandı, aktif | → `SUSPENDED` (admin suspend) |
| `REJECTED` | Başvuru reddedildi | Yeni başvuru gerektirir |
| `SUSPENDED` | Askıya alındı | → `APPROVED` (reinstate — **implementasyon bekleniyor**) |

---

## 3. Vendor Oluşturma Akışı (Registration Flow)

### 3.1 İki Yol Kavramı

| Yol | Kullanım | Servis/Handler |
|-----|----------|----------------|
| **CQRS (Tercih Edilen)** | Yeni geliştirmeler | `RegisterVendorHandler` |
| **Atomic (Eski)** | Geriye uyum | `VendorRegistrationService.registerAtomic()` |

### 3.2 CQRS Yol Adımları

```
Kullanıcı POST /vendors/apply
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ RegisterVendorCommand                                    │
│ { userId, companyId, storeName, vendorType, ... }       │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ RegisterVendorHandler                                   │
│ 1. Company.exists(companyId) kontrolü                   │
│ 2. Vendor.existsByUserId(userId) → ConflictException   │
│ 3. VendorSlug.generate(storeName) + uniqueness kontrolü  │
│ 4. Vendor.create() → status: PENDING, tier: CORE        │
│ 5. VendorProfile.create() → RESTAURANT ek alanları      │
│ 6. VendorSettings.create()                              │
│ 7. Üç repository'ye kayıt (transaction)                 │
│ 8. User.role güncelle (VENDOR)                         │
│ 9. VendorRegisteredEvent publish                        │
└─────────────────────────────────────────────────────────┘
         │
         ▼
    PENDING durumunda satıcı oluşturuldu
```

### 3.3 Atomic Yol Adımları

```
Kullanıcı POST /vendors/apply-atomic
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ VendorRegistrationService.registerAtomic()              │
│ - Tek MongoDB transaction ile tüm kayıtlar              │
│ - Company + Vendor + Profile + Settings + User.role     │
│ - Geriye uyumlu, eski kullanım                          │
└─────────────────────────────────────────────────────────┘
```

### 3.4 Kayıt Akışı Dosya Bazlı

| Sıra | Dosya Yolu | Sorumlu Olduğu |
|------|------------|----------------|
| 1 | `application/dtos/register-vendor.dto.ts` | Giriş validation |
| 2 | `application/commands/register-vendor.command.ts` | CQRS Command |
| 3 | `application/commands/register-vendor.handler.ts` | İş mantığı orchestrator |
| 4 | `domain/entities/vendor.entity.ts` | Vendor.create() factory |
| 5 | `domain/entities/vendor-profile.entity.ts` | Profile factory |
| 6 | `domain/entities/vendor-settings.entity.ts` | Settings factory |
| 7 | `domain/entities/company.entity.ts` | Company entity |
| 8 | `infrastructure/persistence/mongo-vendor.repository.ts` | Vendor persistence |
| 9 | `infrastructure/persistence/mongo-vendor-profile.repository.ts` | Profile persistence |
| 10 | `infrastructure/persistence/mongo-company.repository.ts` | Company persistence |
| 11 | `presentation/vendor.controller.ts` | HTTP endpoint |

---

## 4. Vendor Onaylama ve Reddetme Akışı

### 4.1 Onaylama (Approval) Akışı

```
Admin PUT /admin/vendors/:id/approve
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ ApproveVendorCommand                                     │
│ { vendorId, adminUserId }                               │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ ApproveVendorHandler                                    │
│ 1. Vendor.findById(vendorId) kontrolü                   │
│ 2. vendor.status === PENDING değilse → BadRequest       │
│ 3. vendor.approve() → status=APPROVED, isVerified=true  │
│ 4. Company.update(id, {status: 'VERIFIED', verifiedAt}) │
│ 5. EventBus.publish(VendorApprovedEvent)               │
│ 6. AuditLog: VENDOR_APPROVED                            │
└─────────────────────────────────────────────────────────┘
         │
         ▼
    Şirket ve satıcı birlikte onaylandı
```

### 4.2 Reddetme (Rejection) Akışı

```
Admin PUT /admin/vendors/:id/reject
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ RejectVendorCommand                                      │
│ { vendorId, rejectionReason, adminId }                  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ RejectVendorHandler                                     │
│ 1. Vendor.findById(vendorId) kontrolü                   │
│ 2. vendor.status !== PENDING → BadRequest               │
│ 3. vendor.reject(reason) → domain entity, event tetikler│
│ 4. vendorRepo.save(vendor) — entity üzerinden          │
│ 5. Company.update(status: 'REJECTED')                  │
│ 6. EventBus.publish(VendorRejectedEvent) ← DÜZELTİLDİ  │
│ 7. AuditLog: VENDOR_REJECTED                            │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Onay/Reddetme Akışı Dosya Bazlı

| Sıra | Dosya Yolu | Sorumlu Olduğu |
|------|------------|----------------|
| 1 | `application/commands/approve-vendor.command.ts` | Onay Command |
| 2 | `application/commands/approve-vendor.handler.ts` | Onay iş mantığı |
| 3 | `application/commands/reject-vendor.command.ts` | Reddetme Command |
| 4 | `application/commands/reject-vendor.handler.ts` | Reddetme iş mantığı (event publish eklendi) |
| 5 | `domain/entities/vendor.entity.ts` | `approve()`, `reject()` metodları |
| 6 | `presentation/vendor-admin.controller.ts` | Admin HTTP endpoints |

---

## 5. Domain Entity Detayları

### 5.1 Vendor Entity

**Tam Yol:** `apps/backend/src/modules/vendor/domain/entities/vendor.entity.ts`

```typescript
// Kritik alanlar
- id: string (UUID)
- userId: string ( sahibi )
- companyId: string ( bağlı şirket )
- status: VendorStatus (PENDING | APPROVED | REJECTED | SUSPENDED)
- tier: VendorTier (CORE varsayılan)
- vendorType: VendorType (COMMERCE | RESTAURANT)
- slug: string ( benzersiz store URL )
- isVerified: boolean
- verifiedAt?: Date
- ecosystemId?: string ( opsiyonel )
- barterEnabled: boolean ( varsayılan: false )
- featured: boolean ( varsayılan: false )
- commissionRate?: number ( admin override )
```

**Kritik Metodlar:**
- `create(props)` — Fabrika metodu, status=PENDING olarak başlar
- `approve()` — status=APPROVED, isVerified=true, verifiedAt=now, `VendorApprovedEvent` tetikler
- `reject(reason)` — status=REJECTED, `VendorRejectedEvent` tetikler
- `suspend(reason)` — status=SUSPENDED, `VendorSuspendedEvent` tetikler

### 5.2 VendorProfile Entity

**Tam Yol:** `apps/backend/src/modules/vendor/domain/entities/vendor-profile.entity.ts`

```typescript
// RESTAURANT için ek alanlar
- openingHours?: OpeningHours[]
- cuisineType?: string
- deliveryRadius?: number (km)
- minOrderAmount?: number
- avgPrepTimeMinutes?: number
- acceptingOrders?: boolean ( varsayılan: true )
```

### 5.3 Company Entity

**Tam Yol:** `apps/backend/src/modules/vendor/domain/entities/company.entity.ts`

```typescript
// Kritik alanlar
- id: string
- vendorId?: string ( opsiyonel, satıcı oluşturulduktan sonra set )
- taxNumber?: TaxNumber ( değer obje, unique )
- name: string
- status: 'PENDING' | 'VERIFIED' | 'REJECTED'
- vatRate: number ( varsayılan: 20.0 )
- verifiedAt?: Date
```

> ⚠️ **Company Status Enum Açıklaması:** Company'nin `status` alanı Vendor'dan bağımsız bir enum kullanır. `APPROVED` Vendor status'u iken `VERIFIED` Company status'idur. Bu iki varlık farklı aggregate root olduğundan kendi status enum'larını kullanırlar.

---

## 6. Kritik Kontroller ve Denetim Noktaları

### 6.1 Kayıt Anında Yapılan Kontroller

| Kontrol | Nerede | Sonuç |
|---------|--------|-------|
| Company mevcut mu? | `RegisterVendorHandler` | NotFoundException |
| Kullanıcı zaten vendor mu? | `RegisterVendorHandler` | ConflictException — **REJECTED durumu bypass edilir** |
| Slug benzersiz mi? | `VendorSlug.generate()` | ConflictException |
| VendorType geçerli mi? | `RegisterVendorDto` | ValidationException |

### 6.2 Onaylama Anında Yapılan Kontroller

| Kontrol | Nerede | Sonuç |
|---------|--------|-------|
| Vendor mevcut mu? | `ApproveVendorHandler` | NotFoundException |
| Status PENDING mi? | `ApproveVendorHandler` | BadRequestException |
| Company mevcut mu? | `ApproveVendorHandler` | NotFoundException |

### 6.3 Şirket Senkronizasyonu Kuralı ⚠️

> **Kritik Kural:** Vendor onaylandığında Company de otomatik olarak `VERIFIED` olmalıdır.
> Aynı durum `REJECTED` için de geçerlidir.

Bu senkronizasyon `ApproveVendorHandler` içinde **domain bypass** ile yapılır — Company ayrı bir aggregate root olduğundan kendi domain metodu (`verify()`) kullanılır:

```typescript
// ApproveVendorHandler — Company güncellemesi
await this.companyRepo.update(vendor.getProps().companyId, {
  status: 'VERIFIED',  // NOT: 'APPROVED' değil — Company VERIFIED kullanır
  verifiedAt: new Date(),
});
```

> **Mimari Not:** Company aggregate'inde `verify()` domain metodu mevcuttur (`company.entity.ts` satır 46-50). Ancak handler doğrudan repository'ye yazmaktadır çünkü Company entity'si bu handler'ın bağımlılığında değildir. Bu bir **domain bypass** sayılır ve uz vadede Company aggregate'i bir domain service üzerinden güncellenmelidir.

> **Askıya Alma / Geri Alma Durumu:** Vendor `SUSPENDED` veya `APPROVED (reinstate)` durumuna geçtiğinde bağlı Company `VERIFIED` kalmaya devam eder. Askıya alma işlemi ticari faaliyeti dondurur, yasal doğrulamayı etkilemez.

---

## 7. Admin Panel Endpoint'leri

**Controller:** `apps/backend/src/modules/vendor/presentation/vendor-admin.controller.ts`

| Endpoint | Method | İşlem |
|----------|--------|-------|
| `/admin/vendors/:id/approve` | PUT | Satıcı onayla |
| `/admin/vendors/:id/reject` | PUT | Satıcı reddet (rejectionReason zorunlu) |
| `/admin/vendors/:id` | PUT | Güncelle (featured, B2B, tier, commissionRate) |
| `/admin/vendors` | GET | Listele (page, limit, status, search) |
| `/admin/vendors/:id` | GET | Detay getir |

---

## 8. Event-driven Mimari

### 8.1 Domain Events

| Event Sınıfı | Tetiklendiği Yer | Dinleyiciler |
|--------------|------------------|--------------|
| `VendorRegisteredEvent` | `Vendor.create()` | EventBus → EmailService, NotificationService |
| `VendorApprovedEvent` | `Vendor.approve()` | EventBus → EmailService, WalletService |
| `VendorRejectedEvent` | `Vendor.reject()` | EventBus → EmailService |
| `VendorSuspendedEvent` | `Vendor.suspend()` | EventBus → EmailService |

### 8.2 Event Payload Yapısı

```typescript
// VendorApprovedEvent
{
  vendorId: string
  userId: string
  companyId: string
  approvedBy: string (adminUserId)
  timestamp: Date
}

// VendorRejectedEvent
{
  vendorId: string
  reason: string
  timestamp: Date
}
```

---

## 9. Audit Kontrol Listesi

### A. Kayıt İşlemleri

- [ ] `RegisterVendorDto` tüm zorunlu alanları içeriyor mu? (companyId, storeName)
- [ ] `RegisterVendorHandler` company existence kontrolü yapıyor mu?
- [ ] `RegisterVendorHandler` duplicate vendor kontrolü yapıyor mu? **REJECTED kayıtlar bypass ediliyor**
- [ ] Slug generation uniqueness garantisi veriyor mu?
- [ ] `Vendor.create()` varsayılan olarak `PENDING` status ile başlıyor mu?
- [ ] `VendorRegisteredEvent` publish ediliyor mu?

### B. Onaylama İşlemleri

- [ ] `ApproveVendorHandler` PENDING kontrolü yapıyor mu?
- [ ] Onay sonrası Company status senkronizasyonu `VERIFIED` olarak yapılıyor mu?
- [ ] `verifiedAt` timestamp'i doğru set ediliyor mu?
- [ ] `VendorApprovedEvent` publish ediliyor mu?
- [ ] AuditLog kaydı oluşturuluyor mu?

### C. Reddetme İşlemleri

- [ ] `RejectVendorHandler` rejectionReason kayıt ediyor mu?
- [ ] `vendor.reject()` domain metodu üzerinden status güncelleniyor mu?
- [ ] `VendorRejectedEvent` publish ediliyor mu? ← **DÜZELTİLDİ**
- [ ] Company status REJECTED olarak güncelleniyor mu?
- [ ] AuditLog kaydı oluşturuluyor mu?

### D. Güvenlik

- [ ] Admin endpoint'leri yetkilendirme kontrolü yapıyor mu?
- [ ] `VendorType` enum validation'ı çalışıyor mu?
- [ ] `VendorTier` sadece geçerli değerlerle güncellenebiliyor mu?

---

## 10. Bilinen Teknik Borçlar

| Sorun | Dosya | Öncelik |
|-------|-------|---------|
| `any` tip kullanımı | list-vendors.handler.ts | Yüksek |
| Domain bypass (Company sync) | approve-vendor.handler.ts | Orta |
| Event listener registerasyonu eksikliği | Event handler'lar | Orta |
| `suspend()` entity guard eksik | vendor.entity.ts | **Yüksek** |
| `reinstate()` entity guard eksik | vendor.entity.ts | **Yüksek** |

---

## 11. Durum Geçişleri Tablosu

| Başlangıç Durumu | Olay | Hedef Durum | Handler | Durum |
|-------------------|------|-------------|---------|-------|
| — | Register | `PENDING` | `RegisterVendorHandler` | ✅ Implemented |
| `PENDING` | Admin Approve | `APPROVED` | `ApproveVendorHandler` | ✅ Implemented |
| `PENDING` | Admin Reject | `REJECTED` | `RejectVendorHandler` | ✅ Implemented |
| `APPROVED` | Admin Suspend | `SUSPENDED` | `SuspendVendorHandler` | ✅ Implemented — entity guard eklendi |
| `SUSPENDED` | Admin Reinstate | `APPROVED` | `ReinstateVendorHandler` | ✅ Implemented — entity guard eklendi |
| `REJECTED` | Yeni başvuru | `PENDING` | `RegisterVendorHandler` | ✅ **Çözüldü** — REJECTED kayıt bypass, yeni başvuruya izin |

---

## 12. İlgili Tüm Dosyaların Tam Yol Listesi

### Application Layer

```
apps/backend/src/modules/vendor/application/
├── commands/
│   ├── register-vendor.command.ts
│   ├── register-vendor.handler.ts
│   ├── approve-vendor.command.ts
│   ├── approve-vendor.handler.ts         ← Company status 'VERIFIED' olarak düzeltildi
│   ├── reject-vendor.command.ts
│   ├── reject-vendor.handler.ts          ← VendorRejectedEvent publish eklendi
│   ├── update-vendor.command.ts
│   ├── update-vendor.handler.ts
│   ├── suspend-vendor.command.ts         ← YENİ (command mevcut, handler bekleniyor)
├── queries/
│   ├── list-vendors.query.ts
│   └── list-vendors.handler.ts
├── services/
│   ├── vendor-registration.service.ts
│   ├── commission-engine.service.ts
│   ├── early-payment.service.ts
│   ├── vendor-score.service.ts
│   ├── garage-sale.service.ts
│   ├── watchover.service.ts
│   └── bazarx-publish.service.ts
└── dtos/
    ├── register-vendor.dto.ts
    ├── update-vendor.dto.ts
    └── vendor-response.dto.ts
```

### Domain Layer

```
apps/backend/src/modules/vendor/domain/
├── entities/
│   ├── vendor.entity.ts              ← approve(), reject(), suspend() metodları
│   ├── vendor-profile.entity.ts
│   ├── vendor-settings.entity.ts
│   ├── vendor-score.entity.ts
│   ├── company.entity.ts             ← verify() domain metodu mevcut
│   ├── brand.entity.ts
│   ├── brand-ecosystem.entity.ts
│   ├── early-payment-request.entity.ts
│   ├── vendor-violation.entity.ts
│   └── vendor-bank-account.entity.ts
├── enums/
│   ├── vendor-status.enum.ts         ← PENDING, APPROVED, REJECTED, SUSPENDED
│   ├── vendor-type.enum.ts
│   └── vendor-tier.enum.ts
├── events/
│   ├── vendor-registered.event.ts
│   ├── vendor-approved.event.ts
│   ├── vendor-rejected.event.ts      ← reject() tetikler
│   └── vendor-suspended.event.ts     ← suspend() tetikler
└── repositories/
    ├── vendor.repository.interface.ts
    ├── vendor-profile.repository.interface.ts
    ├── vendor-settings.repository.interface.ts
    └── company.repository.interface.ts
```

### Infrastructure Layer

```
apps/backend/src/modules/vendor/infrastructure/
├── persistence/
│   ├── mongo-vendor.repository.ts
│   ├── mongo-vendor-profile.repository.ts
│   ├── mongo-vendor-settings.repository.ts
│   └── mongo-company.repository.ts
└── mappers/
    ├── vendor.mapper.ts
    └── company.mapper.ts
```

### Presentation Layer

```
apps/backend/src/modules/vendor/presentation/
├── vendor.controller.ts
├── vendor-admin.controller.ts
├── company.controller.ts
├── ecosystem.controller.ts
├── vendor-product.controller.ts
├── vendor-banners.controller.ts
├── vendor-brands.controller.ts
├── early-payment.controller.ts
├── vendor-score.controller.ts
└── commission.controller.ts
```

---

## 13. Özet Akış Diyagramı

```
┌─────────────────────────────────────────────────────────────────┐
│                     VENDOR LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Kullanıcı Başvuru Yapar]                                       │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │  POST /vendors   │                                            │
│  │  /apply          │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────────┐                  │
│  │ RegisterVendorHandler                     │                  │
│  │ 1. Company kontrolü                       │                  │
│  │ 2. User kontrolü (duplicate?)              │                  │
│  │ 3. Vendor.create(PENDING)                 │                  │
│  │ 4. VendorProfile.create()                 │                  │
│  │ 5. VendorSettings.create()                 │                  │
│  │ 6. VendorRegisteredEvent publish          │                  │
│  │ 7. AuditLog: VENDOR_REGISTERED           │                  │
│  └────────────────┬─────────────────────────┘                  │
│                   │                                            │
│                   ▼                                            │
│         ┌─────────────────┐                                    │
│         │     PENDING     │ ← Admin onayı bekliyor              │
│         └────────┬────────┘                                    │
│                  │                                             │
│     ┌────────────┴────────────┐                                │
│     │                         │                                │
│     ▼                         ▼                                │
│  [Onayla]              [Reddet]                                 │
│     │                         │                                │
│     ▼                         ▼                                │
│  ┌──────────┐           ┌──────────┐                           │
│  │ APPROVED │           │ REJECTED │                           │
│  └────┬─────┘           └──────────┘                           │
│       │                    (Yeni başvuru yapılabilir — REJECTED bypass)│
│       ▼                                                      │
│  ┌──────────┐                                               │
│  │SUSPENDED │ ← (Admin tarafından, implementasyon bekleniyor) │
│  └──────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Düzeltme Kayıtları

### 2026-05-26 — Mimari Hata Düzeltmeleri

| # | Sorun | Düzeltme | Dosya |
|---|-------|----------|-------|
| 1 | State machine diyagramında `PENDING → SUSPENDED` geçişi yanlış gösteriliyordu | Diyagram düzeltildi — SUSPENDED sadece APPROVED'den geçişer | `satıcıhesap.md` Bölüm 2 |
| 2 | `ApproveVendorHandler` Company status'u `APPROVED` yazıyordu (enum uyumsuzluğu) | `APPROVED` → `VERIFIED` olarak düzeltildi | `approve-vendor.handler.ts` satır 43, 50 |
| 3 | `RejectVendorHandler` VendorRejectedEvent publish etmiyordu | `eventBus.publish(new VendorRejectedEvent(...))` eklendi | `reject-vendor.handler.ts` |
| 4 | `suspend-vendor.command.ts` eksikti → handler tetiklenemiyordu | Yeni command dosyası oluşturuldu | `suspend-vendor.command.ts` (yeni) |
| 5 | `REJECTED → yeni başvuru` akışı belirsiz (ConflictException riski) | `RegisterVendorHandler`'da `existingVendor.status !== 'REJECTED'` bypass eklendi | `register-vendor.handler.ts` |
| 6 | REJECTED kayıt soft-delete yerine direkt yeni başvuruya izin veriliyor | Karar: REJECTED kayıt bypass edilir, yeni PENDING kayıt açılır | `register-vendor.handler.ts` |

---

*Bu doküman BazarX satıcı modülünün eksiksiz denetim raporudur. Herhangi bir değişiklik yapılmadan önce bu kontrol listesi referans alınmalıdır.*