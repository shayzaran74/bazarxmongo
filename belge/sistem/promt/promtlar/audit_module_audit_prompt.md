# Audit Logları — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Sistemde `apps/backend/src/modules/audit/` diye ayrı bir modül olmayabilir — ya da küçük bir stub olabilir. Audit logları şu an sisteme dağılmış durumda: her modül kendi log mekanizmasını ayrı ayrı implement etmiş. Bu prompt'un görevi hem bu dağıtık yapıyı haritalamak hem de merkezileşme potansiyelini değerlendirmek.

**Tespit edilen audit log koleksiyonları (belgelerden):**

| Koleksiyon | Modül | Durum |
|---|---|---|
| `ecosystem_audit_logs` (EcosystemAuditLog) | vendor/ecosystem | ✅ Çalışıyor, severity: INFO/WARN/HIGH/CRITICAL |
| `login_histories` (LoginHistory) | identity | ? |
| `vendor_score_histories` (VendorScoreHistory) | vendor | ? |
| `barter_dispute_logs` (BarterDisputeLog) | barter | ? |
| `batch_match_logs` (BatchMatchLog) | barter | ? |
| `platinum_mission_logs` (PlatinumMissionLog) | loyalty | ? |
| `VendorAuditLog` | vendor (belgelerde bahsedilen) | ? — schema gerçekten var mı? |

**Önemli bağlam:** `EcosystemAuditLog` bu sistemdeki en kapsamlı audit log örneği. Severity seviyeleri tanımlı (INFO/WARN/HIGH/CRITICAL), index'leri var, her CRUD eyleminde yazılıyor. Diğer modüllerde bu seviyede yapı var mı bilinmiyor.

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Birincil inceleme hedefi:**
```
apps/backend/src/modules/audit/ (varsa)
```

**İkincil inceleme hedefleri — tüm sistemdeki audit log noktaları:**
```
apps/backend/src/modules/vendor/    → EcosystemAuditLog, VendorAuditLog (?)
apps/backend/src/modules/identity/  → LoginHistory
apps/backend/src/modules/barter/    → BarterDisputeLog, BatchMatchLog
apps/backend/src/modules/loyalty/   → PlatinumMissionLog
```

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

---

## Audit Log İş Kuralları — Bunları Bilmeden İnceleme Yapma

### EcosystemAuditLog (En Olgun Örnek)

```typescript
// Belgelenmiş schema:
interface EcosystemAuditLogDocument {
  _id: Types.ObjectId;
  ecosystemId: Types.ObjectId;
  vendorId: Types.ObjectId;
  action: string;                          // ⚠️ string — enum değil?
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
  details: Mixed;                          // ⚠️ Mixed — any gibi
  createdAt: Date;
}

// Index'ler: { ecosystemId }, { vendorId }, { action }, { severity }

// Yazıldığı noktalar:
// ECOSYSTEM_CREATED → severity: HIGH
// MEMBER_ADDED → severity: HIGH
// MEMBER_REMOVED → severity: HIGH
// UPDATE_SETTINGS → severity: HIGH (tüm eylemler HIGH mi?)
```

### İdeal Audit Log Yapısı

```typescript
// Merkezi audit log için beklenen:
interface AuditLogDocument {
  _id: Types.ObjectId;
  
  // Kim yaptı?
  actorId: Types.ObjectId;              // userId
  actorRole: string;                    // ADMIN, VENDOR, USER
  
  // Ne üzerinde?
  entityType: AuditEntityType;          // ECOSYSTEM, VENDOR, ORDER, SWAP_SESSION...
  entityId: Types.ObjectId;
  
  // Ne yaptı?
  action: AuditAction;                  // enum — string değil
  
  // Önem seviyesi?
  severity: AuditSeverity;             // INFO | WARN | HIGH | CRITICAL
  
  // Önceki / sonraki durum?
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  
  // Ek bilgi
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: Date;
}

type AuditSeverity = 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';

type AuditEntityType =
  | 'ECOSYSTEM' | 'VENDOR' | 'USER' | 'ORDER'
  | 'SWAP_SESSION' | 'TRADE_OFFER' | 'WALLET'
  | 'ADMIN_ACTION' | 'AUTH';

type AuditAction =
  | 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED'
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'MEMBER_ADDED' | 'MEMBER_REMOVED'
  | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  | 'FUNDS_HELD' | 'FUNDS_RELEASED' | 'FUNDS_REFUNDED'
  | 'ROLE_CHANGED' | 'SETTINGS_CHANGED';
```

### Audit Log Güvenlik Gereksinimleri

```
Audit loglar DEĞİŞTİRİLEMEZ olmalı:
  → Update endpoint'i olmamalı
  → Delete endpoint'i olmamalı (TTL ile otomatik silinebilir)
  → Sadece INSERT operasyonu

Admin erişimi:
  → Sadece ADMIN ve SUPER_ADMIN okuyabilmeli
  → Vendor kendi loglarını görebilir (sadece okuma)
  → User kendi login geçmişini görebilir

Filtreleme:
  → Tarih aralığı
  → Severity
  → entityType + entityId
  → actorId
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Ayrı bir audit modülü var mı?**

```bash
ls apps/backend/src/modules/ | grep -i audit
find apps/backend/src/ -name "*audit*" -type f
```

- `apps/backend/src/modules/audit/` klasörü var mı?
- Varsa içinde ne var? Controller, handler, schema, servis?
- Yoksa audit logları tamamen dağıtık mı çalışıyor?

**1.2 Tüm sistemdeki audit log noktalarını haritalandır:**

```bash
grep -rn "AuditLog\|auditLog\|audit_log\|LoginHistory\|ScoreHistory\|DisputeLog\|MatchLog\|MissionLog" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|schema\|module\|import" \
  | awk -F: '{print $1}' | sort | uniq -c | sort -rn | head -20
```

Her modül için:
- Hangi audit log koleksiyonuna yazıyor?
- Yazım şekli: servis mi, doğrudan Mongoose mi, event mi?
- Schema tanımı nerede?

**1.3 `EcosystemAuditLog.action` alan analizi:**

`action: string` — bu kritik bir tip güvensizliği.

```bash
grep -rn "action.*ECOSYSTEM_CREATED\|action.*MEMBER_ADDED\|MEMBER_REMOVED\|UPDATE_SETTINGS\|EcosystemAuditLog" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|spec"
```

- `action` field'ına yazılan string değerleri neler?
- Kaç farklı action değeri kullanılıyor? Tutarlı mı?
- Enum tanımlı mı, yoksa her handler kendi string'ini mi yazıyor?

**1.4 `EcosystemAuditLog.details: Mixed` analizi:**

`Mixed` tip MongoDB'de `any` demektir — tip güvensiz.

- `details` field'ına ne yazılıyor? Hangi yapı?
- Her action için `details` içeriği farklı mı?
- `Record<string, unknown>` veya discriminated union ile nasıl tiplenebilir?

**1.5 `VendorAuditLog` gerçekten var mı?**

```bash
find apps/backend/src/ -name "*vendorAudit*" -o -name "*vendor-audit*" | head -5
grep -rn "VendorAuditLog\|vendor_audit" \
  apps/backend/src/ --include="*.ts" | head -10
```

Master plan'da "Satıcı ihlal geçmişi `VendorAuditLog` collection'ına yazılır" diyor.
- Schema var mı?
- Herhangi bir handler yazıyor mu?
- Yoksa: bu koleksiyon hiç oluşturulmamış, sadece belgede var

**1.6 LoginHistory yazım noktaları:**

```bash
grep -rn "LoginHistory\|loginHistory" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|import\|\.spec\." | head -10
```

- Login başarılı olduğunda yazılıyor mu?
- Login başarısız olduğunda yazılıyor mu?
- Her ikisi de mi (IP, userAgent, timestamp ile)?
- Admin bu logu görüntüleyebiliyor mu?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm audit log dosyalarını tara:

```bash
# Audit modülü varsa:
grep -rn ": any\|as any\|<any>\| any[,;)\s]\|Mixed" \
  apps/backend/src/modules/audit/ \
  --include="*.ts" 2>/dev/null

# Tüm sistemdeki audit log schema'ları:
grep -rn ": any\|Mixed\|Record.*any\|details.*any" \
  apps/backend/src/ \
  --include="*.schema.ts" \
  | grep -i "audit\|log\|history" | head -20
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| ecosystemAuditLog.schema.ts | ? | `details: Mixed` | YÜKSEK | `Record<string, unknown>` |
| ecosystemAuditLog.schema.ts | ? | `action: string` | ORTA | `EcosystemAuditAction` enum |

Risk seviyeleri:
- `YÜKSEK`: `details: Mixed` — `any` ile eşdeğer, runtime'da beklenmeyen yapı
- `ORTA`: `action: string` — yanlış string yazılabilir, sorgu tutarsızlığı
- `DÜŞÜK`: Display-only field, cascade yok

**Adım 3:** `EcosystemAuditLog.action` enum dönüşümü:

```typescript
// Mevcut (kötü):
action: string;

// Doğru:
export const ECOSYSTEM_AUDIT_ACTIONS = [
  'ECOSYSTEM_CREATED',
  'ECOSYSTEM_UPDATED',
  'ECOSYSTEM_DEACTIVATED',
  'MEMBER_ADDED',
  'MEMBER_REMOVED',
  'SETTINGS_UPDATED',
  'TRUST_SCORE_OVERRIDDEN',
  'LISTING_VISIBILITY_CHANGED',
] as const;

export type EcosystemAuditAction = typeof ECOSYSTEM_AUDIT_ACTIONS[number];
```

**Adım 4:** `details: Mixed` → discriminated union dönüşümü:

```typescript
// Her action için farklı details yapısı:
type EcosystemAuditDetails =
  | { action: 'MEMBER_ADDED'; memberVendorId: string; memberCompanyName: string }
  | { action: 'MEMBER_REMOVED'; memberVendorId: string; reason?: string }
  | { action: 'SETTINGS_UPDATED'; changedFields: string[]; previousValues: Record<string, unknown> }
  | { action: 'TRUST_SCORE_OVERRIDDEN'; previousScore: number; newScore: number; adminId: string }
  | { action: 'ECOSYSTEM_CREATED'; ownerVendorId: string; initialSettings: Record<string, unknown> };
```

**Adım 5:** Tüm sistemdeki audit log'ların `action` field tutarlılığı:

```bash
grep -rn "severity.*INFO\|severity.*WARN\|severity.*HIGH\|severity.*CRITICAL\|severity:.*'INFO'\|severity:.*'HIGH'" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\."
```

- Severity değerleri tutarlı mı? (INFO/WARN/HIGH/CRITICAL vs info/warning/high/critical)
- Ortak bir `AuditSeverity` enum'u var mı?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Severity belirleme dallanması:**
```typescript
// Kötü — her handler'da inline:
if (action === 'MEMBER_REMOVED') { severity = 'HIGH'; }
else if (action === 'SETTINGS_UPDATED') { severity = 'WARN'; }
else { severity = 'INFO'; }

// → Merkezi severity policy:
const ECOSYSTEM_ACTION_SEVERITY: Record<EcosystemAuditAction, AuditSeverity> = {
  ECOSYSTEM_CREATED:        'HIGH',
  MEMBER_ADDED:             'HIGH',
  MEMBER_REMOVED:           'HIGH',
  SETTINGS_UPDATED:         'WARN',
  TRUST_SCORE_OVERRIDDEN:   'CRITICAL',
  LISTING_VISIBILITY_CHANGED: 'INFO',
};
```

**Pattern B — Admin vs vendor log erişim dallanması:**
```typescript
// Kötü:
if (user.role === 'ADMIN') {
  // tüm loglar
} else if (user.role === 'VENDOR') {
  // sadece kendi ekosisteminin logları
} else {
  throw ForbiddenException
}
// → Guard + query filter kombinasyonu
```

**Pattern C — Log filtreleme:**
```typescript
// Admin log filtreleme endpoint'inde:
if (query.severity) {
  filter.severity = query.severity;
}
if (query.action) {
  filter.action = query.action;
}
if (query.ecosystemId) {
  filter.ecosystemId = query.ecosystemId;
}
// → FilterBuilder pattern ile yönetilebilir yapı
```

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Audit log yazımının ana akışı engellemesi:**
```typescript
// Kötü — handler'da:
await this.ecosystemRepo.create(ecosystem);
await this.auditLogRepo.create({   // await — başarısız olursa exception
  action: 'ECOSYSTEM_CREATED',
  severity: 'HIGH',
  details: { ... }
});

// Doğru — fire-and-forget (audit log ana işlemi etkilememeli):
await this.ecosystemRepo.create(ecosystem);
this.auditLogRepo.create({ ... })
  .catch(err => this.logger.error('Audit log yazılamadı', { err, action: 'ECOSYSTEM_CREATED' }));
```

**Antipattern B — Audit log olmadan kritik eylem:**
```typescript
// Kritik eylemler audit log olmadan geçebilir mi?
// Admin bir kullanıcının rolünü değiştirdi → audit log var mı?
// Vendor SUSPENDED yapıldı → audit log var mı?
// Escrow funds released → audit log var mı?

// Kontrol et:
grep -rn "role.*change\|SUSPENDED\|releaseFunds\|ADMIN.*update\|admin.*vendor" \
  apps/backend/src/ --include="*.ts" \
  | grep -v "\.spec\." \
  | while read line; do
    file=$(echo $line | cut -d: -f1)
    # Bu handler'da auditLog.create veya auditLog bulunuyor mu?
  done
```

**Antipattern C — Audit log'da before/after state eksikliği:**
```typescript
// Kötü — settings güncellemede:
await ecosystemRepo.update(id, { isBlindPool: newValue });
await auditLogRepo.create({
  action: 'SETTINGS_UPDATED',
  severity: 'WARN',
  // details: ne değişti? önceki değer ne?
});

// Doğru:
const before = await ecosystemRepo.findById(id);
await ecosystemRepo.update(id, dto);
await auditLogRepo.create({
  action: 'SETTINGS_UPDATED',
  severity: 'WARN',
  details: {
    changedFields: Object.keys(dto),
    previousValues: {
      isBlindPool: before.isBlindPool,
      internalCommRate: before.internalCommRate.toString(),
    },
    newValues: dto,
  }
});
```

**Antipattern D — Audit log immutability ihlali:**
```typescript
// Audit log koleksiyonunda UPDATE veya DELETE endpoint'i var mı?
// Olmamalı — audit loglar değiştirilemez

grep -rn "auditLog.*update\|auditLog.*delete\|AuditLog.*updateOne\|AuditLog.*deleteOne" \
  apps/backend/src/ --include="*.ts"
```

**3.3 Kritik eylem → audit log eşleşme analizi:**

```
Şu eylemlerin her biri için audit log yazılıyor mu?
(Audit log olmayan kritik eylem = güvenlik açığı)

İdentity:
  □ Başarılı login → LoginHistory ✓/?
  □ Başarısız login (brute-force tespiti için) → LoginHistory ✓/?
  □ Şifre değişikliği → audit var mı?
  □ Admin rol değişikliği → audit var mı?

Vendor:
  □ Vendor onayı (APPROVED) → audit var mı?
  □ Vendor reddi (REJECTED) → audit var mı?
  □ Vendor askıya alma (SUSPENDED) → audit var mı?
  □ IBAN değişikliği → audit var mı?

Financial:
  □ Wallet para yükleme → audit var mı?
  □ Para çekme talebi → audit var mı?
  □ Escrow hold/release/refund → audit var mı?

Admin:
  □ Admin kullanıcı silme → audit var mı?
  □ Manuel XP ekleme/çıkarma → audit var mı?
  □ TrustScore override → audit var mı? (EcosystemAuditLog'da CRITICAL olarak var)
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead log koleksiyonları:**

```bash
# VendorAuditLog'a gerçekten yazılıyor mu?
grep -rn "VendorAuditLog\|vendorAuditLog\|vendor_audit_logs" \
  apps/backend/src/ --include="*.ts" | grep -v "schema\|module"

# PlatinumMissionLog'a yazılıyor mu?
grep -rn "PlatinumMissionLog\|platinumMission" \
  apps/backend/src/ --include="*.ts" | grep -v "schema\|module"
```

Her koleksiyon için: sadece schema var mı, yoksa gerçekten kullanılıyor mu?

**4.2 Merkezi audit log servisi olmalı mı?**

Şu an her modül kendi log mekanizmasını implement etmiş. Bu yaklaşımın avantaj ve dezavantajlarını değerlendir:

```
Dağıtık yaklaşım (mevcut):
  (+) Her modül bağımsız
  (+) Farklı log yapıları mümkün
  (-) Tutarsız format (action string vs enum)
  (-) Tutarsız severity
  (-) Duplicate kod (her modülde benzer log yazımı)
  (-) Admin'e "tüm sistem loglarını göster" zor

Merkezi yaklaşım:
  (+) Tek format, tek sorgu arayüzü
  (+) Cross-cutting concern olarak interceptor'dan yazılabilir
  (-) Büyük değişiklik
  (-) Her modülün log ihtiyacı farklı

Hibrit öneri: Shared AuditLogService + modül bazlı adapter
```

Bu değerlendirmeyi koddan kanıtla — ne kadar duplicate var?

```bash
grep -rn "auditLog.*create\|AuditLog.*create\|\.create.*action.*severity" \
  apps/backend/src/ --include="*.ts" | grep -v "\.spec\." | wc -l
```

**4.3 `EcosystemAuditLog` TTL index analizi:**

```
Audit loglar sonsuza saklansın mı?
  □ TTL index var mı? (örn: 1 yıl sonra otomatik sil)
  □ Yoksa: büyüme trendi: 100 ekosistem × 1000 eylem/yıl = 100.000 kayıt/yıl
  □ Arşivleme stratejisi var mı?

BatchMatchLog için:
  □ Her gece batch → yıllık 365 log → yönetilebilir
  □ TTL gerekli mi?
```

**4.4 Admin audit log endpoint'leri:**

```bash
grep -rn "audit.*controller\|GET.*audit\|admin.*audit\|audit.*admin" \
  apps/backend/src/ --include="*.ts" | grep -v "\.spec\."
```

- Admin `GET /admin/audit-logs` endpoint'i var mı?
- Filtreleme var mı (tarih, severity, entityType)?
- Pagination var mı?
- Export (CSV/JSON) var mı?

**4.5 Audit log modül bağımlılık döngüsü:**

Eğer merkezi `AuditLogService` varsa:
- Hangi modüller bu servisi inject ediyor?
- Circular dependency riski: `AuditLogService` → diğer modüle → `AuditLogService`?
- Çözüm: `AuditLogService` hiçbir domain servisine bağımlı olmamalı (sadece MongoDB modeli)

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/.../file.ts:satır`
**Tespit:** [Ne buldun]
**Risk:** KRİTİK / YÜKSEK / ORTA / DÜŞÜK
**Sorun:** [Neden sorun — tek cümle]

**Düzeltme:**
```typescript
// Tam, çalışır, copy-paste edilebilir kod
```

**Cascade etkisi:** [Bu değişiklik başka neyi etkiler]
```

---

## Önceliklendirme

1. **KRİTİK** — Audit log immutability ihlali (update/delete endpoint'i varsa), kritik eylemlerde audit log eksikliği (admin rol değişikliği, wallet transfer, vendor suspend), başarısız login'in loglanmaması (brute-force tespiti imkânsız)
2. **YÜKSEK** — `action: string` tip güvensizliği (yanlış action değeri sessizce yazılır), `details: Mixed` → `any` (runtime'da beklenmeyen yapı), before/after state eksikliği (ne değişti bilinmiyor)
3. **ORTA** — Audit log ana akışı bloke ediyor (fire-and-forget değil), `VendorAuditLog` dead model, severity enum tutarsızlığı, TTL index eksikliği
4. **DÜŞÜK** — Merkezi vs dağıtık değerlendirme (büyük refactor), admin export endpoint eksikliği, duplicate log yazım kodu

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **Dağıtık audit log mimarisini tamamen merkezi yapıya taşıma** — büyük refactor, sadece değerlendirme yap
- **Severity seviyeleri (INFO/WARN/HIGH/CRITICAL)** — iş kararı
- **Audit log saklama süresi** — hukuki/iş kararı (KVKK kapsamında değerlendirme gerekebilir)
- **`EcosystemAuditLog` mevcut index'leri** — çalışıyor, bozma

---

## Son Not

Audit modülünde üç katmanlı sorun var:

**Format tutarsızlığı** — EcosystemAuditLog `severity: 'HIGH'` kullanırken başka bir modül `severity: 'high'` veya `severity: 2` yazıyorsa, admin "tüm HIGH severity logları göster" sorgusunu yapamaz. `string` yerine enum, bu riski sıfırlar.

**Kritik eylemler kör nokta** — Admin bir kullanıcının rolünü ADMIN yaptı. Bu eylem audit'te yok. 6 ay sonra "kim bu admin yetkisini ne zaman verdi?" sorusunun yanıtı yok. Finansal ve güvenlik audit'i için bu kabul edilemez.

**Başarısız login loglanmıyor** — Bir kullanıcı hesabına 100 yanlış şifre denemesi yapıldı. LoginHistory kayıt tutmuyorsa brute-force tespiti imkânsız. Rate limiting tek katman olarak yetersiz.

Bu üçü önce raporla.
