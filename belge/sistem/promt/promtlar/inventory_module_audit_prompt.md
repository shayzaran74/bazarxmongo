# Inventory Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Inventory modülü 8 dosya ile sistemin en küçük modüllerinden — ama stok yönetimi tüm modüllere yayılmış durumda:

**Stok ile ilgili varlıklar — dağıtık yapı:**

| Model | Modül | Görev |
|---|---|---|
| `Stock` | inventory | Ürün stok sayısı (ana stok kaydı?) |
| `Warehouse` | inventory | Depo lokasyonu |
| `InventoryLog` | inventory | Stok hareket kaydı |
| `PurchaseOrder` / `PurchaseOrderItem` | inventory | Tedarik siparişi |
| `StockReservation` | commerce | Checkout sırasında stok rezervasyonu |
| `Listing.quantity` | catalog | Satışa sunulan miktar |
| `GarageSale.soldQty` | vendor/ecosystem | Flash sale stok tüketimi |
| `Transfer` / `TransferItem` | vendor | Stok transferi mi, erken ödeme mi? |

**Temel soru:** `Listing.quantity` gerçek stok kaynağı mı, yoksa `Stock` koleksiyonu mu? İkisi tutarlı mı?

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/inventory/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (PurchaseOrder tutarları)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**Inventory modülü Mongoose modelleri (5 adet):**
```
Stock             → Ürün stok kaydı (vendorId + productId + quantity)
Warehouse         → Depo lokasyonu
InventoryLog      → Her stok hareketi için kayıt (audit trail)
PurchaseOrder     → Tedarikçiye verilen sipariş (alım emri)
PurchaseOrderItem → PurchaseOrder alt kalemleri
```

**Bağlantılı modeller (başka modüllerde):**
```
StockReservation  (commerce) → Checkout sırasında stok kilitleme
Listing.quantity  (catalog)  → Vitrin stok miktarı
GarageSale.soldQty (vendor)  → Flash sale stok tüketimi
Transfer/TransferItem (vendor) → Stok transferi mi başka şey mi?
```

---

## Inventory İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Stok Kaynağı Belirsizliği — Önce Çöz

```
BazarX sisteminde stok iki yerde tutuluyor olabilir:

Senaryo A (Listing-first):
  → Gerçek stok: Listing.quantity
  → inventory/Stock: ek depo yönetimi veya toplu stok kaydı
  → Checkout: Listing.quantity azaltılır, StockReservation oluşturulur

Senaryo B (Stock-first):
  → Gerçek stok: inventory/Stock.quantity
  → Listing.quantity: görüntüleme amaçlı, Stock'tan türetilir
  → Checkout: Stock.quantity azaltılır + StockReservation

Senaryo C (Tutarsız):
  → Her ikisi de var ama senkron değil
  → Stok tutarsızlığı riski en yüksek senaryo

Hangi senaryo gerçek? checkout.service.ts'de hangi model okunuyor?
```

### StockReservation (Commerce Modülü)

```
Checkout akışında stok rezervasyonu:
  1. Kullanıcı checkout başlatır
  2. StockReservation oluşturulur (listingId, quantity, expiresAt: +15 dk)
  3. Ödeme tamamlanırsa → Reservation CONFIRMED, stok gerçekten azaltılır
  4. Ödeme başarısızsa / timeout → Reservation CANCELLED, stok serbest bırakılır

Kritik: Reservation oluştururken stok kontrolü atomic mi?
  → findOneAndUpdate + $inc + $expr ile kontrol edilmeli
```

### InventoryLog (Audit Trail)

```
Her stok hareketinde log yazılmalı:
  reason: 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'PURCHASE_ORDER' | 'TRANSFER'
  previousQty: number
  newQty: number
  delta: number (pozitif = giriş, negatif = çıkış)

Bu log: ✅ InventoryLog.reason SM (schema migration olarak işaretlenmiş)
```

### PurchaseOrder (Tedarik Siparişi)

```
Vendor stok satın alırken:
  PurchaseOrder: DRAFT → SUBMITTED → APPROVED → RECEIVED → COMPLETED
  Her kalem: PurchaseOrderItem (productId, quantity, unitCost)
  RECEIVED'da stok artırılır (atomic)
  InventoryLog yazılır
```

### Buybox'ta Stok Güvenilirliği (%10)

```
BuyboxScore hesabında: stok güvenilirliği %10 ağırlık taşıyor
"Son 30 günde stok kesintisi yaşandı mı?" → puan düşer

Bu metrik nerede hesaplanıyor?
  inventory modülü → BuyboxScore servisi'ni tetikliyor mu?
  Yoksa bu bağlantı hiç kurulmamış mı?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Stok kaynağı belirsizliğini çöz — sistemin en kritik sorusu:**

```bash
# checkout.service.ts hangi stok modelini kullanıyor?
grep -rn "Stock\.\|Listing\.quantity\|StockReservation\|quantity.*stock\|stock.*quantity" \
  apps/backend/src/modules/commerce/application/services/checkout.service.ts

# Listing controller'ında stok nereden geliyor?
grep -rn "quantity\|stock\|Stock" \
  apps/backend/src/modules/catalog/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|schema\|import" | head -20
```

- `checkout.service.ts` stok kontrolünü `Listing.quantity`'den mi, `Stock.quantity`'den mi yapıyor?
- `Listing` güncelleme (stok azaltma) nerede tetikleniyor?
- `Stock` ve `Listing.quantity` senkron mu?
- Bu soruların yanıtına göre "stok tutarsızlığı riski" var mı?

**1.2 `Transfer`/`TransferItem` (vendor modülü) ile inventory ilişkisi:**

```bash
grep -rn "Transfer\|TransferItem\|transfer.*stock\|stock.*transfer\|transfer.*inventory\|inventory.*transfer" \
  apps/backend/src/modules/vendor/ \
  apps/backend/src/modules/inventory/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\." | head -20
```

- `Transfer` modeli stok transferi mi, finansal transfer mi, başka bir şey mi?
- Inventory modülüyle entegrasyonu var mı?
- Dead model mi?

**1.3 `StockReservation` atomic kontrolü:**

```bash
grep -rn "StockReservation\|stockReservation\|stock.*reserv\|reserv.*stock" \
  apps/backend/src/modules/commerce/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\."
```

- `StockReservation` oluşturulurken stok kontrolü yapılıyor mu?
- `findOneAndUpdate + $inc + $expr` mi, yoksa iki adımlı (find + update) mi?
- Reservation TTL: expired reservation'lar otomatik temizleniyor mu? (TTL index veya scheduler)

**1.4 `InventoryLog.reason` schema durumu:**

```
✅ SM: InventoryLog.reason notu var — schema migration yapıldı.
```

```bash
grep -rn "InventoryLog\|inventoryLog\|inventory.*log\|log.*inventory" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|\.spec\." | head -20
```

- `InventoryLog`'a gerçekten yazılıyor mu? Hangi handler'dan?
- `reason` enum mi, string mi?
- Her stok hareketi log yazıyor mu, yoksa sadece bazıları mı?

**1.5 Buybox stok güvenilirliği bağlantısı:**

```bash
grep -rn "stockReliability\|stock.*reliability\|buybox\|BuyboxScore\|stok.*güvenilirlik\|OUT_OF_STOCK\|outOfStock" \
  apps/backend/src/modules/inventory/ \
  apps/backend/src/modules/catalog/ \
  --include="*.ts" | grep -v "\.spec\."
```

- Inventory modülünden BuyboxScore servisi tetikleniyor mu?
- `Listing.isBuyboxWinner` field'ı set ediliyor mu inventory değişikliğinde?
- Bu bağlantı hiç kurulmamış mı?

**1.6 Modül bağımlılık grafiği:**

- `inventory.module.ts` hangi modüllere bağımlı?
- `catalog.module.ts` inventory'den veri alıyor mu?
- `commerce.module.ts` inventory'den `Stock`'u kullanıyor mu?
- Vendor modülü (GarageSale stok tüketimi için) inventory'e bağlı mı?
- Cross-module stok yazımı: doğrudan inject mi, event mi?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm inventory klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/inventory/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| inventory-log.handler.ts | ? | `movement: any` | YÜKSEK | `StockMovementDto` |
| purchase-order.handler.ts | ? | `items: any[]` | ORTA | `PurchaseOrderItemDto[]` |

Risk seviyeleri:
- `KRİTİK`: Stok miktarı `any` → yanlış tip, stok negatife düşebilir
- `YÜKSEK`: InventoryLog `reason` `any` → bilinmeyen hareket tipi yazılır
- `ORTA`: PurchaseOrder item listesi `any[]` → validation atlanıyor
- `DÜŞÜK`: Warehouse display, cascade yok

**Adım 3:** `InventoryLog.reason` enum tipi:

```typescript
export const INVENTORY_LOG_REASONS = [
  'SALE',              // Satış
  'RETURN',            // İade
  'ADJUSTMENT',        // Manuel düzeltme (admin)
  'PURCHASE_ORDER',    // Tedarik siparişi girişi
  'TRANSFER_IN',       // Başka depodan transfer giriş
  'TRANSFER_OUT',      // Başka depoya transfer çıkış
  'RESERVATION',       // Checkout rezervasyonu
  'RESERVATION_RELEASE', // Rezervasyon serbest bırakma
  'GARAGE_SALE',       // Flash sale tüketimi
] as const;

export type InventoryLogReason = typeof INVENTORY_LOG_REASONS[number];

interface InventoryLogDocument {
  _id: Types.ObjectId;
  stockId: Types.ObjectId;
  vendorId: Types.ObjectId;
  listingId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  
  reason: InventoryLogReason;   // string değil
  
  previousQty: number;
  delta: number;                // pozitif = giriş, negatif = çıkış
  newQty: number;               // previousQty + delta
  
  performedBy: Types.ObjectId;  // admin, vendor veya system
  performedByRole: 'ADMIN' | 'VENDOR' | 'SYSTEM';
  
  note?: string;                // manuel düzeltmede açıklama
  
  createdAt: Date;
}
```

**Adım 4:** `Stock` schema tam tip tanımı:

```typescript
interface StockDocument {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  listingId: Types.ObjectId;       // Listing ile bağlantı
  warehouseId?: Types.ObjectId;
  
  quantity: number;                // mevcut stok
  reservedQuantity: number;        // StockReservation'lardan gelen toplam
  availableQuantity: number;       // quantity - reservedQuantity (hesaplanan)
  
  lowStockThreshold?: number;      // düşük stok uyarı eşiği
  isTrackingEnabled: boolean;      // stok takibi aktif mi?
  
  lastUpdatedAt: Date;
  createdAt: Date;
}
```

Bu schema mevcut mu? `availableQuantity` hesaplanmış mı yoksa saklanan mı?

**Adım 5:** `PurchaseOrder` para alanları:

```typescript
interface PurchaseOrderItemDocument {
  productId: Types.ObjectId;
  quantity: number;
  unitCost: Types.Decimal128;      // number değil — Decimal128
  totalCost: Types.Decimal128;     // unitCost × quantity
}
```

`unitCost` ve `totalCost` `Decimal128` mı, `number` mı?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Stok hareketi reason dallanması:**
```typescript
// Kötü:
if (reason === 'SALE') { qty -= delta; }
else if (reason === 'RETURN') { qty += delta; }
else if (reason === 'ADJUSTMENT') { qty = newQty; }
// → InventoryMovementStrategy ile ayrıştır:
interface IInventoryMovement {
  apply(current: number, delta: number): number;
  validate(current: number, delta: number): void;
}
const MOVEMENT_STRATEGIES: Record<InventoryLogReason, IInventoryMovement> = {
  SALE: { apply: (q, d) => q - d, validate: (q, d) => { if (q < d) throw ... } },
  RETURN: { apply: (q, d) => q + d, validate: () => {} },
  // ...
};
```

**Pattern B — PurchaseOrder durum geçişi:**
```typescript
// Kötü:
if (order.status === 'DRAFT') { /* submit */ }
else if (order.status === 'SUBMITTED') { /* approve/reject */ }
else if (order.status === 'APPROVED') { /* receive */ }
// → State machine veya domain entity metodları:
purchaseOrder.canSubmit(), purchaseOrder.canApprove(), purchaseOrder.canReceive()
```

**Pattern C — Depo bazlı stok dağılımı:**
```typescript
// Kötü:
if (warehouseId) {
  // depo bazlı stok
} else {
  // genel stok
}
// Bu ayrım doğru uygulanıyor mu?
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Stok azaltma non-atomic (KRİTİK):**
```typescript
// Kötü — iki adımlı:
const stock = await Stock.findOne({ listingId });
if (stock.availableQuantity < requestedQty) throw ...;
await Stock.updateOne({ _id: stock._id }, { $inc: { quantity: -requestedQty } });
// → İki eş zamanlı sipariş aynı anda "stok var" görür → oversell

// Doğru — atomic:
const updated = await Stock.findOneAndUpdate(
  {
    listingId,
    $expr: { $gte: [{ $subtract: ['$quantity', '$reservedQuantity'] }, requestedQty] }
  },
  { $inc: { reservedQuantity: requestedQty } },
  { new: true, session }
);
if (!updated) throw new ForbiddenException({ code: 'INSUFFICIENT_STOCK' });
```

**Antipattern B — InventoryLog yazımında sessiz hata:**
```typescript
// Kötü:
await Stock.updateOne({ _id: id }, { quantity: newQty });
try {
  await InventoryLog.create({ ... });
} catch {
  // log yazılamadı — stok değişti ama neden değişti bilinmiyor
}
// Doğru: log başarısız olursa yut ama Logger.error ile kaydet
```

**Antipattern C — PurchaseOrder RECEIVED stok artışı transaction'sız:**
```typescript
// Kötü:
for (const item of order.items) {
  await Stock.updateOne(
    { listingId: item.productId },
    { $inc: { quantity: item.quantity } }
  );
  await InventoryLog.create({ reason: 'PURCHASE_ORDER', ... });
}
// Yarıda kesilirse bazı ürünler stok aldı, bazıları almadı

// Doğru: tüm item'lar tek Mongoose session'da:
await session.withTransaction(async () => {
  for (const item of order.items) {
    await Stock.updateOne(..., { session });
    await InventoryLog.create([...], { session });
  }
  await PurchaseOrder.updateOne({ _id: orderId }, { status: 'COMPLETED' }, { session });
});
```

**Antipattern D — StockReservation TTL cleanup eksikliği:**
```typescript
// StockReservation expiresAt: +15 dakika
// TTL index yoksa: expired reservation'lar sonsuza kalır
// → reservedQuantity şişer → availableQuantity yanlış hesaplanır

// TTL index kontrolü:
grep -rn "expireAfterSeconds\|TTL\|expiresAt.*index\|ttl.*index" \
  apps/backend/src/modules/commerce/ --include="*.ts"
```

**Antipattern E — Listing.quantity ve Stock.quantity desync:**
```typescript
// Checkout stok azaltınca:
// Listing.quantity güncelleniyor mu?
// Stock.quantity güncelleniyor mu?
// İkisi de mi?
// Sadece biri mi? → Tutarsızlık

// Örnek: Listing.quantity = 5, Stock.quantity = 3
// Kullanıcı 4 adet sipariş verirse:
//   Listing'e göre: geçer (5 >= 4)
//   Stock'a göre: başarısız (3 < 4)
// Hangisi kullanılıyor?
```

**3.3 Stok negatife düşme koruması:**

```
Şunları kontrol et:
  □ Stok azaltma işlemlerinde negatif değer kontrolü var mı?
    $expr: { $gte: ['$quantity', requestedQty] } koşulu
  □ Admin manuel düzeltmede negatif değer yazılabilir mi?
  □ İade sonrası stok artışında overflow koruması var mı?
    (integer max değer — pratikte olmaz ama)
  □ reservedQuantity > quantity olabilir mi?
    (Reservation oluşturuldu ama Stock azaltma henüz olmadıysa)
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Modelin gerçek kullanım analizi:**

```bash
for model in Stock Warehouse InventoryLog PurchaseOrder PurchaseOrderItem; do
  echo "=== $model yazılıyor ==="
  grep -rn "$model\.\(create\|insertMany\|updateOne\|findOneAndUpdate\|\\\$inc\)" \
    apps/backend/src/ --include="*.ts" \
    | grep -v "schema\|module\|\.spec\." | wc -l
  echo "=== $model okunuyor ==="
  grep -rn "$model\.\(find\|findOne\|aggregate\)" \
    apps/backend/src/ --include="*.ts" \
    | grep -v "schema\|module\|\.spec\." | wc -l
done
```

Her model için: yazılıyor mu, okunuyor mu? Dead model var mı?

**4.2 `Warehouse` modeli analizi:**

```bash
grep -rn "Warehouse\|warehouseId\|warehouse" \
  apps/backend/src/ --include="*.ts" \
  | grep -v "schema\|module\|\.spec\." | head -15
```

- `Warehouse` modeli gerçekten kullanılıyor mu?
- Çoklu depo yönetimi implement edilmiş mi?
- `Stock`'ta `warehouseId` field'ı var mı?
- Çok satıcılı bir platform için çoklu depo ne zaman gerekli olacak?

**4.3 Vendor modülündeki `Transfer`/`TransferItem` ile inventory overlap:**

```bash
grep -rn "Transfer\b\|TransferItem\b" \
  apps/backend/src/modules/vendor/ \
  apps/backend/src/modules/inventory/ \
  --include="*.ts" \
  | grep -v "schema\|module\|import\|\.spec\." | head -15
```

- Vendor'daki `Transfer` stok hareketi mi?
- `InventoryLog` ile overlap var mı?
- Transfer inventory modülüne taşınmalı mı?

**4.4 `inventory.module.ts` sağlık kontrolü:**

```bash
cat apps/backend/src/modules/inventory/inventory.module.ts 2>/dev/null || \
  find apps/backend/src/modules/inventory/ -name "*.module.ts" -exec cat {} \;
```

- Providers listesi: kaç handler, kaç servis?
- Commerce modülünden `Stock` nasıl erişiliyor?
- Catalog modülünden `Stock` nasıl erişiliyor?

**4.5 Stok güvenilirliği metrikleri (Buybox %10 ağırlık):**

Buybox hesabında stok güvenilirliği %10 ağırlık taşıyor ama bu metric henüz implement edilmemiş (Buybox `[ ]` olarak işaretlenmiş).

```
Implement edildiğinde inventory modülünden ne gerekecek?
  □ "Son 30 günde stok kesintisi" → InventoryLog'dan aggregate
    { reason: 'SALE', newQty: 0 } → stok bitti
    Bu aggregate endpoint'i hazır mı?
  □ Vendor başına stock_reliability_score hesabı:
    kesintisiz_gün / toplam_gün * 100
  □ Bu score BuyboxScore hesabına nasıl taşınacak?

Bu gelecek implementasyon için altyapı hazır mı?
```

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlam]

**Dosya:** `apps/backend/src/modules/inventory/path/to/file.ts:satır`
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

1. **KRİTİK** — Stok azaltma non-atomic (oversell riski), `Listing.quantity` ve `Stock.quantity` desync (hangi kaynak kullanılıyor bilinmiyor), `StockReservation` TTL index yoksa reservedQuantity şişmesi
2. **YÜKSEK** — `InventoryLog.reason` string yerine enum (bilinmeyen hareket tipi), PurchaseOrder RECEIVED stok artışı transaction'sız (kısmi güncelleme riski), stok negatife düşme koruması
3. **ORTA** — `Warehouse` dead model, `Transfer`/`TransferItem` inventory overlap, Buybox stok güvenilirliği altyapısı eksik
4. **DÜŞÜK** — PurchaseOrder state machine domain entity metodları, InventoryLog sessiz yazım hatası

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **Çoklu depo mimarisi** — büyük karar, sadece mevcut durumu raporla
- **FIFO/LIFO stok değerleme** — muhasebe kararı, implement etme önerme
- **Stok eşik değerleri** — iş kararı
- **PurchaseOrder onay akışı** — iş kararı, state machine mantığını değiştirme
- **Buybox %10 stok güvenilirliği** — implement edilmemiş, altyapı durumunu raporla
- **`Transfer`/`TransferItem` vendor → inventory taşıma** — büyük refactor, sadece tavsiye

---

## Son Not

Inventory modülünün en kritik sorusu tek cümlede özetleniyor:

**"Checkout sırasında hangi model gerçek stok kaynağı olarak kullanılıyor?"**

`Listing.quantity` veya `Stock.quantity` — hangisi? Eğer her ikisi de ayrı ayrı güncelleniyor ama senkron değilse, bir kullanıcı satın alır, stok gerçekten azalır, ama vitrin hâlâ "5 adet var" gösterir. Ya da tam tersi. Bu sistemin tamamını etkileyen veri tutarsızlığı — tespit edilmeden başka hiçbir şeyin önemi yok.

Bu soruyu önce yanıtla.
