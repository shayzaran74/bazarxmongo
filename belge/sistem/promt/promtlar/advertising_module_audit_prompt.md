# Advertising Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Advertising modülü (23 dosya) şu ana kadar çalışan diğer modüllerin gölgesinde kaldı — `4B VendorBanners, Ads stub controller'ları ✅` notu var ama "stub" kelimesini gizliyor. Şimdi gerçekte neyin olduğunu öğreneceksin.

**Önemli bağlam — iki örtüşen sorun:**

1. `SideAd` Mongoose modeli hem `ADVERTISING` modülünde hem `CONTENT` modülünde listeli. Bu hangi modülün sahibi olduğu belirsizliğidir — iki yerde tanımlıysa ya duplicate şema ya da yanlış modül.

2. GO sprint'inde reklam slot sistemi tasarlandı:
   - Slot tipleri: `UPPER_BANNER (7 gün)`, `LOWER_BANNER (14 gün)`, `FEATURED`, `FLASH_SALE`, `SPECIAL_OFFER`, `AI_RECOMMENDATION`
   - Kaynak: `adSource: 'PAID' | 'MENU_TAAHHUT'` (ücretli veya menü taahhüdü karşılığı)
   - Restoran 60 menü taahhüdü → ücretsiz reklam hakkı
   - Bu tasarım mevcut `AdSlot` schema'sına entegre edildi mi? Kodu oku.

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/advertising/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (reklam fiyatları, slot ücretleri — Decimal128 zorunlu)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**Mongoose modelleri (advertising modülünde):**
```
AdCampaign        → Reklam kampanyası (vendor/restoran bazlı)
AdSlot            → Reklam slotu (tip, süre, görünürlük)
SideAd            → Yan reklam (sidebar) — CONTENT modülünde de var!
AdCampaignMetric  → İmpresyon, tıklama, CTR metrikleri
```

**CONTENT modülünde de olan:**
```
SideAd            → ⚠️ OVERLAP — hangi modül sahibi?
HomeBanner        → Content modülüne ait (reklam değil, kurumsal içerik)
```

**Vendor modülünde de olan:**
```
VendorBanner      → Vendor profil banner'ı (reklam mı, content mı?)
VendorBanners     → ⚠️ Stub controller — implement edilmemiş mi?
```

**Stub controller notu:**
`4B: Ecosystem, Analytics, VendorBanners, Ads stub controller'ları ✅`

---

## Advertising İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Genel Reklam Modeli

```
Üç platform için reklam geliri:
  BazarX (B2C):    Satıcı komisyonu + hizmet bedeli + Reklam
  TicariTakas (B2B): Aidat + takas komisyonu + Reklam
  BarterBorsa:     SaaS lisans + işlem bedeli + Reklam

Reklam kaynak tipleri:
  PAID:         Vendor/restoran ücret ödeyerek reklam alır
  MENU_TAAHHUT: Restoran 60 menü taahhüdü karşılığı ücretsiz reklam hakkı kazanır
```

### GO Reklam Slot Sistemi (Sprint kararı — implement durumu bilinmiyor)

```
Slot tipleri ve süreleri:
  UPPER_BANNER:      7 gün   — Ana sayfa üst banner, en premium görünürlük
  LOWER_BANNER:      14 gün  — Ana sayfa alt banner
  FEATURED:          Üyelik tier süresince — isFeatured=true listing önceliği
  FLASH_SALE:        Kampanya süresi — isFlashSale=true listing önceliği
  SPECIAL_OFFER:     Kampanya süresi — isSpecialOffer=true listing önceliği
  AI_RECOMMENDATION: Süre boyunca — AI öneri/sepet önerisi, boost katsayısı: 1.5

Adkaynak:
  adSource: 'PAID' | 'MENU_TAAHHUT'
  MENU_TAAHHUT: 60 menü taahhüdü karşılığı verilen ücretsiz reklam hakkı

Reklam hakkı hesaplama:
  Temel: Kullanıcı tier'ına göre (Bronz=1ay, Gümüş=2ay, Altın=3ay, Elmas=4ay)
  Menü fiyat bonusu: <1.000₺ +1 ay, ≥1.000₺ +2 ay (BazarX takdirine bağlı)
  isDiscretionary: BazarX takdirine bırakılan bonus mu?

Admin endpoint'leri (planlanan):
  POST /admin/go/restaurants/:id/calculate-ad-right  → Hesapla + öner
  POST /admin/go/restaurants/:id/grant-ad-right      → Onayla, AdCampaign oluştur
  GET  /admin/go/restaurants/:id/ad-history          → Reklam hakkı geçmişi
```

### TicariTakas Reklam Paketleri

```
Prime 1: 6.000 ₺/hafta, 22.000 ₺/ay | İçerik: 2 Kahve + Tatlı + 250gr Çekirdek
Prime 2: 8.000 ₺/hafta, 30.000 ₺/ay | 2 İmza Tatlı + Özel Kutu Çikolata
Prime 3: 10.000 ₺/hafta, 38.000 ₺/ay | 2 Burger/Pizza + Çıtır Sepeti
Prime 4: 12.000 ₺/hafta, 46.000 ₺/ay | Şefin Özel Tadım Menüsü

Aylık fiyat = Haftalık × 4 × 0.9 (%10 aylık bağlılık indirimi)
XP ile reklam ödemesi: maks %25 (6 ay kullanılmazsa silinir)
```

### Listing Flag ↔ AdSlot İlişkisi

```
Listing'deki flag'ler:
  isFeatured, isFlashSale, isSpecialOffer, isActive

Bu flag'ler marketing/admin tarafından mı set ediliyor?
AdSlot / AdCampaign aktif olduğunda otomatik flag mi set ediliyor?
Yoksa ikisi bağımsız mı?
→ Eğer bağımsız: reklam kampanyası bittiğinde isFeatured true kalır = stale state
```

### AdCampaignMetric

```
Ölçülen metrikler:
  İmpresyon (görüntülenme sayısı)
  Tıklama
  CTR (Click-Through Rate) = Tıklama / İmpresyon
  Dönüşüm (satın alma / görüntülenme)

Kim yazıyor?
  Her listing görüntülenme event'i → analytic event mi?
  Her tıklama → ayrı endpoint mi?
  Toplu batch mi?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Stub controller gerçek durumu:**

`VendorBanners` ve `Ads` stub controller'larının gerçek durumunu raporla:

| Controller | Dosya | Endpoint var mı? | Body dolu mu? | Module'da kayıtlı mı? |
|---|---|---|---|---|
| VendorBannersController | ? | ? | ? | ? |
| AdsController (vendor) | ? | ? | ? | ? |
| AdCampaignController (advertising) | ? | ? | ? | ? |
| AdSlotController (advertising) | ? | ? | ? | ? |

Her stub için karar:
- **Kaldır:** Module'da kayıtlı değil, hiç referans yok
- **Koru (stub):** Module'da kayıtlı, routing var → `throw new NotImplementedException()`
- **Kritik:** Boot'ta DI injection hatası oluşturuyor → hemen düzelt

**1.2 `SideAd` çift modül sorunu:**

`SideAd` hem `ADVERTISING` hem `CONTENT` modülünde listelenmiş.

```
Kontrol listesi:
  □ SideAd Mongoose schema'sı kaç yerde tanımlı?
    - advertising/infrastructure/schemas/sideAd.schema.ts ?
    - content/infrastructure/schemas/sideAd.schema.ts ?
    - İkisi aynı schema mı yoksa farklı field'lar mı var?
  □ SideAd module.ts'lere kaç kez `MongooseModule.forFeature()` ile kayıtlı?
  □ İki modül aynı koleksiyona mı yazıyor?
  □ SideAd gerçekte ne içeriyor?
    - Sidebar reklam (vendor tarafından oluşturulan) → advertising modülüne ait
    - Kurumsal site içerik bloğu → content modülüne ait
    - Hangisi?
```

**1.3 GO reklam slot sistemi implement durumu:**

Sprint kararında `AdCampaign` ve `AdSlot` schema'larına eklenmesi planlanan field'lar:

```typescript
// AdCampaign'e eklenmesi planlanan:
restaurantId?: Types.ObjectId;
adSource: 'PAID' | 'MENU_TAAHHUT';
menuTaahhutCount?: number;
calculatedAdValueTL?: Types.Decimal128;
tierAtCalculation?: string;
menuPriceRange?: 'BELOW_1000' | 'ABOVE_1000';
bonusMonthsGranted?: number;
isDiscretionary: boolean;

// AdSlot'a eklenmesi planlanan:
slotType: 'UPPER_BANNER' | 'LOWER_BANNER' | 'FEATURED' | 'FLASH_SALE' | 'SPECIAL_OFFER' | 'AI_RECOMMENDATION';
aiBoostMultiplier?: number;
```

Her field için: schema'da var mı, yoksa implement edilmemiş mi?

**1.4 Listing flag ↔ AdSlot bağlantısı:**

```
  □ AdCampaign veya AdSlot oluşturulduğunda:
    Listing.isFeatured, Listing.isFlashSale, Listing.isSpecialOffer otomatik set ediliyor mu?
  □ Kampanya bittiğinde (status: ENDED/EXPIRED):
    Bu flag'ler otomatik false yapılıyor mu?
    → Hayırsa: kampanya bitti ama listing hâlâ ✨Featured görünüyor
  □ Flag set etme ve AdCampaign aynı Mongoose session'da mı?
```

**1.5 AdCampaignMetric yazım noktaları:**

```bash
grep -rn "AdCampaignMetric\|impression\|clickThrough\|ctr\|ad.*metric\|metric.*ad" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\."
```

- Metrik nerede yazılıyor? Her listing görüntülemede mi, tıklamada mı?
- Bulk batch mi yoksa gerçek zamanlı mı?
- Dead model mi (sadece schema var, hiç yazılmıyor)?

**1.6 Modül bağımlılık grafiği:**

- `advertising.module.ts` hangi modüllere bağımlı?
- `catalog.module.ts` listing flag'leri için advertising'e bağımlı mı?
- `content.module.ts` ile çakışma var mı?
- Admin panelinde advertising endpoint'leri nasıl erişiliyor?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm advertising klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/advertising/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| adCampaign.schema.ts | ? | `metadata: any` | YÜKSEK | `AdCampaignMetadata` |
| ad-slot.handler.ts | ? | `slotConfig: any` | ORTA | `AdSlotConfig` |

Risk seviyeleri:
- `KRİTİK`: Reklam fiyatı `any` → `Decimal128` yerine `number` → fatura tutarsızlığı
- `YÜKSEK`: `slotType` `any` → bilinmeyen slot tipine reklam atanır
- `ORTA`: Metrik payload `any` → yanlış sayaç artırımı
- `DÜŞÜK`: Display field, cascade yok

**Adım 3:** `AdCampaign` schema full tip tanımı:

```typescript
interface AdCampaignDocument {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  restaurantId?: Types.ObjectId;         // GO restoran kampanyaları için
  
  adSource: 'PAID' | 'MENU_TAAHHUT';
  
  title: string;
  description?: string;
  imageUrl?: string;
  
  targetListingId?: Types.ObjectId;      // hangi listing'i öne çıkarıyor?
  targetSlotType?: AdSlotType;           // hangi slot tipinde
  
  // GO reklam hakkı hesabı (sprint kararı):
  menuTaahhutCount?: number;             // 60
  calculatedAdValueTL?: Types.Decimal128;
  tierAtCalculation?: string;
  menuPriceRange?: 'BELOW_1000' | 'ABOVE_1000';
  bonusMonthsGranted?: number;
  isDiscretionary?: boolean;
  
  budget?: Types.Decimal128;             // PAID kampanyalar için
  dailyBudget?: Types.Decimal128;
  
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'EXPIRED';
  
  startsAt: Date;
  endsAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

type AdSlotType =
  | 'UPPER_BANNER'
  | 'LOWER_BANNER'
  | 'FEATURED'
  | 'FLASH_SALE'
  | 'SPECIAL_OFFER'
  | 'AI_RECOMMENDATION';
```

Bu tam tip mevcut mu yoksa parçalı / `any` ile mi tanımlı?

**Adım 4:** TicariTakas reklam paket fiyatları `Decimal128` mı?

```typescript
// TicariTakas reklam paket fiyatları:
interface TicariTakasAdPackage {
  packageType: 'PRIME_1' | 'PRIME_2' | 'PRIME_3' | 'PRIME_4';
  weeklyPrice: Types.Decimal128;    // 6.000 / 8.000 / 10.000 / 12.000
  monthlyPrice: Types.Decimal128;   // haftalık × 4 × 0.9
  contentDescription: string;
}

// Aylık hesap:
// weeklyPrice × 4 × 0.9 — Decimal128 ile yapılmalı:
const monthly = Decimal128.fromString(
  (parseFloat(weeklyPrice.toString()) * 4 * 0.9).toFixed(2)
);
```

Bu hesap nerede yapılıyor? Hard-code mu, admin'den configüre edilebilir mi?

**Adım 5:** `AdCampaignMetric` tip güvensizliği:

```typescript
// Beklenen metrik tipi:
interface AdCampaignMetricDocument {
  _id: Types.ObjectId;
  campaignId: Types.ObjectId;
  slotId?: Types.ObjectId;
  
  date: Date;                    // gün bazlı agregasyon
  
  impressions: number;
  clicks: number;
  ctr: number;                   // clicks / impressions (hesaplanan)
  conversions: number;           // tıklama → satın alma
  
  costPerClick?: Types.Decimal128;
  totalSpent?: Types.Decimal128;
  
  createdAt: Date;
}
```

Schema bu tipleri içeriyor mu yoksa `any` var mı?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — adSource dallanması:**
```typescript
// Kötü:
if (campaign.adSource === 'PAID') {
  // bütçe kontrolü yap
  // ödeme al
} else if (campaign.adSource === 'MENU_TAAHHUT') {
  // taahhüt kontrolü yap
  // LaunchPartner bağla
}
// → AdCampaignStrategy interface ile ayrıştır:
interface IAdCampaignStrategy {
  validate(campaign: CreateAdCampaignDto): Promise<void>;
  activate(campaign: AdCampaignDocument): Promise<void>;
  onExpire(campaign: AdCampaignDocument): Promise<void>;
}
```

**Pattern B — slotType dallanması:**
```typescript
// Kötü:
if (slot.slotType === 'UPPER_BANNER') { duration = 7; }
else if (slot.slotType === 'LOWER_BANNER') { duration = 14; }
else if (slot.slotType === 'FEATURED') { duration = membershipDays; }
else if (slot.slotType === 'AI_RECOMMENDATION') { boostMultiplier = 1.5; }
// → AD_SLOT_CONFIG sabit:
const AD_SLOT_CONFIG: Record<AdSlotType, { defaultDays?: number; aiBoost?: number }> = {
  UPPER_BANNER: { defaultDays: 7 },
  LOWER_BANNER: { defaultDays: 14 },
  FEATURED: { },
  FLASH_SALE: { },
  SPECIAL_OFFER: { },
  AI_RECOMMENDATION: { aiBoost: 1.5 },
};
```

**Pattern C — Listing flag set etme:**
```typescript
// Kötü — handler'da inline:
if (slotType === 'FEATURED') {
  await Listing.updateOne({ _id: listingId }, { isFeatured: true });
} else if (slotType === 'FLASH_SALE') {
  await Listing.updateOne({ _id: listingId }, { isFlashSale: true });
} else if (slotType === 'SPECIAL_OFFER') {
  await Listing.updateOne({ _id: listingId }, { isSpecialOffer: true });
}
// → ListingFlagService.applyAdFlag(listingId, slotType) ile soyutla
```

**Pattern D — TicariTakas aylık fiyat hesabı:**
```typescript
// Aylık = Haftalık × 4 × 0.9
// Kötü — float ile:
const monthly = weeklyPrice * 4 * 0.9; // floating point hatası
// Doğru:
const weekly = parseFloat(weeklyPrice.toString());
const monthly = Decimal128.fromString((weekly * 4 * 0.9).toFixed(2));
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Kampanya bitişinde listing flag temizlenmemesi:**
```typescript
// Kampanya ENDED/EXPIRED olduğunda:
await AdCampaign.updateOne({ _id: id }, { status: 'ENDED' });
// → Listing.isFeatured hâlâ true
// Doğru:
await session.withTransaction(async () => {
  await AdCampaign.updateOne({ _id: id }, { status: 'ENDED' }, { session });
  if (campaign.slotType === 'FEATURED') {
    await Listing.updateOne(
      { _id: campaign.targetListingId },
      { isFeatured: false },
      { session }
    );
  }
  // diğer flag'ler...
});
```

**Antipattern B — Metrik yazımında sessiz hata:**
```typescript
// Her listing görüntülemede:
try {
  await AdCampaignMetric.updateOne(
    { campaignId, date: today },
    { $inc: { impressions: 1 } },
    { upsert: true }
  );
} catch {
  // sessiz hata — metrik yazılmadı ama kimse fark etmez
}
// Doğru: metrik yazımı kritik değil — yut ama log'la
// En iyisi: Redis'te sayaç, gece batch ile MongoDB'ye flush
```

**Antipattern C — Çakışan kampanya kontrolü eksikliği:**
```typescript
// Aynı listing için aynı slot tipinde iki kampanya açılabilir mi?
// Kontrol:
const existing = await AdCampaign.findOne({
  targetListingId: listingId,
  slotType: dto.slotType,
  status: 'ACTIVE',
});
if (existing) throw new ConflictException({ code: 'SLOT_ALREADY_OCCUPIED' });
// Bu kontrol var mı?
```

**Antipattern D — MENU_TAAHHUT kampanyası LaunchPartner bağlantısı:**
```typescript
// Restoran ücretsiz reklam hakkı kullanıyorsa:
// LaunchPartner.adRightUsed güncellenmeli
// AdCampaign.menuTaahhutCount set edilmeli
// Eğer bu bağlantı kurulmuyorsa:
// → Aynı restoran sınırsız ücretsiz reklam alabiliyor (bug)
```

**3.3 AI_RECOMMENDATION boost mantığı:**

```
adSource=AI_RECOMMENDATION ile aktif kampanya varken:
  Listing sıralamasında bu listing önce mi geliyor?
  boost: 1.5 nasıl uygulanıyor?
    → Listing query'sinde $sort'a etki ediyor mu?
    → ML model'i etkiliyor mu?
    → Sadece flag mı?
  Bu özellik implement edilmiş mi yoksa tasarım aşamasında mı?
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 `SideAd` çift tanım tespiti:**

```bash
grep -rn "SideAd\|sideAd\|side_ad" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\."
```

- Kaç farklı dosyada `SideAdSchema` tanımlı?
- İkisi de aynı `side_ads` koleksiyonuna mı yazıyor?
- `MongooseModule.forFeature([{ name: 'SideAd', schema: SideAdSchema }])` kaç modülde?
- Çözüm önerisi: `advertising.module.ts` sahip olsun, `content.module.ts` import etsin — yaz.

**4.2 Dead model/handler tespiti:**

```bash
for model in AdCampaign AdSlot SideAd AdCampaignMetric VendorBanner; do
  echo "=== $model ==="
  grep -rn "$model" apps/backend/src/ --include="*.ts" \
    | grep -v "schema\|module\|import\|\.spec\." | wc -l
done
```

Özellikle:
- `AdCampaignMetric`: gerçekten yazılıyor mu? Handler/event var mı?
- `VendorBanner`: vendor banner sistemi implement edilmiş mi? Sadece schema mı var?
- `SideAd`: content mi, advertising mi, ikisi de mi kullanıyor?

**4.3 GO reklam sprint kararları implementasyon tablosu:**

| Planlanan | Dosya | Implement? |
|---|---|---|
| `adSource: 'PAID' \| 'MENU_TAAHHUT'` | adCampaign.schema.ts | ? |
| `slotType: AdSlotType enum` | adSlot.schema.ts | ? |
| `aiBoostMultiplier` field | adSlot.schema.ts | ? |
| `calculatedAdValueTL` | adCampaign.schema.ts | ? |
| `RestaurantAdCalculatorService` | restaurant-ad-calculator.service.ts | ? |
| `POST /admin/go/restaurants/:id/calculate-ad-right` | admin endpoint | ? |
| `POST /admin/go/restaurants/:id/grant-ad-right` | admin endpoint | ? |

**4.4 `advertising.module.ts` sağlık kontrolü:**

```bash
cat apps/backend/src/modules/advertising/advertising.module.ts
```

- `providers` listesinde kayıtlı ama hiç inject edilmeyen servis/handler var mı?
- `exports` listesi gereksiz geniş mi?
- Katalog modülüne export edilmesi gereken bir şey var mı (listing flag yönetimi için)?

**4.5 Listing flag'leri ve AdSlot arasındaki bağ:**

```bash
grep -rn "isFeatured\|isFlashSale\|isSpecialOffer" \
  apps/backend/src/modules/advertising/ \
  --include="*.ts"
```

- Advertising modülünden listing flag'leri set ediliyor mu?
- Yoksa bu bağlantı hiç kurulmamış mı?
- Kurulmamışsa: reklam sistemi ile listing görünürlüğü bağımsız çalışıyor demektir — tasarım hatası.

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/advertising/path/to/file.ts:satır`
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

1. **KRİTİK** — `SideAd` çift modül (iki modül aynı koleksiyona yazıyor → veri tutarsızlığı), Kampanya bitişinde listing flag temizlenmemesi (stale isFeatured → kullanıcıya yanlış bilgi), MENU_TAAHHUT kampanyası LaunchPartner bağlantısı yoksa sınırsız ücretsiz reklam
2. **YÜKSEK** — Stub controller'ların module'da kayıtlı olması (boot injection hatası), GO sprint slot tipleri implement edilmemişse reklam sistemi GO ile uyumsuz, `adSource` field eksikliği
3. **ORTA** — `AdCampaignMetric` dead model (schema var, yazım yok), Çakışan kampanya kontrolü eksikliği, TicariTakas aylık fiyat float ile hesaplanıyor
4. **DÜŞÜK** — `AI_RECOMMENDATION` boost implement edilmemiş, dead provider temizliği, naming tutarsızlıkları

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **Slot tipi isimleri ve süreleri** — iş kararı
- **TicariTakas paket fiyatları** (6.000/8.000/10.000/12.000 ₺) — iş kararı
- **%10 aylık bağlılık indirimi** — iş kararı
- **AI boost katsayısı (1.5)** — iş kararı, konfigüre edilebilir yap
- **MENU_TAAHHUT tier süreleri** (Bronz=1ay, vs.) — iş kararı
- **XP ile reklam ödemesi %25 limiti** — iş kararı
- **HomeBanner** — content modülüne ait, advertising ile ilgisi yok, dokunma

---

## Son Not

Advertising modülünün üç sessiz problemi var:

`SideAd` çift modül — İki modül aynı koleksiyona yazıyorsa veri tutarsızlığı kaçınılmaz. Advertising modülü bir kayıt ekliyor, content modülü başka bir query ile aynı koleksiyonu farklı field'larla sorguluyor. Bu koleksiyonda kim neyi görüyor belli değil.

Kampanya bitiş → listing flag temizleme yok — Vendor 7 günlük `UPPER_BANNER` kampanyası satın aldı. Kampanya bitti. `Listing.isFeatured` hâlâ `true`. Kullanıcı ✨Featured badge'i olan bu ürünü görüyor ama arkasında aktif bir kampanya yok. Muhasebe uyuşmazlığı + kullanıcı yanıltması.

MENU_TAAHHUT LaunchPartner bağlantısı yoksa — Restoran 60 menü taahhüdü verdi, ücretsiz reklam hakkı kazandı. Ama bu hak LaunchPartner kaydına yazılmıyorsa aynı restoran her ay yeni bir kampanya açıp sınırsız ücretsiz reklam alabilir.

Bu üçü önce raporla.
