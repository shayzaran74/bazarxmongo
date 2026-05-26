# Marketing Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Marketing modülü sadece 5 dosya — sistemin en küçük modülü. Ama içerdiği 6 Mongoose modeli birden fazla başka modülle kesişiyor ve bu kesişimler tutarsızlık riski taşıyor.

**Kritik bağlam — üç örtüşen sorun:**

1. **`Coupon` çift modül** — `Coupon` ve `CouponUsage` marketing modülünde, `EscrowCoupon` commerce modülünde. Bunlar aynı kupon sistemi mi, farklı şeyler mi?

2. **`GiftCard` çok kaynaklı** — GO sprint'inde üyelik aktivasyonunda `GiftCard` (aidatın %50'si) kararlaştırıldı. Ayrıca master plan'da "doğum günü çeki, 3. ay tamamlama" senaryoları var. Hem GO menü modülü hem marketing modülü `GiftCard` kullanıyor — tek koleksiyon mu, iki ayrı koleksiyon mu?

3. **`GroupBuy` ve `Campaign`** — Bu iki model belgede neredeyse hiç geçmiyor. Dead model mi?

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/marketing/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (GiftCard tutarları, Coupon değerleri)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**Marketing modülü Mongoose modelleri (6 adet):**
```
Campaign             → Pazarlama kampanyası (?)
GroupBuy             → Toplu alım (?)
GroupBuyParticipant  → Toplu alım katılımcısı
GiftCard             → Hediye çeki / kart
Coupon               → İndirim kuponu
CouponUsage          → Kupon kullanım kaydı
```

**Başka modüllerde çakışan modeller:**
```
EscrowCoupon (commerce) → checkout sırasında kupon uygulaması?
GiftCard (GO/menu) → üyelik aktivasyonunda %50 değer (sprint kararı)
```

---

## Marketing İş Kuralları — Bunları Bilmeden İnceleme Yapma

### GiftCard (Hediye Çeki)

```
İki farklı kaynak:
  1. Platform hediyesi: Doğum günü, 3. ay tamamlama, yıl dönümü
     → Admin tarafından oluşturulur
     → giftCardSource: 'BIRTHDAY' | 'MILESTONE' | 'ANNIVERSARY' | 'CAMPAIGN'

  2. Üyelik aktivasyonu (GO sprint kararı):
     → Kullanıcı üye olunca aidatın %50'si GiftCard olarak verilir
     → giftCardSource: 'MEMBERSHIP_ACTIVATION'
     → membershipId ile bağlantılı
     → expiresAt: üyelik bitişi + 30 gün

Platform kuralları:
  - Platform içi tüm alışverişlerde kullanılabilir (BazarX marketplace, menü vb.)
  - Nakite çevrilemez, başkasına devredilemez
  - Kısmi kullanım mümkün (50 ₺'lik çekten 30 ₺ kullanılabilir)
  - Bakiye güncelleme atomic olmalı
  - İptal senaryoları:
    Üyelik 16. günden önce iptal edilirse GiftCard iptal edilir
    Kullanılan kısım kesilir (kalan iade edilmez)
```

### Coupon (İndirim Kuponu)

```
Kupon tipleri:
  PERCENTAGE:   Yüzde indirim (örn: %15)
  FIXED_AMOUNT: Sabit tutar indirim (örn: 50 ₺)
  FREE_SHIPPING: Ücretsiz kargo

Kupon kuralları:
  - Tek kullanımlık mı, çok kullanımlık mı?
  - Kullanıcı başına maksimum kullanım sayısı
  - Minimum sipariş tutarı
  - Geçerlilik tarihi (startDate / endDate)
  - Belirli kategorilere veya ürünlere özel mi?

CouponUsage: Kim ne zaman hangi siparişte kullandı?

EscrowCoupon (commerce):
  → Checkout sırasında kupon uygulaması
  → GiftCard ile fark ne?
  → İkisi ayrı flow mu?
```

### GroupBuy (Toplu Alım)

```
Master plan'da hiç bahsedilmiyor. Kodu oku:
  - GroupBuy nedir? Açıklama yok.
  - Kaç kullanıcı aynı ürünü alınca fiyat düşer mı?
  - GroupBuyParticipant: katılımcı listesi mi?
  - Implement edilmiş mi, dead model mi?
```

### Campaign (Pazarlama Kampanyası)

```
Marketing Campaign vs Catalog Campaign vs AdCampaign:
  - marketing/Campaign
  - catalog/Campaign (catalog modülünde de 'Campaign' var!)
  - advertising/AdCampaign
  Bu üçü farklı mı, overlap mi?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 `Coupon` vs `EscrowCoupon` farkı:**

```bash
grep -rn "EscrowCoupon\|escrowCoupon\|Coupon\b\|CouponUsage" \
  apps/backend/src/modules/ \
  --include="*.ts" \
  | grep -v "schema\|module\|import\|\.spec\." | head -20
```

- `EscrowCoupon` (commerce) nedir? Schema'da ne var?
- `Coupon` (marketing) ile aynı koleksiyon mu farklı koleksiyon mu?
- Checkout sırasında hangisi kullanılıyor? `EscrowCoupon` mu, `Coupon` mu, her ikisi mi?
- `CouponUsage` nereye yazılıyor?

**1.2 `GiftCard` çok kaynaklı kullanım:**

```bash
grep -rn "GiftCard\|giftCard\|gift_card\|giftCardSource\|MEMBERSHIP_ACTIVATION\|BIRTHDAY" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|import\|\.spec\." | head -20
```

- `GiftCard` kaç modülden yazılıyor?
- GO sprint kararındaki `MEMBERSHIP_ACTIVATION` source implement edildi mi?
- Checkout sırasında GiftCard bakiye düşümü nerede yapılıyor?
- GiftCard + Coupon aynı siparişte kullanılabilir mi?

**1.3 `GroupBuy` ve `Campaign` gerçek durumu:**

```bash
for model in GroupBuy GroupBuyParticipant Campaign; do
  echo "=== $model ==="
  grep -rn "$model\.\(create\|find\|update\|delete\)" \
    apps/backend/src/ --include="*.ts" \
    | grep -v "schema\|module\|\.spec\." | wc -l
done
```

- `GroupBuy` gerçekten kullanılıyor mu?
- `Campaign` (marketing) catalog/Campaign ve advertising/AdCampaign ile overlap var mı?
- Dead model varsa: kaldır

**1.4 GiftCard bakiye düşümü atomic mi?**

```bash
grep -rn "GiftCard.*balance\|balance.*GiftCard\|remainingBalance\|usedAmount\|GiftCard.*\\\$inc\|GiftCard.*findOneAndUpdate" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\." | head -15
```

GiftCard kullanımında bakiye düşümü:
- Atomic mı? (`findOneAndUpdate + $expr: { $gte: ['$remainingBalance', useAmount] }`)
- İki adımlı mı? (find → check → update → race condition)
- Kısmi kullanım desteği var mı?

**1.5 Kupon çakışma ve birleşim kuralları:**

```bash
grep -rn "coupon\|GiftCard\|applyDiscount\|discount.*apply\|checkout.*coupon\|checkout.*gift" \
  apps/backend/src/modules/commerce/application/services/checkout.service.ts | head -15
```

- Checkout'ta kupon ve gift card birlikte uygulanabiliyor mu?
- Uygulama sırası nasıl? (önce kupon mu, önce GiftCard mı?)
- Çakışma kuralı var mı? ("XP indirimle birlikte kupon kullanılamaz" gibi)

**1.6 Modül bağımlılık grafiği:**

- `marketing.module.ts` hangi modüllere bağımlı?
- `commerce.module.ts` marketing'den ne kullanıyor? (`GiftCard`, `Coupon`)
- `go/menu.module.ts` marketing'den ne kullanıyor? (`GiftCard`)
- Cross-module GiftCard/Coupon erişimi: doğrudan inject mi, event mi?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm marketing klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/marketing/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| giftCard.schema.ts | ? | `metadata: any` | ORTA | `GiftCardMetadata` |
| coupon.handler.ts | ? | `discount: any` | YÜKSEK | `CouponDiscountResult` |

Risk seviyeleri:
- `KRİTİK`: GiftCard tutarı `any` → Decimal128 yerine number → kuruş kayıpları
- `YÜKSEK`: Coupon indirim hesabı `any` → yanlış indirim uygulanır
- `ORTA`: GroupBuy metadata `any`
- `DÜŞÜK`: Display-only

**Adım 3:** `GiftCard` schema tam tip tanımı:

```typescript
export const GIFT_CARD_SOURCES = [
  'BIRTHDAY',
  'MILESTONE',
  'ANNIVERSARY',
  'CAMPAIGN',
  'MEMBERSHIP_ACTIVATION',  // GO sprint kararı
  'REFERRAL_BONUS',
  'ADMIN_GRANT',
] as const;

export type GiftCardSource = typeof GIFT_CARD_SOURCES[number];

interface GiftCardDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  
  code: string;                         // benzersiz kart kodu (UUID?)
  giftCardSource: GiftCardSource;       // any değil
  
  originalAmount: Types.Decimal128;     // başlangıç tutarı
  remainingBalance: Types.Decimal128;   // kalan bakiye (atomic güncellenir)
  usedAmount: Types.Decimal128;         // kullanılan toplam
  
  // GO üyelik aktivasyonu için:
  membershipId?: Types.ObjectId;
  activationPercent?: number;           // %50
  
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Kullanım geçmişi (embedded veya ayrı koleksiyon?):
  usageHistory?: Array<{
    orderId: Types.ObjectId;
    usedAmount: Types.Decimal128;
    usedAt: Date;
  }>;
}
```

Bu schema mevcut mu? `any` var mı?

**Adım 4:** `Coupon` schema tip tanımı:

```typescript
export const COUPON_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'] as const;
export type CouponType = typeof COUPON_TYPES[number];

interface CouponDocument {
  _id: Types.ObjectId;
  code: string;                  // benzersiz kupon kodu (unique index)
  
  type: CouponType;              // any değil
  
  discountValue: Types.Decimal128; // % veya ₺
  minimumOrderAmount?: Types.Decimal128;
  maximumDiscountAmount?: Types.Decimal128; // PERCENTAGE için tavan
  
  maxUsageCount?: number;        // toplam kullanım limiti
  maxUsagePerUser?: number;      // kullanıcı başına limit
  
  applicableCategories?: Types.ObjectId[];
  applicableListings?: Types.ObjectId[];
  
  startDate: Date;
  endDate: Date;
  
  isActive: boolean;
  createdAt: Date;
}
```

**Adım 5:** Discount hesaplama dönüş tipi:

```typescript
// Checkout'ta kupon/gift card uygulaması sonucu:
interface DiscountApplicationResult {
  originalAmount: Types.Decimal128;
  discountAmount: Types.Decimal128;
  finalAmount: Types.Decimal128;
  couponDiscount?: Types.Decimal128;
  giftCardDiscount?: Types.Decimal128;
  couponId?: string;
  giftCardId?: string;
}
```

Bu tip tanımlı mı yoksa `any` mi dönüyor?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Coupon type dallanması:**
```typescript
// Kötü:
if (coupon.type === 'PERCENTAGE') {
  discount = orderAmount * coupon.discountValue / 100;
} else if (coupon.type === 'FIXED_AMOUNT') {
  discount = coupon.discountValue;
} else if (coupon.type === 'FREE_SHIPPING') {
  shippingDiscount = shippingCost;
}
// → CouponDiscountCalculator strategy:
interface ICouponDiscount {
  calculate(orderAmount: Types.Decimal128, coupon: CouponDocument): Types.Decimal128;
}
const calculators: Record<CouponType, ICouponDiscount> = {
  PERCENTAGE: new PercentageDiscount(),
  FIXED_AMOUNT: new FixedAmountDiscount(),
  FREE_SHIPPING: new FreeShippingDiscount(),
};
```

**Pattern B — GiftCard source dallanması:**
```typescript
// Kötü:
if (giftCard.giftCardSource === 'MEMBERSHIP_ACTIVATION') {
  // özel iptal kuralları
} else if (giftCard.giftCardSource === 'BIRTHDAY') {
  // doğum günü özel kuralları
} else {
  // genel kurallar
}
// → GiftCardPolicy per source
```

**Pattern C — İndirim kombine uygulama:**
```typescript
// Kötü — checkout'ta:
if (couponCode) {
  discount += calculateCouponDiscount(couponCode);
}
if (giftCardCode) {
  discount += calculateGiftCardDiscount(giftCardCode);
}
// Sıralama önemli mi? Birden fazla coupon uygulanabilir mi?
// → DiscountChain pattern
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — GiftCard bakiye race condition (KRİTİK):**
```typescript
// Kötü — iki adımlı:
const giftCard = await GiftCard.findOne({ code: dto.code, userId });
if (giftCard.remainingBalance < dto.useAmount) throw ...;
await GiftCard.updateOne(
  { _id: giftCard._id },
  { $inc: { remainingBalance: -dto.useAmount, usedAmount: dto.useAmount } }
);
// → İki eş zamanlı sipariş ikisi de "bakiye var" görür → double spend

// Doğru — atomic:
const updated = await GiftCard.findOneAndUpdate(
  {
    code: dto.code,
    userId,
    status: 'ACTIVE',
    $expr: { $gte: ['$remainingBalance', dto.useAmount] }
  },
  {
    $inc: {
      remainingBalance: Decimal128.fromString((-dto.useAmount).toFixed(2)),
      usedAmount: Decimal128.fromString(dto.useAmount.toFixed(2))
    }
  },
  { new: true }
);
if (!updated) throw new ConflictException({ code: 'INSUFFICIENT_GIFT_CARD_BALANCE' });
```

**Antipattern B — Coupon kullanım sayısı race condition:**
```typescript
// Kötü — aynı user aynı anda iki sipariş verirse maxUsagePerUser aşılabilir:
const usageCount = await CouponUsage.countDocuments({ couponId, userId });
if (usageCount >= coupon.maxUsagePerUser) throw ...;
await CouponUsage.create({ couponId, userId, orderId });
// → CouponUsage'da unique index veya atomic kontrol gerekli
```

**Antipattern C — GiftCard iptal ve üyelik iptal tutarsızlığı:**
```typescript
// MEMBERSHIP_ACTIVATION gift card iptal edilirken:
// Üyelik iptal edildi → GiftCard iptal edilmeli
// GiftCard kısmen kullanılmışsa ne olur?
// Bu akış implement edilmiş mi?
try {
  await membership.cancel();
  await giftCard.cancel(); // başarısız olursa?
} catch {
  // üyelik iptal ama GiftCard hâlâ active
}
// → Transaction veya outbox pattern gerekli
```

**Antipattern D — Coupon geçerlilik tarih kontrolü:**
```typescript
// Coupon uygulamadan önce tarih kontrolü yapılıyor mu?
// Kötü:
const coupon = await Coupon.findOne({ code });
// endDate kontrolü yok → süresi dolmuş kupon uygulanıyor

// Doğru:
const coupon = await Coupon.findOne({
  code,
  isActive: true,
  startDate: { $lte: now },
  endDate: { $gte: now }
});
```

**3.3 GiftCard kısmi kullanım Decimal128 doğruluğu:**

```typescript
// Kısmi kullanım örneği:
// remainingBalance = 50 ₺, kullanılan = 30.50 ₺
// Kalan = 50 - 30.50 = 19.50 ₺

// Kötü — float ile:
const remaining = parseFloat(balance.toString()) - useAmount; // 19.499999...

// Doğru — Decimal128 ile string aritmetiği:
const remainingStr = (
  parseFloat(balance.toString()) - parseFloat(useAmount.toString())
).toFixed(2);
const newBalance = Decimal128.fromString(remainingStr);
```

Bu hesaplama doğru yapılıyor mu? Floating-point kayıp var mı?

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead model tespiti — GroupBuy ve Campaign:**

```bash
for model in GroupBuy GroupBuyParticipant Campaign; do
  echo "=== $model ==="
  grep -rn "$model\b" apps/backend/src/ --include="*.ts" \
    | grep -v "schema\|module\|import\|type\b\|interface\|\.spec\." | wc -l
done
```

- `GroupBuy` ve `GroupBuyParticipant` gerçekten yazılıyor ve okunuyor mu?
- `Campaign` (marketing) catalog/Campaign ve advertising/AdCampaign'den farklı bir şey mi?
- Dead olan modeller silinmeli

**4.2 `EscrowCoupon` analizi:**

```bash
grep -rn "EscrowCoupon\|escrowCoupon" \
  apps/backend/src/ --include="*.ts" \
  | grep -v "schema\|module\|import\|\.spec\." | head -15
```

- `EscrowCoupon` checkout akışında nasıl kullanılıyor?
- Marketing `Coupon` ile fark ne? Neden iki ayrı model?
- `EscrowCoupon` bakiye/değer tutumu `Decimal128` mı?

**4.3 GiftCard kullanım geçmişi yapısı:**

GiftCard bir kez mi kullanılabilir, yoksa kısmi kullanım olduğunda her kullanım kaydedilmeli mi?

```
Seçenek A — Embedded:
  GiftCard.usageHistory: Array<{ orderId, amount, usedAt }>
  (+) tek koleksiyon sorgusu
  (-) büyük array, unbounded growth riski

Seçenek B — Ayrı koleksiyon:
  GiftCardUsage: { giftCardId, orderId, userId, amount, usedAt }
  (+) verimli sorgular (hangi sipariş hangi gift card?)
  (-) ek koleksiyon

Hangisi implement edilmiş? Veya hiç implement edilmemiş mi (remainingBalance sadece)?
```

**4.4 `marketing.module.ts` sağlık kontrolü:**

```bash
cat apps/backend/src/modules/marketing/marketing.module.ts 2>/dev/null || \
  find apps/backend/src/modules/marketing/ -name "*.module.ts" -exec cat {} \;
```

- 5 dosya için hangi handler ve servisler kayıtlı?
- Commerce modülü marketing'den ne kullanıyor? (GiftCard, Coupon)
- Dead provider var mı?

**4.5 Admin gift card yönetimi:**

```bash
grep -rn "admin.*gift\|gift.*admin\|POST.*gift-card\|GET.*gift-card\|PATCH.*gift-card\|GiftCard.*controller\|controller.*GiftCard" \
  apps/backend/src/ --include="*.ts" | grep -v "\.spec\."
```

- Admin toplu gift card oluşturabilir mi?
- "Doğum günü çeki" için otomatik tetikleme var mı? (Scheduler?)
- Admin gift card iptal edebilir mi?

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/marketing/path/to/file.ts:satır`
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

1. **KRİTİK** — GiftCard bakiye race condition (double spend), Coupon kullanım sayısı race condition (aynı kullanıcı limitten fazla kullanabilir), GiftCard iptal ve üyelik iptal tutarsızlığı
2. **YÜKSEK** — `EscrowCoupon` vs `Coupon` sahiplik belirsizliği, GiftCard kısmi kullanım Decimal128 hesabı, Coupon tarih kontrolü eksikliği
3. **ORTA** — `GroupBuy` dead model, `Campaign` üçlü overlap, GiftCard `giftCardSource` string yerine enum
4. **DÜŞÜK** — GiftCard kullanım geçmişi yapısı kararı, doğum günü çeki scheduler, admin gift card yönetimi

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **GiftCard tutarları** (doğum günü değeri vb.) — iş kararı
- **Coupon indirim oranları** — iş kararı
- **GiftCard geçerlilik süresi** — iş kararı
- **GroupBuy implementasyonu** — sadece dead model tespiti yap, implement etme
- **EscrowCoupon vs Coupon birleştirmesi** — büyük refactor, sadece tavsiye ver
- **Kısmi kullanım özelliği** — mevcut implement edilmemişse, altyapı hazır mı sor

---

## Son Not

Marketing modülündeki en kritik sorun paradoksal görünüyor ama basit:

**GiftCard bakiye race condition** — Kullanıcının 50 ₺ bakiyeli gift card'ı var. Aynı anda iki farklı sekmeden iki sipariş veriyor. Her ikisi de "bakiye var" görüyor, her ikisi de 40 ₺ düşüyor. Sonuç: 50 ₺ bakiye ile 80 ₺ harcama. `findOneAndUpdate + $expr` olmadan bu kesinlikle gerçekleşir.

**Coupon + GiftCard birlikte kullanımında sıralama önemli.** Önce Coupon indirimini uygularsan daha küçük bir tutara GiftCard ödersin. Önce GiftCard uygularsan farklı olur. Checkout'ta bu sıra tanımlı mı?

Bu ikisi önce raporla.
