# Loyalty Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Loyalty modülü sistemin en karmaşık iş kurallarını barındırıyor — ama bu karmaşıklık teknik değil, kavramsal: **üç ayrı tier sistemi** aynı anda çalışıyor ve bunları birbirinden ayırt etmek kritik.

Seed dosyaları çalışıyor, admin paneli tamamlandı. Şimdi geri dönüp iş kurallarının gerçekten doğru implement edilip edilmediğini, tip güvensizliklerini ve dead code'u tespit edeceksin.

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/loyalty/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · Redis  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (XP 1 ₺ = 1 XP — bu dönüşüm kritik, number yasak)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**Mongoose modelleri (11 adet):**  
`MembershipTier`, `UserLevel`, `LoyaltyTierHistory`, `XpTransaction`, `XpBatch`, `XpDistributionRule`, `XpSpendingLimitRule`, `Mission`, `UserMission`, `MilestoneTracker`, `PlatinumMissionLog`

**Admin endpoint'leri (çalışıyor):**
```
GET  /admin/tiers                         → B2B tier konfigürasyonları
POST /admin/tiers                         → Tier konfigürasyonu oluştur/güncelle
DELETE /admin/tiers/cache                 → Redis önbelleği temizle
GET  /admin/users/loyalty                 → Kullanıcı XP + loyalty tier listesi
PATCH /admin/users/:id/xp                 → Manuel XP ekleme
GET/POST/PUT /admin/loyalty/distribution-rules → XP dağıtım kuralları CRUD
POST/PUT /admin/loyalty/spending-rules    → Harcama limiti CRUD
```

**Seed durumu:**
```bash
seed-tier-benefits-mongo.js      # 4 B2B tier (VendorTier)
seed-user-loyalty-tiers-mongo.js # 5 loyalty tier + user_level kayıtları
```

---

## Loyalty İş Kuralları — ÜÇ AYRI TİER SİSTEMİ

Bu modülün anlaşılması gereken en kritik noktası: **üç farklı tier sistemi** var ve bunlar birbirinden bağımsız çalışıyor.

```
┌─────────────────────────────────────────────────────────────┐
│ Sistem         │ Değerler              │ Koleksiyon          │
├─────────────────────────────────────────────────────────────┤
│ VendorTier     │ CORE/PRIME/ELITE/APEX │ tier_benefits       │
│                │ B2B komisyon/limit    │ (TicariTakas için)  │
├─────────────────────────────────────────────────────────────┤
│ LoyaltyTier    │ BRONZE → DIAMOND      │ membership_tiers    │
│                │ XP tabanlı sadakat    │ (B2C kullanıcı)     │
├─────────────────────────────────────────────────────────────┤
│ SubscriptionTier│ BRONZE_P1 → DIAMOND_P2│ user_subscriptions │
│                 │ B2C ücretli abonelik  │ (GO menü sistemi)  │
└─────────────────────────────────────────────────────────────┘
```

**Hangi tier nerede kullanılıyor:**
- `VendorTier` → `TierRateLimitGuard` (API rate limit), TicariTakas komisyon, BarterBorsa ekosistem erişimi
- `LoyaltyTier` → XP tabanlı ilerleme, Mission/Milestone, kullanıcı seviye gösterimi
- `SubscriptionTier` → BazarX-GO menü hakkı, kategori erişimi, referral bonus hesabı

---

## XP Ekonomisi İş Kuralları

### XP Kazanım Tablosu

```
Profil tamamlama:              5 XP  (tek seferlik)
Instagram/Facebook paylaşım:  10 XP  (aylık 1 kez)
QR menü kullanımı:             5 XP  (her kullanımda)
Referans — üye başına:        20 XP  (maks. 3 kişi)
Referans alan yeni üye:       10 XP  (tek seferlik, karşılama)
Aylık harcama %110+ aşma:     15 XP  (aylık 1 kez)
```

### XP Harcama Kuralları (B2C — iki limit birlikte geçerli)

```
Tier yükseltme:  aidat farkının maks. %50'si XP ile ödenebilir (1 XP = 1 ₺)
Sistem ödeme:    menü ödemesinin maks. %20'si XP ile ödenebilir
→ Her iki limit aynı anda uygulanır — ikisi de geçilmemeli
```

### XP Harcama Kuralları (B2B — TicariTakas 50/25/25)

```
Komisyon sübvansiyonu: maks. %50 (kalan %50 her zaman nakit)
Reklam/ilan:           maks. %25 (6 ay kullanılmazsa silinir)
Havuz peşinatı:        maks. %25 (her işlemde kota tutarının maks. %30'u)
→ XP indirimi + grup içi oran aynı işlemde birlikte uygulanamaz
```

### XP Erime (Decay)

```
6 ay geçerlilik
Kullanılmayan XP her ay %10 erir
→ 6 ayın sonunda kalan: 0.9^6 ≈ %53 korunur
→ Erime cron job (aylık): hangi XP'ler hangi tarihte erir?
```

### İlk İşlem Kuralı

```
Sisteme ilk girişte XP kazanımı ve kullanımı KAPALI
→ Ne zaman açılıyor? Ne tetikler?
→ UserLevel.firstTransactionCompleted flag'i mi?
```

### Tier Yükseltme (§2.7 — iki koşul aynı anda)

```
Koşul 1 — Ciro eşiği:
  Son 1 ayda platform harcaması >= mevcut tier aidatı × 5
  (Aidat ödemesi ve XP harcamaları DAHIL DEĞİL)

Koşul 2 — Ödeme yapısı:
  Aidat farkının min. %50'si nakit
  Kalan maks. %50'si XP (1 XP = 1 ₺)

Örnek: Bronz P1 → P2
  Min. ciro: 199 × 5 = 995 ₺
  Aidat farkı: 200 ₺
  Min. nakit: 100 ₺
  Maks. XP: 100 XP
```

### Mission (Görev) ve Milestone

```
Mission: Kullanıcının tamamlaması gereken görevler
  → completion condition: ne tetikler?
  → reward: XP miktarı + ödül tipi
  → repeatable: tekrarlanabilir mi?

UserMission: Kullanıcı × Mission ilişkisi (progress tracking)

MilestoneTracker: Milestone ilerleme takibi
  → Milestone = birden fazla mission'ın tamamlanması

PlatinumMissionLog: Özel platinum görev kayıtları
  → Bu nedir? Hangi kural geçerli?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Üç tier sisteminin çakışma noktaları:**

- `VendorTier` (CORE/PRIME/ELITE/APEX) ve `LoyaltyTier` (BRONZE→DIAMOND) aynı kullanıcı için aynı anda tutulabiliyor mu?
- `TierRateLimitGuard` hangi tier'ı okuyor? `VendorTier` mi, `LoyaltyTier` mi? Yanlış tier okunursa rate limit yanlış uygulanır.
- `SubscriptionTier` (BRONZE_P1 → DIAMOND_P2) `LoyaltyTier` ile senkron mu? Bir kullanıcı Gümüş P1 abonesi ama LoyaltyTier'da BRONZE'da kalabilir mi?
- Her tier için ayrı bir koleksiyon var — bunlar arasında foreign key tutarlılığı var mı? (Örn: `UserLevel.tierId` → `MembershipTier._id`)

**1.2 XP dağıtım event akışı:**

XP kazanımı event-driven mı, doğrudan handler'dan mı yazılıyor?

```
Kontrol listesi:
  □ QR tarama → XP yazılması: redeem-menu handler'ından mı, event consumer'dan mı?
  □ Referans tamamlama → 20 XP: referral handler'ından mı tetikleniyor?
  □ Aylık harcama eşiği → 15 XP: ne zaman hesaplanıyor, @Cron mu, gerçek zamanlı mı?
  □ XpDistributionRule koleksiyonu kullanılıyor mu?
    Yoksa kazanım miktarları hard-code mu?
  □ XpBatch: bu nedir? Toplu XP dağıtımı mı? Nerede kullanılıyor?
```

**1.3 İlk işlem kuralı implementasyonu:**

"İlk işlemde XP kazanımı ve kullanımı kapalı" — bu kural nerede enforce ediliyor?

```
  □ UserLevel.firstTransactionCompleted field'ı var mı?
  □ XP yazma handler'larında bu flag kontrolü var mı?
  □ XP harcama handler'larında bu flag kontrolü var mı?
  □ "İlk işlem" nedir? İlk sipariş mi? İlk menü kullanımı mı?
  □ Flag ne zaman true yapılıyor? Kim tetikliyor?
```

**1.4 XP erime (decay) scheduler:**

"Kullanılmayan XP her ay %10 erir" — bu hesaplama nasıl yapılıyor?

```
  □ @Cron aylık scheduler var mı? Nerede?
  □ "Kullanılmayan" tanımı ne? 30 günde işlem görmemiş XP mi?
  □ Hangi XP'ler erir, hangileri erimez?
    (Harcanan XP erimiyor, sadece bakiyedeki mi?)
  □ Erime atomic mi? (binlerce kullanıcı aynı anda update → MongoDB bulk write mi?)
  □ Erime işlemi XpTransaction'a yazılıyor mu? (audit trail)
  □ Multi-instance'da çift erime riski var mı? (Redis lock var mı?)
```

**1.5 Tier yükseltme akışı:**

```
  □ "Son 1 ayda platform harcaması" hesabı nerede yapılıyor?
    - Order koleksiyonundan aggregate mi?
    - Ayrı bir harcama tracker'ı var mı?
    - Aidat ödemesi ve XP harcamaları doğru hariç tutuluyor mu?
  □ Tier yükseltme işlemi atomik mi?
    (Ciro kontrolü + ödeme alma + tier güncelleme aynı session'da mı?)
  □ LoyaltyTierHistory nerede yazılıyor? Yükseltme sonrası mı, önce mi?
  □ Tier düşme (downgrade) var mı? Hangi koşulda?
```

**1.6 Modül bağımlılık grafiği:**

- `loyalty.module.ts` hangi modüllere bağımlı?
- `commerce.module.ts` loyalty'den ne kullanıyor? (XP yazma için)
- `menu/go.module.ts` loyalty'den ne kullanıyor? (QR sonrası XP)
- `barter.module.ts` loyalty'den ne kullanıyor? (B2B XP 50/25/25)
- Cross-module XP yazımı nasıl yapılıyor? Event mi, doğrudan inject mi?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm loyalty klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/loyalty/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| xp-distribution.service.ts | ? | `rule: any` | YÜKSEK | `XpDistributionRule` |
| mission.handler.ts | ? | `reward: any` | ORTA | `MissionReward` |

Risk seviyeleri:
- `KRİTİK`: XP miktarı `any` → sayısal tip karışıklığı, hatalı miktarda XP yazılabilir
- `YÜKSEK`: Tier eşiği `any` → yanlış tier yükseltmesine yol açar
- `ORTA`: Mission reward `any` → ödül tipi bilinmez, yanlış ödül verilir
- `DÜŞÜK`: Admin display, cascade yok

**Adım 3:** XP miktarı tip güvensizliği — en kritik nokta:

XP miktarı her zaman pozitif tam sayı olmalı. `any` veya `number` kullanımı hatalı miktara yol açar:

```typescript
// Doğru tipler:
interface XpAmount {
  amount: number;              // pozitif tam sayı, negatif olamaz
  reason: XpEarnReason | XpSpendReason;
  userId: Types.ObjectId;
  relatedEntityId?: Types.ObjectId;
  relatedEntityType?: 'ORDER' | 'QR_REDEMPTION' | 'REFERRAL' | 'MISSION' | 'MANUAL';
}

type XpEarnReason =
  | 'PROFILE_COMPLETE'
  | 'SOCIAL_SHARE'
  | 'QR_REDEMPTION'
  | 'REFERRAL_GIVEN'
  | 'REFERRAL_RECEIVED'
  | 'MONTHLY_SPEND_TARGET'
  | 'MISSION_COMPLETE'
  | 'MANUAL_ADMIN';

type XpSpendReason =
  | 'TIER_UPGRADE'
  | 'MENU_PAYMENT'
  | 'B2B_COMMISSION'
  | 'B2B_ADVERTISEMENT'
  | 'B2B_POOL_DEPOSIT'
  | 'MANUAL_ADMIN';
```

**Adım 4:** `XpDistributionRule` ve `XpSpendingLimitRule` şema tipleri:

Bu kurallar admin'den konfigüre edilebilir. Schema'nın typed olması kritik:

```typescript
interface XpDistributionRuleDocument {
  event: XpEarnReason;
  amount: number;              // sabit miktar mı?
  amountType: 'FIXED' | 'PERCENTAGE'; // yoksa yüzde mi?
  percentageBase?: 'ORDER_AMOUNT' | 'AIDAT';
  maxAmount?: number;          // üst limit
  cooldownHours?: number;      // aylık 1 kez → 720 saat cooldown
  isActive: boolean;
  validFrom?: Date;
  validTo?: Date;
}

interface XpSpendingLimitRuleDocument {
  context: 'TIER_UPGRADE' | 'MENU_PAYMENT' | 'B2B_COMMISSION' | 'B2B_ADVERTISEMENT' | 'B2B_POOL';
  maxPercentage: number;       // %50, %20, %25 gibi
  minCashPercentage?: number;  // nakit zorunlu minimum
  cannotCombineWith?: string[];// birleştirilemeyecek diğer context'ler
}
```

Bu şemalar mevcut mu? `any` ile mi tanımlı?

**Adım 5:** `MilestoneTracker` ve `PlatinumMissionLog` tipleri:

```typescript
interface MilestoneTrackerDocument {
  userId: Types.ObjectId;
  milestoneId: Types.ObjectId;
  completedMissions: Types.ObjectId[];   // hangi mission'lar tamamlandı
  totalRequired: number;
  completedCount: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardClaimed: boolean;
}
```

Bu yapı tipli mi yoksa `any` mi?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Tier sistemleri arası dallanma:**
```typescript
// Kötü — tek handler'da üç tier:
if (context === 'B2B') {
  // VendorTier kuralları
} else if (context === 'B2C_SUBSCRIPTION') {
  // SubscriptionTier kuralları
} else {
  // LoyaltyTier kuralları
}
// → Her tier için ayrı servis: XpB2CService, XpB2BService, XpLoyaltyService
```

**Pattern B — XP harcama limit dallanması:**
```typescript
// Kötü — inline koşullar:
if (spendReason === 'TIER_UPGRADE' && xpAmount > aidatFarki * 0.5) { throw ... }
if (spendReason === 'MENU_PAYMENT' && xpAmount > menuPrice * 0.2) { throw ... }
// → XpSpendingLimitRule koleksiyonundan dinamik kurallar okunuyor mu?
// Yoksa hard-code mu?
```

**Pattern C — İlk işlem kuralı dallanması:**
```typescript
// Kötü — her handler'da:
if (!user.firstTransactionCompleted) {
  // XP yazmayı atla
  return;
}
// → XpGuard veya interceptor ile tek noktadan kontrol nasıl yapılır?
```

**Pattern D — XP erime hesabı:**
```typescript
// Kötü — her kullanıcı için ayrı:
for (const user of allUsers) {
  const decayAmount = Math.floor(user.xpBalance * 0.1);
  await user.updateOne({ $inc: { xpBalance: -decayAmount } });
}
// → MongoDB bulk write ile nasıl yapılmalı?
// Erime kaydı XpTransaction'a nasıl yazılmalı?
```

**Pattern E — Mission completion kontrolü:**
```typescript
// Kötü — mission tipleri için:
if (mission.type === 'ONE_TIME' && userMission.completedCount > 0) {
  return; // zaten tamamlandı
} else if (mission.type === 'DAILY' && completedToday) {
  return;
} else if (mission.type === 'MONTHLY' && completedThisMonth) {
  return;
}
// → Mission entity'sinde isCompletable() metodu olmalı
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — XP yazımında sessiz hata (YÜKSEK):**
```typescript
// Kötü — QR tarama sonrası:
try {
  await this.xpService.earnXp(userId, 5, 'QR_REDEMPTION');
} catch {
  // XP verilmedi ama QR taraması başarılı — kullanıcı haksız kayıp
}
// Doğru: XP başarısız olursa retry queue'ya ekle, kritik değilse log + devam et
```

**Antipattern B — XP harcama ve tier yükseltme ayrı transaction:**
```typescript
// Kötü:
await this.xpService.spendXp(userId, xpAmount); // XP düştü
await this.tierService.upgradeTier(userId, newTier); // başarısız olursa?
// → XP harcandı ama tier yükselmedi
// Doğru: aynı Mongoose session'da
```

**Antipattern C — Aylık erime'de race condition:**
```typescript
// Kötü — @Cron aylık, multi-instance:
@Cron('0 0 1 * *') // her ayın 1'i
async decayXp() {
  const users = await UserLevel.find({ xpBalance: { $gt: 0 } });
  // 10.000 kullanıcı × bireysel update → yavaş + her instance çalışır
}
// Doğru: Redis distributed lock + MongoDB bulkWrite
```

**Antipattern D — Mission completion idempotency:**
```typescript
// Kötü:
const userMission = await UserMission.findOne({ userId, missionId });
if (!userMission.isCompleted) {
  await UserMission.updateOne({ _id: id }, { isCompleted: true });
  await this.grantMissionReward(userId, mission.reward);
}
// Race condition: iki eş zamanlı event ikisi de "isCompleted: false" görür
// Doğru: findOneAndUpdate atomic
```

**Antipattern E — XpBatch kullanımı:**
```typescript
// XpBatch nedir ve nasıl kullanılıyor?
// Toplu XP dağıtımı için mi?
// Her batch işlemi idempotent mi? (aynı batch iki kez çalışırsa?)
// BatchId ile tekrar çalışmayı önlüyor mu?
```

**3.3 XP erime doğruluğu:**

```
"Her ay %10 erir" kuralını analiz et:

1. Erime hangi XP'lere uygulanıyor?
   - Tüm bakiye mi? (Yanlış: yeni kazanılan da eriyor mu?)
   - Son 6 ayda işlem görmeyenler mi?
   - XP'nin "yaşı" takip ediliyor mu? (XpTransaction.createdAt bazlı)

2. Erime miktarı nasıl hesaplanıyor?
   - Math.floor(balance * 0.1) mi? (Kesirli XP problemi)
   - Decimal hesap mı?

3. Erime 6 ay kuralıyla tutarlı mı?
   %10 × 6 ay = %46 eriyor, %54 kalıyor — bu 6 ay sonra tamamen silme değil.
   Master Plan "6 ay geçerlilik" diyor. Bu çelişki mi?
```

**3.4 B2B vs B2C XP kural ayrımı:**

```
B2C: tier yükseltme %50 + menü ödeme %20
B2B (TicariTakas): komisyon %50 + reklam %25 + peşinat %25

Bu iki kural seti aynı `XpSpendingLimitRule` koleksiyonunda mı?
Yoksa ayrı bir B2B kurallar tablosu var mı?
Bir kullanıcı hem B2C hem B2B kullanıyorsa XP bakiyesi ortak mu, ayrı mı?
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead model tespiti:**

11 Mongoose model var. Her birinin yazıldığı ve okunduğu yeri kontrol et:

```bash
for model in XpBatch PlatinumMissionLog LoyaltyTierHistory MilestoneTracker; do
  echo "=== $model ==="
  grep -rn "$model" apps/backend/src/ --include="*.ts" | grep -v "schema\|module" | wc -l
done
```

Özellikle:
- `XpBatch`: toplu dağıtım için mi? Nerede kullanılıyor? Handler var mı?
- `PlatinumMissionLog`: Platinum mission nedir? Hangi iş kuralı geçerli? Başka yerde referans var mı?
- `LoyaltyTierHistory`: Tier yükseltme anında yazılıyor mu gerçekten?

**4.2 XP kazanım noktaları tam listesi:**

```bash
grep -rn "earnXp\|xpService.earn\|XP.*earn\|earn.*XP\|addXp\|xpBalance.*\$inc" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v loyalty | grep -v spec
```

Bu modüller dışından XP yazılıyor mu? Her birinin event-driven mi yoksa doğrudan servis inject mi kullandığını tespit et.

**4.3 Duplicate XP limit kontrolü:**

XP harcama limiti kontrolü birden fazla yerde mi yapılıyor?

```bash
grep -rn "spendingLimit\|xpLimit\|maxXp\|XP.*%50\|XP.*%20\|XP.*%25\|50.*percent.*xp\|xp.*50.*percent" \
  apps/backend/src/ \
  --include="*.ts"
```

Her duplicate için: `XpSpendingValidator` service'i nasıl extract edilir? Kodu yaz.

**4.4 Mission sistemi çalışıyor mu?**

```bash
grep -rn "Mission\|UserMission\|completeMission\|mission.*complete" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v schema | grep -v module
```

- Mission'lar tetikleniyor mu? Hangi event tetikliyor?
- `UserMission` oluşturuluyor mu? Admin'den mi, otomatik mi?
- Milestone'lar hesaplanıyor mu?
- `PlatinumMissionLog` hiç yazılıyor mu?

**4.5 Redis cache kullanımı:**

`DELETE /admin/tiers/cache` endpoint'i Redis önbelleği temizliyor.

```bash
grep -rn "redis\|Redis\|cache\|Cache" \
  apps/backend/src/modules/loyalty/ \
  --include="*.ts"
```

- Hangi veriler Redis'te cache'leniyor?
- Cache TTL'si ne kadar?
- Cache invalidation doğru mu? (Tier güncellendikten sonra otomatik invalidate oluyor mu?)
- `tier_benefits` koleksiyonu Redis'te cache'de mi? Günlük rate limit kontrolü için her request'te DB'ye mi gidiyor?

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/loyalty/path/to/file.ts:satır`
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

1. **KRİTİK** — İlk işlem kuralı her XP handler'da enforce edilmiyorsa (kullanıcı ilk işlemde XP kazanıyor), XP harcama ve tier yükseltme farklı transaction'da (XP harcandı tier yükselmedi), aylık erime multi-instance race condition
2. **YÜKSEK** — `XpDistributionRule` hard-code ise konfigürasyonu anlamsız, B2B ve B2C XP harcama kurallarının ayrımı kayıp, mission completion race condition
3. **ORTA** — Dead model tespiti (XpBatch, PlatinumMissionLog), erime formülünün "6 ay tamamen sil" ile çelişkisi, LoyaltyTier↔SubscriptionTier senkronizasyonu
4. **DÜŞÜK** — Redis cache TTL tutarlılığı, LoyaltyTierHistory eksik yazımları, XP kazanım event'lerinin doğrudan servis inject yerine event-driven yapılması

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **XP kazanım miktarları** (5/10/15/20 XP) — iş kararı
- **Harcama limitleri** (%50/%20/%25) — iş kararı
- **Erime oranı (%10/ay)** — iş kararı
- **3 ayrı tier sisteminin varlığı** — mimari karar, kaldırma önerme
- **Tier isimlendirme** (CORE/PRIME/ELITE/APEX ve BRONZE→DIAMOND) — iş kararı
- **Tier yükseltme koşulları** (5× ciro, %50 nakit) — iş kararı
- **`1 XP = 1 ₺` kuru** — iş kararı
- **Seed dosyaları** — doğruluklarını kontrol et ama değiştirme
- **Admin endpoint'leri** — CRUD çalışıyor, bozma

---

## Son Not

Loyalty modülünde üç bağımsız risk var:

**İlk işlem kuralı** — "İlk işlemde XP kapalı" — hangi handler bu kuralı uyguluyor, hangisi uygulamıyor? Uygulamayan handler'dan kullanıcı XP kazanıyorsa sistem tutarsızlaşır. Tüm XP yazan handler'ları tara.

**XP harcama + tier güncelleme farklı transaction** — XP düştü, tier yükselmedi → kullanıcı hem parasını hem tier'ını kaybetti. Refund akışı var mı?

**Aylık erime multi-instance** — Üretimde birden fazla backend instance çalışıyor (Nginx ip_hash var ama bu backend process sayısını kısıtlamıyor). Erime @Cron her instance'ta çalışırsa kullanıcı XP'si 2 kez eriyor. Redis distributed lock olmadan bu güvensiz.

Bu üçü önce raporla.
