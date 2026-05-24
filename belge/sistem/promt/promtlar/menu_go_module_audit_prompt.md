# Menu Modülü (BazarX-GO) — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Menu modülü geçmişte iki ayrı dünya olarak başladı: e-ticaret `Vendor → Listing → Cart → Order` ve restoran tarafı `Restaurant → BazarXMenu → MenuPurchase → QR Redemption`. GO Integration Plan (Faz 1-4) ile bu iki dünya birleştirildi: `Restaurant` ve `BazarXMenu` koleksiyonları DROP edildi, `MenuPurchase.menuId` → `listingId` olarak yeniden yazıldı, `LaunchPartner.restaurantId` → `vendorId` olarak güncellendi. Bu dönüşümün ardından ne kaldı, ne çalışıyor, ne eksik — kodu okuyarak öğreneceksin.

**Önemli bağlam — önceki sprint kararları:**

1. **İki QR tipi** kararlaştırıldı: Platform QR (sabit 45 gün) ve Anlık Fırsat QR (restoran belirler, 2 saat - 7 gün). `qrType: 'PLATFORM' | 'INSTANT_OPPORTUNITY'` field'ı `MenuPurchase` schema'sına eklenmeli.

2. **Referral bonus algoritması düzeltmesi**: Yuvarlama her zaman yukarı. `REFERRAL_TIER_MAP` sabiti ve `findTierByReferralTotal()` fonksiyonu `go/domain/constants/referral-bonus.constants.ts`'e yazılacak.

3. **Üyelik hediye kartı**: Üye olunca aidatın %50'si `GiftCard` olarak anında verilecek (erken iptal yerine).

4. **Kategori ↔ Tier preview**: Her tier bir üst kategoriden ayda 1 kez preview erişimi alacak.

Yukarıdaki kararlar implement edildi mi? Koda bakarak öğren. Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/go/` (veya `menu/` — gerçek klasör adını koddan öğren)

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · BullMQ  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (number yasak — menu fiyatları, aidat tutarları)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)
- Business logic: domain entity'de

**Mevcut handler'lar (GO Integration Plan Faz 2'de yazıldı):**
```
purchase-menu.handler.ts      → Listing'den menü satın alma, günlük limit kontrolü
redeem-menu.handler.ts        → QR tarama, tekil kullanım kontrolü
get-my-purchases.handler.ts   → Kullanıcının satın aldığı menüler
get-launch-partners.handler.ts → LaunchPartner listesi
advance-launch-partner-phase.handler.ts → Faz 1 → 2 → 3 geçişi
distribute-free-menu.handler.ts → 60 ücretsiz menü dağıtımı
```

**Mongoose modelleri:**
```
MenuPurchase      → Satın alınan menü + QR kodu
LaunchPartner     → Restoran anlaşması (3 faz)
(+ önceki sprint kararlarından: GiftCard, GoReservation varsa)
```

**Catalog/Listing bağlantısı:**
```
MenuPurchase.listingId → Listing (Listing = restoranın menü kaydı)
Listing.metadata.dailyLimit → günlük QR kota
```

---

## Menu / BazarX-GO İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Üyelik Aktivasyon Zaman Çizelgesi

```
Gün 1   → Üyelik satın alındı → GiftCard (aidatın %50'si) anında verildi
           MenuPurchase oluşabilir (satın alma var) ama QR kullanılamaz
Gün 15  → Bekleme süresi sona erdi
Gün 16  → Üyelik teyit: kuponlar açıldı, QR kullanılabilir
Gün 43  → "3 gün kaldı" push + mail uyarısı
Gün 44  → "1 gün kaldı" uyarı
Gün 45  → 23:59'da kuponlar yanar (burn)
```

**İki ayrı tarih alanı gerekiyor:**
```typescript
interface MenuPurchaseDocument {
  platformExpiresAt: Date;     // satın alma + 45 gün — sabit, değişmez
  activationDate: Date;        // satın alma + 15 gün — QR açılma tarihi
  // Kontrol: now >= activationDate && now <= platformExpiresAt → kullanılabilir
}
```

### Üç Menü Modu (Her Birinde Farklı Kural)

```
MOD 1 — Üyelik menü sistemi (2× hak):
  - Üyelik teyidi ZORUNLU
  - activationDate kontrolü VAR
  - platformExpiresAt = satın alma + 45 gün (sabit)
  - QR tipi: 'PLATFORM'

MOD 2 — Gel-Al fırsat menüsü:
  - Üyelik teyidi GEREKMİYOR (herkese açık)
  - Aktivasyon bekleme YOK
  - Restoran stok adeti dolunca otomatik kapanır
  - QR tipi: 'INSTANT_OPPORTUNITY' (restoran süre belirler, min 2 saat max 7 gün)
  - restaurantExpiresAt = restoran belirledi

MOD 3 — Devir alınan menü:
  - Üyelik teyidi GEREKMİYOR
  - Orijinal 45 günlük pencere korunur (platformExpiresAt değişmez)
  - Devir geri alınamaz
  - QR kodu yeni sahibe atanır (transferredTo field)
```

### QR Kod Teknik Kuralları

```
- Her QR: tek kullanımlık
- QR içeriği: tier + kategori + zaman penceresi (imzalı token)
- Tarama anında: QR status USED yapılır (atomic — race condition riski)
- Aynı QR iki kez taranırsa: ALREADY_REDEEMED hatası

İki tip ayrımı:
  PLATFORM QR:
    platformExpiresAt = satın alma + 45 gün (sabit — restoran değiştiremez)
    activationDate = satın alma + 15 gün
  
  INSTANT_OPPORTUNITY QR:
    restaurantExpiresAt = restoran belirledi (2 saat - 7 gün)
    Aktivasyon bekleme YOK
```

### Referral (Referans) Sistemi

```
İlk ay: 3 referans hakkı
Her yenileme: +1 hak
Kullanılmayan hak → ay sonunda yanar (biriktirme yok)

Bonus hesaplama (yuvarlama YUKARI):
  3 referansın toplam aidatı hesaplanır
  Bu toplama eşit veya büyük olan en düşük tier bulunur (yukarı yuvarlama)
  Bulunan tier'ın bir altındaki tier'dan 1 menü hakkı verilir

REFERRAL_TIER_MAP:
  BRONZ_P1: { minAidat: 0,    maxAidat: 398,  bonusTier: null }
  BRONZ_P2: { minAidat: 399,  maxAidat: 698,  bonusTier: 'BRONZ_P1' }
  GUMUS_P1: { minAidat: 699,  maxAidat: 998,  bonusTier: 'BRONZ_P2' }
  GUMUS_P2: { minAidat: 999,  maxAidat: 1498, bonusTier: 'GUMUS_P1' }
  ALTIN_P1: { minAidat: 1499, maxAidat: 1998, bonusTier: 'GUMUS_P2' }
  ALTIN_P2: { minAidat: 1999, maxAidat: 2998, bonusTier: 'ALTIN_P1' }
  ELMAS_P1: { minAidat: 2999, maxAidat: 4998, bonusTier: 'ALTIN_P2' }
  ELMAS_P2: { minAidat: 4999, maxAidat: ∞,    bonusTier: 'ELMAS_P1' }

Sınır değer örneği: 1.479 ₺ → Altın P1 (1.499'a yukarı) → Gümüş P2 menüsü
Bonus 45 gün içinde kullanılmazsa yanar
Bonus kullanılırken: 45. günde üyelik aktif mi kontrol edilir
```

### LaunchPartner (Lansman Ortağı) 3 Fazlı Süreç

```
Faz 1 (Ay 1): 60 menü taahhüdü → profil + ilan + sosyal medya tanıtımı
Faz 2 (Ay 2-3): reklam kampanyası + QR operasyon desteği
Faz 3 (Ay 4+): ücretli B2B üyeliğe geçiş daveti

advance-launch-partner-phase.handler.ts → faz geçişi
distribute-free-menu.handler.ts → 60 ücretsiz menüyü kullanıcılara dağıt

60 menü organik büyüme döngüsü:
  60 menü → kullanıcılara hediye → platform bağlılığı → ücretli üye
```

### Erken İptal (Önceki Sprint Kararı)

```
Eski kural: cezalı iptal (fark tahsil edilir)
Yeni kural: GiftCard modeli (aidatın %50'si hediye kart olarak verilir)
→ GiftCard anında ve otomatik oluşturulur (üyelik satın alınır alınmaz)
→ Platform içi tüm alışverişlerde kullanılabilir
→ Geçerlilik: üyelik bitişi + 30 gün
→ GiftCard iptal senaryoları:
    - 16. günden önce iptal + GiftCard kullanılmamış → iptal edilir
    - 16. günden önce iptal + GiftCard kullanılmış → kullanılan kadar kesilir
    - 16. günden sonra → iptal edilemez (hizmet sunuldu)
```

### Kategori ↔ Tier Eşleşmesi ve Preview

```
6 kategori (1=VIP Fine Dining... 6=Dondurma & Ekler)
Her tier kendi kategorisi + altındakilere TAM erişim
Bir üst kategoriye PREVIEW: ayda 1 kez, kota sınırlı

Tam erişim eşikleri:
  BRONZ_P1 → Kat 6 (Dondurma), preview: Kat 5
  BRONZ_P2 → Kat 5-6, preview: Kat 4
  GUMUS_P1 → Kat 4-5-6, preview: Kat 3
  GUMUS_P2 → Kat 3-4-5-6, preview: Kat 2
  ALTIN_P1 → Kat 2-3-4-5-6, preview: Kat 1
  ALTIN_P2 → Kat 2-3-4-5-6 (genişletilmiş)
  ELMAS_P1/P2 → Kat 1-2-3-4-5-6 (tümü)

Servis: CategoryAccessService
  checkAccess(userId, categoryLevel, userTier) → { mode: 'FULL'|'PREVIEW'|'DENIED' }
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Modül klasör adı ve yapısı:**

- Menu modülü hangi klasörde? `go/`? `menu/`? `bazarx-go/`?
- Handler'lar doğrudan `application/commands/` altında mı, yoksa alt klasörlerde mi organize edilmiş?
- `purchase-menu.handler.ts` `Listing` modelini nasıl alıyor? `catalog.module.ts`'ten export mı, doğrudan Mongoose model inject mi?
- `go.module.ts` (veya ne adı varsa) `catalog.module.ts`'i import ediyor mu?

**1.2 `purchase-menu.handler.ts` tam akış denetimi:**

```
Kontrol listesi:
  □ Tier ↔ Kategori erişim kontrolü yapılıyor mu?
    (Bronz P1 kullanıcı Kat 1 VIP menü satın alamaz)
  □ Günlük limit: Listing.metadata.dailyLimit nereden geliyor?
    Bu field Listing schema'sında var mı?
  □ QR kodu nasıl üretiliyor? UUID mi, imzalı token mı, başka mı?
  □ MenuPurchase oluşturulurken platformExpiresAt ve activationDate set ediliyor mu?
  □ qrType field'ı var mı ve doğru set ediliyor mu?
    PLATFORM mi INSTANT_OPPORTUNITY mu?
  □ GiftCard aynı anda oluşturuluyor mu (üyelik akışında)?
```

**1.3 `redeem-menu.handler.ts` atomic kontrolü:**

QR tarama en kritik nokta: iki eş zamanlı tarama tek kullanımlık QR'ı iki kez geçerli saymamalı.

```
Kontrol listesi:
  □ findOneAndUpdate kullanılıyor mu?
    { _id: qrId, status: 'ACTIVE' } → { $set: { status: 'USED', redeemedAt: new Date() } }
    → null dönerse ALREADY_REDEEMED
  □ Mongoose session'da mı? (transaction içinde mi?)
  □ platformExpiresAt kontrolü: now > platformExpiresAt → EXPIRED
  □ activationDate kontrolü: now < activationDate → NOT_YET_ACTIVE
  □ qrType farkı: INSTANT_OPPORTUNITY için restaurantExpiresAt kontrolü var mı?
  □ Restoran panelinden tarama mı, kullanıcı QR gösterimi mi?
    (Kimin taradığını takip ediyor mu?)
```

**1.4 Menü devir (transfer) akışı:**

```
  □ Devir handler var mı? (transfer-menu.handler.ts veya benzeri)
  □ Devir atomic mi?
    transferredTo set edilirken aynı QR başka birine devredilemiyor mu?
  □ Devir geri alınamaz kuralı enforce ediliyor mu?
  □ Devir alana üyelik teyidi yapılmıyor mu? (iş kuralı: gerekmez)
  □ Orijinal platformExpiresAt korunuyor mu?
```

**1.5 LaunchPartner faz geçişi:**

```
  □ advance-launch-partner-phase.handler.ts faz geçişinde koşul var mı?
    (Faz 1'den 2'ye geçmek için 60 menü taahhüdü tamamlandı mı?)
  □ distribute-free-menu.handler.ts 60 menüyü gerçekten dağıtıyor mu?
    Kime dağıtıyor? Nasıl kullanıcı seçiyor?
  □ Faz 3'te B2B üyeliğe geçiş daveti nasıl gidiyor? RabbitMQ event mi?
```

**1.6 Modül bağımlılık ve örtüşme:**

- `menu/go.module.ts` hangi modüllere bağımlı?
- `Listing` modeline nasıl erişiyor? (catalog modülünden export mı)
- `GiftCard` modeli `marketing` modülünde mi, `go` modülünde mi? Çakışma var mı?
- Referral sistemi `loyalty` modülüyle örtüşüyor mu?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm go/menu modülünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/go/ \
  apps/backend/src/modules/menu/ \
  --include="*.ts" 2>/dev/null \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

(Klasör adı bilinmiyorsa her ikisini de dene)

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| purchase-menu.handler.ts | ? | `listing: any` | KRİTİK | `ListingDocument` |
| redeem-menu.handler.ts | ? | `qrData: any` | KRİTİK | `QrTokenPayload` |

Risk seviyeleri:
- `KRİTİK`: QR payload `any` — geçersiz QR kabul edilebilir; fiyat `any` — ücretsiz menü gönderilmesi
- `YÜKSEK`: Referral bonus hesabında `any` — yanlış tier atanabilir
- `ORTA`: MenuPurchase response `any` — aktivasyon tarihleri yanlış gösterilir
- `DÜŞÜK`: İzole display, cascade yok

**Adım 3:** QR token yapısı tipli mi?

QR kodu üretirken ve doğrularken kullanılan payload:

```typescript
// QR token içeriği için doğru tip:
interface QrTokenPayload {
  menuPurchaseId: string;       // hangi satın alma
  listingId: string;            // hangi menü/restoran
  userId: string;               // sahibi (devir sonrası değişmez — orijinal sahip)
  currentHolderId: string;      // QR'ı elinde tutan (devir sonrası güncellenir)
  tier: string;                 // satın alma anındaki tier (snapshot)
  categoryLevel: number;        // 1-6
  qrType: 'PLATFORM' | 'INSTANT_OPPORTUNITY';
  platformExpiresAt: number;    // Unix timestamp
  activationDate: number;       // Unix timestamp
  restaurantExpiresAt?: number; // INSTANT_OPPORTUNITY için
  iat: number;
  sig: string;                  // imza (değiştirilemiyor olmalı)
}
```

Bu yapı mevcut mu? `any` ile mi parse ediliyor?

**Adım 4:** `REFERRAL_TIER_MAP` sabiti tipli mi?

```typescript
// Doğru tip:
type GoTierKey =
  | 'BRONZ_P1' | 'BRONZ_P2'
  | 'GUMUS_P1' | 'GUMUS_P2'
  | 'ALTIN_P1' | 'ALTIN_P2'
  | 'ELMAS_P1' | 'ELMAS_P2';

interface ReferralTierEntry {
  minAidat: number;
  maxAidat: number;
  bonusTier: GoTierKey | null;
}

// Sabit tanımlandıysa kontrol et:
// go/domain/constants/referral-bonus.constants.ts
```

**Adım 5:** `MenuPurchase` schema'sı tüm alanları kapsıyor mu?

```typescript
// Beklenen tam schema:
interface MenuPurchaseDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  listingId: Types.ObjectId;           // (eski menuId değil)
  
  qrType: 'PLATFORM' | 'INSTANT_OPPORTUNITY';
  qrCode: string;                      // imzalı token
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED' | 'TRANSFERRED';
  
  platformExpiresAt: Date;             // sabit 45 gün
  activationDate: Date;                // satın alma + 15 gün
  restaurantExpiresAt?: Date;          // INSTANT_OPPORTUNITY için
  
  transferredTo?: Types.ObjectId;      // devredilen kullanıcı
  transferredAt?: Date;
  
  redeemedAt?: Date;                   // tarandığı an
  redeemedByRestaurantId?: Types.ObjectId;
  
  garageSaleId?: Types.ObjectId;       // Garaj Günü kampanyasından mı?
  isGarageSale: boolean;
  
  purchasePrice: Types.Decimal128;     // satın alma fiyatı
  
  createdAt: Date;
  updatedAt: Date;
}
```

Eksik alan var mı? `any` ile doldurulmuş alan var mı?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — qrType dallanması:**
```typescript
// Kötü — redeem-menu.handler.ts'de:
if (purchase.qrType === 'PLATFORM') {
  if (now < purchase.activationDate) { throw ... }
  if (now > purchase.platformExpiresAt) { throw ... }
} else if (purchase.qrType === 'INSTANT_OPPORTUNITY') {
  if (now > purchase.restaurantExpiresAt) { throw ... }
}
// → QrValidator sınıfı ile nasıl extract edilir? Kodu yaz
```

**Pattern B — Tier ↔ Kategori erişim dallanması:**
```typescript
// Kötü — purchase-menu.handler.ts'de:
if (tier === 'BRONZ_P1' && categoryLevel > 6) { throw ... }
else if (tier === 'BRONZ_P2' && categoryLevel > 5) { throw ... }
// ... devam ediyor
// → CategoryAccessService.checkAccess() nasıl implement edilir?
// Kodu yaz:
const FULL_ACCESS_MAP: Record<GoTierKey, number> = {
  BRONZ_P1: 6, BRONZ_P2: 5, GUMUS_P1: 4, GUMUS_P2: 3,
  ALTIN_P1: 2, ALTIN_P2: 2, ELMAS_P1: 1, ELMAS_P2: 1,
};
```

**Pattern C — Menü modu dallanması (üyelik / Gel-Al / devir):**
```typescript
// purchase-menu handler'ında:
if (isPurchaseWithMembership) {
  // üyelik teyidi zorunlu
  // activationDate set edilir
} else if (isGelAl) {
  // üyelik teyidi yok
  // restaurantExpiresAt kullanılır
} else if (isTransfer) {
  // üyelik teyidi yok
  // platformExpiresAt korunur
}
// → Mod stratejileri nasıl ayrıştırılır? MenuPurchaseStrategy interface yaz
```

**Pattern D — Referral bonus hesabında yuvarlama:**
```typescript
// Kötü — inline hesaplama:
const total = ref1.aidat + ref2.aidat + ref3.aidat;
let matchedTier = null;
if (total <= 398) matchedTier = 'BRONZ_P1';
else if (total <= 698) matchedTier = 'BRONZ_P2';
// ...
// Doğru:
function findTierByReferralTotal(total: number): GoTierKey {
  const matched = REFERRAL_TIER_MAP.find(t => total <= t.maxAidat);
  return matched?.tier ?? 'ELMAS_P2';
  // Yukarı yuvarlama: 1.479 → Altın P1 (1.499'a kadar olan tier)
}
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — QR taramada race condition (KRİTİK):**
```typescript
// Kötü — iki adımlı:
const purchase = await MenuPurchase.findById(qrId);
if (purchase.status !== 'ACTIVE') throw ...;
await MenuPurchase.updateOne({ _id: qrId }, { status: 'USED' });
// → İki eş zamanlı tarama ikisi de 'ACTIVE' görür, ikisi de USED yapar

// Doğru — atomic findOneAndUpdate:
const updated = await MenuPurchase.findOneAndUpdate(
  { _id: qrId, status: 'ACTIVE' },
  { $set: { status: 'USED', redeemedAt: new Date() } },
  { new: true }
);
if (!updated) throw new ConflictException({ code: 'ALREADY_REDEEMED' });
```

**Antipattern B — Referral bonus yazımında sessiz hata:**
```typescript
// Kötü:
try {
  await this.createBonusMenuPurchase(userId, bonusTier);
} catch {
  // 3. referans tamamlandı ama bonus verilmedi — kimse fark etmez
}
// Doğru: hata fırlatılırsa retry veya admin alert
```

**Antipattern C — GiftCard oluşturma ve MenuPurchase ayrı transaction'da:**
```typescript
// Kötü:
await this.menuPurchaseRepo.create(purchaseData);
await this.giftCardService.createActivationGiftCard(userId, amount); // başarısız olursa?
// → Menü satın alındı ama GiftCard oluşmadı — kullanıcı hakkını kaybetti

// Doğru: aynı Mongoose session'da:
await session.withTransaction(async () => {
  await this.menuPurchaseRepo.create(purchaseData, { session });
  await this.giftCardRepo.create(giftCardData, { session });
});
```

**Antipattern D — Burn (sıfırlama) scheduler'da sessiz devam:**
```typescript
// Menü hakkı burn scheduler'da:
for (const expiredPurchase of expiredPurchases) {
  try {
    await this.burnPurchase(expiredPurchase._id);
  } catch { continue; } // hangi purchase burn edilmedi?
}
// Doğru: hata say, threshold aşınca admin alert, her hatayı log'la
```

**3.3 Aktivasyon window kontrolü tutarlılığı:**

```
Şunları kontrol et:

1. purchase-menu.handler.ts menü satın alırken:
   platformExpiresAt = satın alma tarihi + 45 gün
   activationDate = satın alma tarihi + 15 gün
   → Bu hesaplama server-side mı, client'tan mı geliyor?
   → Client'tan geliyorsa: KRİTİK güvenlik açığı

2. redeem-menu.handler.ts QR taranırken:
   now >= activationDate → geçer
   now <= platformExpiresAt → geçer
   → Timezone'a duyarlı mı? UTC mi kullanılıyor?

3. Burn scheduler:
   platformExpiresAt geçince status EXPIRED yapılıyor mu?
   → @Cron veya BullMQ delayed job mu?
```

**3.4 Business rule sızıntısı:**

- Tier ↔ Kategori erişim kontrolü `purchase-menu.handler.ts`'de inline mi, `CategoryAccessService`'de mi?
- QR süre hesabı (45 gün, 15 gün) handler'da sabit sayı mı, konfigüre edilebilir mi?
- Referral bonus hesabı domain servis mi, handler'da inline mi?
- GiftCard %50 oranı hard-code mu, admin'den değiştirilebilir mi?
- LaunchPartner faz geçiş koşulları (60 menü taahhüdü) handler'da mı, domain entity'de mi?

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 DROP edilen modellere ait artık kod:**

`Restaurant` ve `BazarXMenu` koleksiyonları DROP edildi ama eski kod kaldı mı?

```bash
grep -rn "Restaurant\|BazarXMenu\|menuId\b\|restaurantId" \
  apps/backend/src/modules/ \
  --include="*.ts" \
  | grep -v "// removed\|// deprecated\|\.spec\."
```

- Eski `menuId` referansları `listingId` ile değiştirildi mi?
- `LaunchPartner.restaurantId` → `vendorId` geçişi tamamlandı mı?
- Eski repository'ler silindi mi?

**4.2 Dead handler/servis tespiti:**

```bash
grep -rn "^export" \
  apps/backend/src/modules/go/ 2>/dev/null \
  apps/backend/src/modules/menu/ 2>/dev/null \
  --include="*.ts" \
  | grep -oP '(?<=class |function )\w+Handler|\w+Service' \
  | while read name; do
      refs=$(grep -rn "\b$name\b" apps/backend/src/ --include="*.ts" | wc -l)
      [ "$refs" -le 1 ] && echo "POSSIBLE DEAD: $name"
    done
```

**4.3 Önceki sprint kararlarının implementasyon durumu:**

Her karar için gerçek kodu oku ve raporla:

| Karar | Dosya | Implement mi? | Notlar |
|---|---|---|---|
| `qrType: 'PLATFORM' \| 'INSTANT_OPPORTUNITY'` | MenuPurchase schema | ? | ? |
| `platformExpiresAt` + `activationDate` ayrımı | MenuPurchase schema | ? | ? |
| `REFERRAL_TIER_MAP` sabiti + yukarı yuvarlama | referral-bonus.constants.ts | ? | ? |
| `GiftCard` aidatın %50'si üyelikte anında | purchase-menu handler | ? | ? |
| `CategoryAccessService` + preview hakkı | category-access.service.ts | ? | ? |

**4.4 BullMQ job tanımları:**

Menu modülü hangi BullMQ job'ları kullanıyor?

```bash
grep -rn "QUEUE\|queue\|@Process\|@BullmqWorker\|addJob\|add(" \
  apps/backend/src/modules/go/ \
  apps/backend/src/modules/menu/ \
  --include="*.ts" 2>/dev/null
```

Beklenen job'lar:
- Üyelik aktivasyon günü bildirim job'ları (Gün 2, 5, 10, 13, 15, 16)
- QR burn job (45. gün sonu)
- Referral bonus 45 gün süre kontrolü

Bunlar var mı? BullMQ delayed job mı, @Cron mu?

**4.5 `Listing.metadata.dailyLimit` field analizi:**

`purchase-menu.handler.ts` günlük limiti `Listing.metadata.dailyLimit`'ten alıyor.

- Bu field Listing schema'sında tanımlı mı?
- `metadata` alanı `Record<string, any>` mi yoksa typed mı?
- `dailyLimit` dışında başka `metadata` field'ları kullanılıyor mu?
- Typed bir interface gerekiyor mu?

```typescript
// Doğru typed metadata:
interface RestaurantListingMetadata {
  dailyLimit?: number;          // günlük QR kota
  categoryLevel: number;        // 1-6
  cuisineType?: string;
  avgPrepTimeMinutes?: number;
}
```

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/.../file.ts:satır`
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

1. **KRİTİK** — QR tarama race condition (iki eş zamanlı tarama aynı QR'ı iki kez kabul edebilir), aktivasyon tarihlerinin client'tan gelmesi (platformExpiresAt manipüle edilebilir), GiftCard + MenuPurchase ayrı transaction (GiftCard oluşmaz ama ödeme alındı)
2. **YÜKSEK** — Önceki sprint kararlarının implement edilmemiş olması (qrType, REFERRAL_TIER_MAP, CategoryAccessService), eski `Restaurant`/`BazarXMenu` artık kodun kalması, burn scheduler sessiz hatası
3. **ORTA** — `Listing.metadata` tiplendirilmemiş, referral bonus inline hesaplaması, QR süre sabitlerinin hard-code olması
4. **DÜŞÜK** — Dead handler/servis, LaunchPartner faz geçiş koşulları domain entity'e taşınması

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **45 gün + 15 gün pencere kuralları** — iş kararı, konfigüre edilebilir yap ama sayıları değiştirme
- **2× menü hakkı (aidat × 2)** — iş kararı
- **%8 platform hizmet bedeli** — iş kararı
- **REFERRAL_TIER_MAP sınır değerleri** — iş kararı (yukarı yuvarlama mantığını uygula, değerleri değiştirme)
- **LaunchPartner 60 menü sayısı** — iş kararı
- **GiftCard %50 oranı** — iş kararı, admin'den konfigüre edilebilir yap ama default değiştirme
- **`qrType` enum değerleri** — önceki sprint kararı, bozma
- **Tier ↔ Kategori eşleşme tablosu** — iş kararı (FULL_ACCESS_MAP değerlerini değiştirme)
- **DROP edilen `Restaurant`/`BazarXMenu` koleksiyonları** — geri getirme

---

## Son Not

Menu modülü BazarX-GO'nun kalbinde. Buradaki üç hata kullanıcı parasını veya hakkını etkiler:

QR tarama race condition → iki kişi aynı QR'ı aynı anda tarıyor, ikisi de geçiyor → restoran iki menü veriyor ama sistem bir ödeme kaydediyor.

platformExpiresAt client'tan geliyor → kullanıcı tarihi ileri ayarlıyor → süresi dolmuş QR'ları sonsuza aktif tutuyor.

GiftCard + MenuPurchase ayrı transaction → kullanıcı ödedi, MenuPurchase oluştu, GiftCard oluşturma başarısız oldu → kullanıcı ödediğinin %50'sini alamadı — şikayet ve para iadesi.

Bu üçü önce. Geri kalanı sonra.
