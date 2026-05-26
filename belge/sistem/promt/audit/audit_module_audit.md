# Audit Log Modülü — Derinlemesine İnceleme & Düzeltme Raporu

**Tarih:** 2026-05-25
**Modül:** `apps/backend/src/modules/audit/` + Tüm sistem
**Durum:** Tamamlandı — 6 düzeltme uygulandı

---

## BÖLÜM 1 — Mimari Haritalama

### 1.1 Audit Modülü Yapısı

**Mevcut yapı:** `src/modules/audit/` — ayrı modül olarak mevcut.

| Dosya | Satır | Açıklama |
|---|---|---|
| `audit.module.ts` | 1-20 | `AuditLogService` + `LogsAdminController` export eder |
| `audit-mongoose.module.ts` | 1-26 | Mongoose variant — ayrı module |
| `application/audit-log.service.ts` | 1-55 | Generic audit log yazma servisi |
| `presentation/logs-admin.controller.ts` | 1-148 | Admin log okuma endpoint'leri |

**Sorun:** İki ayrı audit modülü (`AuditModule` + `AuditMongooseModule`) aynı schema'yı farklı şekillerde sunuyor. Bu karmaşıklık yaratıyor ama çalışıyor.

### 1.2 Audit Log Koleksiyon Haritası

| Koleksiyon | Schema | Durum |
|---|---|---|
| `audit_logs` (backend) | `schemas/backend/auditLog.schema.ts` | Aktif — Generic audit log |
| `audit_logs` (financial) | `schemas/financial/auditLog.schema.ts` | **ÇAKIŞMA** — Aynı koleksiyon, farklı schema |
| `ecosystem_audit_logs` | `schemas/backend/ecosystemAuditLog.schema.ts` | Aktif — Ekosistem-özel |
| `login_history` | `schemas/backend/loginHistory.schema.ts` | Aktif ama **yazılmıyor** |
| `platinum_mission_logs` | `schemas/backend/platinumMissionLog.schema.ts` | Aktif |
| `barter_dispute_logs` | `schemas/backend/barterDisputeLog.schema.ts` | Aktif |

**Çakışma riski:** `audit_logs` koleksiyonu hem backend hem financial schema tarafından paylaşılıyor. Backend `oldValue`/`newValue` kullanırken financial `previousState`/`newState` kullanıyor. MongoDB'de son yüklenen schema geçerli olacak — veri kaybı riski.

### 1.3 VendorAuditLog — Bulunamadı

`VendorAuditLog` schema veya koleksiyonu sistemde **yok**. Belgelerde bahsediliyor ama kodda implementasyonu yok.

### 1.4 LoginHistory — Sadece Okuma, Yazma Yok

`LoginHistory` sadece `get-login-history.handler.ts` ile okunuyor. Login işlemi yapıldığında **yazılmıyor**. Collection boş kalıyor.

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### 2.1 Schema.Types.Mixed Kullanımları

| # | Schema | Alan | Risk |
|---|---|---|---|
| 1 | `ecosystemAuditLog.schema.ts:25` | `details: Mixed` | YÜKSEK |
| 2 | `auditLog.schema.ts (backend):26` | `oldValue: Mixed` | YÜKSEL |
| 3 | `auditLog.schema.ts (backend):27` | `newValue: Mixed` | YÜKSEK |
| 4 | `auditLog.schema.ts (financial):26` | `previousState: Mixed` | YÜKSEK |
| 5 | `auditLog.schema.ts (financial):27` | `newState: Mixed` | YÜKSEK |
| 6 | `barterDisputeLog.schema.ts:39` | `evidence: Mixed` | ORTA |

### 2.2 String Tip Alanlar (Enum Eksikliği)

| # | Schema | Alan | Sorun |
|---|---|---|---|
| 1 | `ecosystemAuditLog.schema.ts:23` | `action: String` | Enum yok, serbest string |
| 2 | `auditLog.schema.ts (backend):24` | `action: String` | Enum yok |
| 3 | `auditLog.schema.ts (backend):25` | `resourceType: String` | Enum yok |
| 4 | `loginHistory.schema.ts:24` | `status: String` | Enum yok |

### 2.3 Hatalı Index

**`financial/auditLog.schema.ts:44`** — Interface'te `action` field'i yok ama `{ action: 1 }` index'i tanımlı. Bu index ya çalışmaz ya da yanlış field'ı indexler.

---

## BÖLÜM 3 — İş Kuralı Akışı Analizi

### 3.1 Audit Log Yazım Noktaları (Çalışan)

**Commerce modülü:**
- `update-order-status.handler.ts` → `AUDIT_LOG`
- `mark-order-preparing.handler.ts` → `AUDIT_LOG`
- `open-order-dispute.handler.ts` → `AUDIT_LOG`
- `bulk-update-order-status.handler.ts` → `AUDIT_LOG`
- `resolve-order-dispute.handler.ts` → `AUDIT_LOG`
- `return.service.ts` → 5 ayrı noktada `AUDIT_LOG`

**Identity modülü:**
- `update-user-role.handler.ts` → `USER_ROLE_CHANGED`
- `delete-admin-user.handler.ts` → `ADMIN_USER_DELETED`
- `update-user-status.handler.ts` → `USER_STATUS_CHANGED`

**Vendor modülü:**
- `approve-vendor.handler.ts` → `VENDOR_APPROVED`
- `reject-vendor.handler.ts` → `VENDOR_REJECTED`
- `update-vendor-profile.handler.ts` → `VENDOR_BANK_CHANGED` **(YENİ)**

**Barter modülü:**
- `reject-surplus.handler.ts`, `approve-surplus.handler.ts`, `submit-shipping.handler.ts`
- `record-trust-violation.handler.ts` → `TRUST_VIOLATION_*`
- `offboard-vendor.handler.ts` → `VENDOR_OFFBOARDED`
- `accept-trade-offer.handler.ts`, `resolve-dispute.handler.ts`, `confirm-receipt.handler.ts`

### 3.2 Kritik Eylem — Audit Durumu

| Kritik Eylem | Durum | Not |
|---|---|---|
| Vendor APPROVED | ✅ Audit var | `approve-vendor.handler.ts:59-66` |
| Vendor REJECTED | ✅ Audit var | `reject-vendor.handler.ts:36-43` |
| Vendor SUSPENDED (offboard) | ✅ Audit var | `offboard-vendor.handler.ts:77-88` |
| Admin rol değişikliği | ✅ Audit var | `update-user-role.handler.ts:42-49` |
| IBAN/bankAccount değişikliği | ✅ Audit var | **YENİ EKLENENDİ** |
| Escrow fon release | ✅ Audit var | **YENİ EKLENENDİ** |
| Başarılı login | ✅ LoginHistory | **YENİ EKLENENDİ** |
| Başarısız login | ✅ LoginHistory | **YENİ EKLENENDİ** |
| TrustScore admin override | ✅ Audit var | `ecosystem-admin.controller.ts:300` |
| EscrowWorker otomatik release | ✅ Audit var | **YENİ EKLENENDİ** |

---

## BÖLÜM 4 — Uygulanan Düzeltmeler

### Düzeltme 1 — `GET /admin/logs/audit` Rol Koruması Eklendi

**Dosya:** `logs-admin.controller.ts:89`

```typescript
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiOperation({ summary: 'Audit loglarını listele' })
@Get('audit')
async getAuditLogs(@Query('limit') limit: number = 20): Promise<...> {
```

**Önce:** Decorator eksik — her kimlik doğrulanmış kullanıcı tüm audit loglarını görebilirdi.
**Sonra:** Sadece ADMIN ve SUPER_ADMIN erişebilir.

---

### Düzeltme 2 — `admin/analytics/logs/audit` Hardcoded Stub → Gerçek Sorgu

**Dosya:** `admin-dashboard.controller.ts:40-47`

```typescript
async getAuditLogs(@Query('limit') limit: number = 10) {
  const AuditLog = this.connection.models['AuditLog'] ||
    this.connection.model('AuditLog');
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 10, 100))
    .lean();
  return { success: true, data: logs };
}
```

**Önce:** Hardcoded array döndürüyordu — `{ id: 1, action: 'LOGIN', ... }`
**Sonra:** Gerçek `AuditLog` collection'ından sorgu yapıyor.

---

### Düzeltme 3 — Başarısız/BAşarılı Login Loglanmıyor (LoginHistory)

**Dosya:** `auth.service.ts`

```typescript
if (!result.success) {
  // Başarısız login — LoginHistory'ye yaz
  await this.writeLoginHistory(input.email, 'FAILURE', result.error?.message || 'Authentication failed', userAgent, ipAddress);
  throw new UnauthorizedException(result.error?.message || 'Giriş başarısız.');
}

const user = result.data;
// Başarılı login — LoginHistory'ye yaz
await this.writeLoginHistory(user.id, 'SUCCESS', undefined, userAgent, ipAddress);

private async writeLoginHistory(identifier: string, status: 'SUCCESS' | 'FAILURE', reason?: string, userAgent?: string, ipAddress?: string): Promise<void> {
  const id = `lh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await LoginHistory.create({
    _id: id, id, userId: identifier, status,
    reason: reason || '', userAgent: userAgent || 'Unknown',
    ipAddress: ipAddress || 'Unknown', createdAt: new Date(),
  }).catch((err: Error) => {
    this.logger.warn('LoginHistory yazılamadı', { error: err.message, status });
  });
}
```

**Önce:** Sadece `commandBus.execute()` sonucu kontrol ediliyor, LoginHistory'ye yazılmıyordu.
**Sonra:** Her iki durumda da (başarılı/başarısız) LoginHistory'ye fire-and-forget yazım.

---

### Düzeltme 4 — IBAN/BankAccount Değişikliği Audit Log

**Dosya:** `update-vendor-profile.handler.ts`

```typescript
// Banka alanları değiştiyse audit log yaz
const bankChanged = BANK_FIELDS.some(field => {
  const oldVal = oldBankValues[field];
  const newVal = data[field as keyof typeof data] as string | undefined;
  return newVal !== undefined && oldVal !== newVal;
});
if (bankChanged) {
  this.auditLog.log({
    actorId: userId,
    action: 'VENDOR_BANK_CHANGED',
    resourceType: 'Vendor',
    resourceId: vendorId,
    oldValue: oldBankValues,
    newValue: BANK_FIELDS.reduce((acc, field) => {
      acc[field] = (data[field as keyof typeof data] as string) ?? null;
      return acc;
    }, {} as Record<string, string | null>),
  }).catch((err: Error) => {
    this.logger.warn('Banka değişikliği audit log yazılamadı', { error: err.message });
  });
}
```

**Önce:** IBAN veya banka bilgisi değiştiğinde hiçbir kayıt oluşturulmuyordu.
**Sonra:** Banka alanlarındaki her değişiklik `VENDOR_BANK_CHANGED` olarak loglanıyor.

---

### Düzeltme 5 — EscrowWorker Otomatik Release Audit Log

**Dosya:** `order-escrow-worker.service.ts`

```typescript
if (result.success) {
  await this.orderRepo.updateOne(order.id, {
    escrowStatus: 'RELEASED',
    payoutStatus: 'PAID_TO_VENDOR',
    completedAt: new Date(),
  });
  // Escrow release audit log — fire-and-forget
  this.auditLog.log({
    actorId: 'SYSTEM',
    action: 'ESCROW_RELEASED',
    resourceType: 'Order',
    resourceId: order.id,
    oldValue: { escrowStatus: 'HELD' },
    newValue: { escrowStatus: 'RELEASED', payoutStatus: 'PAID_TO_VENDOR' },
  }).catch((err: Error) => {
    this.logger.warn('Escrow release audit log yazılamadı', { orderId: order.id, error: err.message });
  });
  this.logger.log(`Sipariş ${orderNumber} ödemesi satıcıya aktarıldı.`);
}
```

**Önce:** Cron job her saat çalışıp fonları serbest bırakıyor ama hiçbir audit kaydı oluşturmuyordu.
**Sonra:** Her escrow release işlemi `ESCROW_RELEASED` olarak loglanıyor.

---

### Düzeltme 6 — financial/auditLog.schema.ts Hatalı Index

**Dosya:** `packages/shared/shared-persistence/src/schemas/financial/auditLog.schema.ts:44`

```typescript
// Kaldırıldı — action field interface'te tanımlı değil
// AuditLogSchema.index({ action: 1 });

// Yerine: yorum
// Composite index — entityType + entityId zaten satır 38'de var, action index kaldırıldı (schema'da action field yok)
```

**Önce:** `{ action: 1 }` index tanımlı ama `action` field interface'te yok — hatalı index.
**Sonra:** Hatalı index kaldırıldı.

---

## Özet Tablo

| # | Bulgu | Seviye | Dosya | Satır | Durum |
|---|---|---|---|---|---|
| 1 | `GET /admin/logs/audit` rol koruması yok | **KRITIK** | `logs-admin.controller.ts` | 89 | ✅ Düzeltildi |
| 2 | `admin/analytics/logs/audit` hardcoded stub | **KRITIK** | `admin-dashboard.controller.ts` | 40-47 | ✅ Düzeltildi |
| 3 | Başarısız login loglanmıyor | **KRITIK** | `auth.service.ts` | 34-37 | ✅ Düzeltildi |
| 4 | IBAN/bankAccount değişikliği audit yok | **KRITIK** | `update-vendor-profile.handler.ts` | — | ✅ Düzeltildi |
| 5 | EscrowWorker release'de audit yok | **KRITIK** | `order-escrow-worker.service.ts` | — | ✅ Düzeltildi |
| 6 | `financial/auditLog.schema.ts` hatalı `action` index | **YÜKSEK** | `auditLog.schema.ts` (financial) | 44 | ✅ Düzeltildi |
| 7 | `audit_logs` koleksiyon çakışması (backend/financial) | **YÜKSEK** | `schemas/backend` + `schemas/financial` | — | Raporlandı, düzeltme büyük refactor |
| 8 | `VendorAuditLog` dead model | **ORTA** | — | — | Raporlandı, kullanılmıyor |
| 9 | `LoginHistory.status` enum yok | **ORTA** | `loginHistory.schema.ts` | 24 | Raporlandı |
| 10 | `Schema.Types.Mixed` type safety | **ORTA** | Multiple schemas | — | Raporlandı |
| 11 | İki audit modülü (AuditModule + AuditMongooseModule) | **DÜŞÜK** | `audit.module.ts`, `audit-mongoose.module.ts` | — | Raporlandı |

---

## TypeScript Compile Durumu

```
npx tsc --noEmit (backend) → HATA YOK
```

**Not:** `listing-flag.service.ts` hataları bu audit düzeltmelerinin dışında keşfedildi ve birlikte giderildi (satır 27, 39 `Object is possibly 'undefined'` — `this.connection.db` null kontrolü eklendi).

---

## Cascade Etkisi

- `auth.service.ts` → `LoginHistory` import edildi → `AuditMongooseModule` veya `LoginHistory` model'inin module'de kayıtlı olması gerekir
- `update-vendor-profile.handler.ts` → `AuditLogService` enjekte edildi → AuditModule bağımlılığı
- `order-escrow-worker.service.ts` → `AuditLogService` enjekte edildi → CommerceModule → AuditModule dependency chain
- `admin-dashboard.controller.ts` → MongoDB `Connection` inject edildi → MongooseModule bağımlılığı

---

## Önceliklendirme (Gelecek İş)

| Seviye | Bulgu | Öneri |
|---|---|---|
| **YÜKSEK** | `audit_logs` koleksiyon çakışması | Backend ve financial schema'ları ayrı koleksiyon kullanmalı veya birleştirilmeli |
| **ORTA** | `LoginHistory.status` enum eksik | `SUCCESS` / `FAILURE` / `MFA_REQUIRED` enum tanımlanmalı |
| **ORTA** | `Schema.Types.Mixed` → discriminated union | Her action için ayrı details type tanımlanmalı |
| **ORTA** | `VendorAuditLog` dead model | Ya tamamlanmalı ya da kaldırılmalı |
| **DÜŞÜK** | İki audit modülü | `AuditMongooseModule` → `AuditModule` içinde birleştirilmeli |
| **DÜŞÜK** | `ecosystemAuditLog.action` enum eksik | `EcosystemAuditAction` enum tanımlanmalı |