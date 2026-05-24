# Commerce Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Commerce modülünü bugün ilk kez görmüyorsun — checkout akışından gRPC escrow çağrısına, fatura PDF üretimine kadar her katmanı biliyorsun. Tahmin yürütme. Her tespit koda dayalı olsun, her tespit kaynak dosya ve satır referansı taşısın. "Belki", "genellikle", "önerilir" gibi muğlak ifadeler kullanma.

---

## Sistem Bağlamı

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · pnpm workspaces  
**Proje yolu:** `apps/backend/src/modules/commerce/`  
**Ödeme sistemi:** Iyzico (Stripe değil — eski referans görürsen hata işaretle)  
**Finansal servis:** gRPC (`financial-service:50051`) — escrow hold/release/refund  
**Fatura:** PDFKit → MinIO (GİB e-arşiv entegrasyonu henüz yok — stub olarak bırakılmış)

**Pattern zorunlulukları — bunları audit kriterlerinde kullan:**
- Controller → CommandBus/QueryBus → Handler → Repository (katman atlama yasak)
- Para: `Decimal128` (JS `number` yasak)
- Log: `Logger` (`console.*` yasak)
- Tip: strict TypeScript (`any` yasak)
- Business logic: domain entity'de — handler'da, service'de değil
- Transaction: `mongoose.startSession()` + `session.withTransaction()` (atomik işlemler için)

**Mevcut Mongoose modelleri:**
`Cart`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, `OrderReturn`, `Invoice`, `InvoiceItem`, `Dispute`, `StockReservation`, `EscrowCoupon`, `Coupon`

**Implement edilmemiş (stub controller/servis var, body boş):**
- `return.controller.ts` / `return.service.ts`
- `early-payment.controller.ts` / `early-payment.service.ts`
- `invoice-pdf.service.ts` (e-fatura stub — GİB entegrasyonu yok)
- Mongoose modelleri: `ReturnRequest`, `ReturnItem`, `EarlyPaymentRequest`

---

## Commerce Modülünün İş Kuralları — Bunları Bilmeden Refactor Etme

**Checkout akışı (sıra önemli — adım atlanamaz):**
```
1. CartItem'ları validate et (stok, fiyat, listing aktif mi)
2. StockReservation oluştur (atomic — race condition önlemi)
3. Komisyon hesapla (tier'a göre %6–%12, XP indirimi maks %50)
4. Iyzico ödeme başlat
5. Ödeme başarılıysa → gRPC escrow holdFunds (idempotency key zorunlu)
6. Order oluştur (PROCESSING)
7. Invoice oluştur
8. Cart temizle
→ Herhangi bir adım başarısızsa: compensating rollback (StockReservation serbest, escrow refund)
```

**Order state machine (bu geçişler dışında transition yasak):**
```
E-ticaret:   PROCESSING → PREPARING → READY → SHIPPED → DELIVERED → COMPLETED
             Her state'den: → CANCELLED (koşullu — SHIPPED sonrası iptal yasak)
             DELIVERED sonrası → DISPUTED (14 gün içinde)
             COMPLETED ← DISPUTED (çözüldüğünde)
GO Restoran (QR_PICKUP):   PROCESSING → QR_ISSUED → REDEEMED → COMPLETED
GO Restoran (Delivery):    PROCESSING → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
```

**İade iş kuralları (Mesafeli Satış Yönetmeliği):**
```
- Teslimden itibaren 14 gün içinde iade açılabilir
- İade talebi → otomatik kargo kodu üretilir
- Satıcı 48 saat içinde onay/red vermeli → süre aşımında otomatik onay
- Red gerekçesi mevzuata aykırıysa → sipariş tutarı satıcıdan tahsil
- İade onayında → gRPC escrow releaseFunds (kullanıcıya) + vendordan kesinti
ReturnRequest state:
  REQUESTED → APPROVED / REJECTED
  APPROVED  → CARGO_PENDING → RECEIVED → REFUND_INITIATED → COMPLETED
  REJECTED  → DISPUTED (müşteri itiraz ederse)
```

**Erken ödeme kuralları:**
```
- Onaylı siparişlerin hakedişinin maks %80'i erken çekilebilir
- Faiz: (vade günü - bugün) × günlük %0.05
- Minimum tutar: 500 ₺
- Günde 1 talep hakkı (aynı gün ikinci talep bloklansın)
- Onay → gRPC financial-service anında transfer
```

**Komisyon yapısı (tier bazlı):**
```
CORE:    standart oran (%6–%12 kategori bazlı)
PRIME:   aynı grup içi işlemde %3 indirim
ELITE:   %6 sabit
APEX:    %3 (standart %6 × 0.5)
XP indirimi komisyonun maks %50'sine uygulanır — nakit kısım her zaman %50 kalır
XP indirimi + grup içi oran aynı işlemde birlikte uygulanamaz
```

**Dispute kuralları:**
```
- Teslimden 14 gün içinde açılabilir
- 72 saat içinde itiraz açılabilir → otomatik sistem kararı → manuel inceleme → hakem kurulu
- Dispute açıkken escrow hold devam eder
- Çözüm: RESOLVED_FOR_BUYER → refund | RESOLVED_FOR_SELLER → release
```

**gRPC idempotency zorunluluğu:**
Her `holdFunds`, `releaseFunds`, `refundFunds` çağrısı benzersiz `idempotencyKey` taşımalı.  
Format: `{action}-{orderId}-{timestamp}` veya `{action}-{orderId}-{actorId}`  
Key yoksa veya tekrar ediyorsa → runtime bug, çift ödeme riski.

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya yolu + satır numarası.

**1.1 Katman ihlalleri:**

- Hangi controller doğrudan Mongoose model inject ediyor?
- Hangi handler repository katmanını atlayıp başka bir handler çağırıyor?
- `checkout.service.ts` doğrudan domain entity mi kullanıyor, Mongoose document mu?
- Herhangi bir servis CommandBus/QueryBus bypass edip handler'ı doğrudan new'liyor mu?

**1.2 Order entity ve state machine:**

- `Order` domain entity'si var mı, yoksa sadece Mongoose document mu kullanılıyor?
- `VALID_TRANSITIONS` map tanımlı mı? Nerede — entity'de mi, handler'da mı, servis'te mi?
- State geçişi yaparken önce validasyon mu, önce DB yazımı mı?
- `isGoOrder` / `goOrderMode` flag'leri state machine'e entegre mi yoksa if/else ile mi ayrıştırılmış?

**1.3 Checkout transaction atomikliği:**

- Compensating rollback tam olarak implement edilmiş mi? Senaryolar:
  - Escrow hold başarılı, Order oluşturma başarısız → escrow refund tetikleniyor mu?
  - StockReservation oluştu, Iyzico ödeme başarısız → reservation serbest bırakılıyor mu?
  - Invoice oluşturma başarısız → Order rollback oluyor mu?
- Her gRPC çağrısında `idempotencyKey` var mı?

**1.4 Modül bağımlılık grafiği:**

- `commerce.module.ts` imports listesini çıkar — hangi modüllere bağımlı?
- Commerce dışından commerce'e hangi modüller depend ediyor?
- `catalog` ↔ `commerce` bağımlılığı tek yönlü mü? Catalog'dan commerce'e referans var mı?
- `financial-gateway` modülü nasıl inject ediliyor — global mi, import mu?

**1.5 Implement edilmemiş stub'ların durumu:**

- `return.controller.ts` — endpoint'ler tanımlı ama handler boş mu? Handler hiç yok mu?
- `early-payment.service.ts` — method imzaları var ama body `throw new Error('not implemented')` mu?
- `ReturnRequest`, `ReturnItem`, `EarlyPaymentRequest` Mongoose modelleri oluşturulmuş mu yoksa sadece comment olarak mı var?
- Bu stub'lar `commerce.module.ts`'de register edilmiş mi? Register edilmişse NestJS boot'ta hata fırlatıyor mu?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm `commerce/` altını tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/commerce/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için bu tabloyu doldur:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| checkout.service.ts | 83 | `payload: any` | KRİTİK | `IyzicoPay3DCallbackDto` |

Risk seviyeleri:
- `KRİTİK`: Para hesabında `any` — Decimal128 yerine number riski, çift ödeme riski, veri bütünlüğü bozulabilir
- `YÜKSEK`: State geçişinde `any` — yanlış transition geçebilir
- `ORTA`: Response shape'inde `any` — runtime type mismatch
- `DÜŞÜK`: Geçici cast, izole scope

**Adım 3:** Her `KRİTİK` ve `YÜKSEK` için tam tip tanımını yaz — sadece "interface yap" deme, interface'i yaz:

```typescript
// Örnek:
interface CheckoutLineItem {
  listingId: Types.ObjectId;
  quantity: number;
  unitPrice: Types.Decimal128;      // number değil
  commissionRate: Types.Decimal128; // number değil
  vendorId: Types.ObjectId;
  isGoOrder: boolean;
}
```

**Adım 4:** Iyzico callback handler'ında tip güvensizliği özellikle ara:

Iyzico 3D Secure callback genellikle `req.body` veya event payload olarak gelir. Bu noktada `any` kullanımı ödeme tutarının yanlış parse edilmesine yol açar. Tespit edersen hem riski açıkla hem doğru tipi yaz.

**Adım 5:** gRPC response tipleri:

`WalletGrpcService` veya `EscrowGrpcService`'in `holdFunds`, `releaseFunds`, `refundFunds` dönüş tipleri tanımlı mı? `any` varsa `.proto` dosyasından türetilmiş interface yaz.

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti — özellikle şunlara bak:**

**Pattern A — OrderStatus if/else zincirleri:**
```typescript
// Kötü:
if (order.status === 'PROCESSING') { ... }
else if (order.status === 'PREPARING') { ... }
else if (order.status === 'SHIPPED') { ... }
// Bu pattern'i bul — her occurrence için state machine ile nasıl
// yerine geçileceğini göster (kodu yaz)
```

**Pattern B — VendorType / isGoOrder dallanması:**
```typescript
// Kötü:
if (order.isGoOrder && order.goOrderMode === 'QR_PICKUP') { ... }
else if (order.isGoOrder && order.goOrderMode === 'RESTAURANT_DELIVERY') { ... }
else { ... }
// Bu pattern strategy veya polymorphism ile nasıl çözülür — kodu yaz
```

**Pattern C — Komisyon hesabında tier dallanması:**
```typescript
// Kötü:
if (vendor.tier === 'CORE') { rate = 0.12; }
else if (vendor.tier === 'PRIME') { rate = 0.09; }
else if (vendor.tier === 'ELITE') { rate = 0.06; }
else if (vendor.tier === 'APEX') { rate = 0.03; }
// Konfigürasyona taşıma önerisi + kodu yaz
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

```typescript
// ANTIPATTERN A — sessiz yutma (en tehlikeli):
try { await escrowGrpc.holdFunds(...); }
catch (e) { }  // ödeme hatası sessizce geçiyor — KRİTİK

// ANTIPATTERN B — generic rethrow (gereksiz try/catch):
try { return await this.repo.findById(id); }
catch (e) { throw e; }

// ANTIPATTERN C — tip bilgisi kaybı:
catch (e) { throw new Error(String(e)); }  // orijinal stack trace gitti

// ANTIPATTERN D — iç içe try/catch:
try {
  try { await holdFunds(); }
  catch { await refund(); }  // compensating içinde de hata olursa?
} catch { }

// ANTIPATTERN E — gRPC hata tipi yutma:
catch (err) {
  if (err.code === 14) { ... }  // gRPC status code magic number — enum kullan
}
```

Her bulgu için: dosya + satır, antipattern türü, doğru implementasyon kodu.

**Compensating transaction'lar için özel dikkat:**

Rollback mantığında antipattern varsa bu KRİTİK'tir. Escrow refund başarısız olursa ne oluyor? Bunu tara, varsa raporla, doğru pattern'i yaz:

```typescript
// Doğru pattern:
const session = await this.connection.startSession();
try {
  await session.withTransaction(async () => {
    // atomic işlemler
  });
} catch (err) {
  // Compensating action burada — session dışında
  await this.escrowGrpc.refundFunds({
    idempotencyKey: `refund-${orderId}-${Date.now()}`,
    holdId,
  }).catch(refundErr =>
    this.logger.error('Compensating refund failed', { orderId, refundErr })
  );
  throw err; // orijinal hatayı yeniden fırlat
}
```

**3.3 Business rule sızıntısı:**

Şunları kontrol et:

- Controller'da fiyat hesabı var mı? (komisyon, KDV, indirim — controller'da olmamalı)
- Repository'de validasyon var mı? (stok kontrolü, sipariş limiti — repository'de olmamalı)
- Handler'da state geçiş kuralları kodlanmış mı? (entity method'larında olmalı)
- `checkout.service.ts` ne kadar şişkin? 100+ satırı geçen methodlar var mı? Method extraction gerekiyor mu?

Her sızıntı için: nerede bulunuyor, nerede olmalı, taşıma kodu.

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Stub dosyaları envanteri:**

Aşağıdaki dosyalar için gerçek durumu raporla (tahmin değil, kodu oku):

| Dosya | Durum | İçerik |
|---|---|---|
| `return.controller.ts` | ? | Endpoint tanımlı mı? Handler bağlı mı? |
| `return.service.ts` | ? | Method var mı? Body dolu mu? |
| `early-payment.controller.ts` | ? | ... |
| `early-payment.service.ts` | ? | ... |
| `invoice-pdf.service.ts` | ? | PDF üretimi çalışıyor mu, stub mu? |

Her stub için karar ver:
- **Kaldır:** Hiçbir şey yok, module'da register da edilmemiş → temiz kaldır
- **Koru (stub olarak):** Module'da register edilmiş, endpoint routing var ama body yok → stub kalsın ama `throw new NotImplementedException()` ile doğru hata dön
- **Tamamla:** Kritik path üzerinde, eksik olması runtime'da NestJS injection hatasına yol açıyor

**4.2 Dead code tespiti:**

```bash
# Hiçbir yerde import edilmeyen dosyaları bul:
grep -rn "export" apps/backend/src/modules/commerce/ --include="*.ts" | \
  awk -F: '{print $1, $3}' | while read file export; do
    name=$(echo $export | grep -oP '(?<=class |function |const )\w+')
    [ -z "$name" ] && continue
    refs=$(grep -rn "$name" apps/backend/src/ --include="*.ts" | grep -v "$file" | wc -l)
    [ "$refs" -eq 0 ] && echo "DEAD: $file → $name"
  done
```

Her dead export için:
- Neden dead (import eden yok, test de yok)
- Güvenle silinebilir mi?

**4.3 Duplicate logic tespiti — commerce'e özgü:**

Özellikle şunlara bak:

- Stok kontrolü birden fazla yerde mi? (checkout handler + cart handler + return handler?)
- Iyzico çağrısı birden fazla servis'te mi tekrarlıyor?
- `idempotencyKey` üretimi birden fazla yerde farklı formatla mı yapılıyor? (tutarsızlık = veri bütünlüğü riski)
- Order'ı fetch edip status kontrolü yapan kod bloğu kaç handler'da tekrar ediyor?

Her duplicate için: iki kaynak göster, shared utility olarak nasıl birleştirileceğini yaz.

**4.4 `checkout.service.ts` şişkinlik analizi:**

Bu dosya büyük ihtimalle en şişkin dosya. Şunu yap:

1. Her public/private method'u listele: isim + satır sayısı
2. 50 satırı geçen method'ları tespit et
3. Her şişkin method için extraction önerisi yaz — hangi logic nereye çıkarılmalı:
   - `CommissionCalculatorService` → komisyon hesabı
   - `StockReservationService` → rezervasyon yönetimi
   - `CheckoutValidationService` → cart validation
   - `InvoiceGeneratorService` → fatura oluşturma

Her extraction için method imzasını yaz (implementasyon değil):
```typescript
// Örnek:
@Injectable()
export class CommissionCalculatorService {
  calculate(params: CommissionParams): CommissionResult;
  applyXpDiscount(base: Types.Decimal128, xpBalance: number): Types.Decimal128;
}
```

**4.5 Mongoose model gereksiz field analizi:**

`Order` ve `Cart` schema'larında:

- Hiçbir handler'da `$set` ile yazılmayan field'lar var mı?
- Hiçbir handler'da query filtresi olarak kullanılmayan field'lar var mı?
- `OrderStatusHistory` ayrı koleksiyon mu, Order içinde embedded array mı? Hangisi daha uygun (sorgu pattern'ine göre analiz et)?

---

## Çıktı Formatı

Her tespit için:

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `path/to/file.ts:satır`
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

Tüm tespitleri şu sırayla sun:

1. **KRİTİK** — Çift ödeme riski, veri bütünlüğü bozulması, runtime crash (hemen düzelt)
2. **YÜKSEK** — Tip güvensizliği, compensating rollback eksikliği, state machine bypass (bu sprint)
3. **ORTA** — Duplicate logic, stub yönetimi, şişkin method'lar (sonraki sprint)
4. **DÜŞÜK** — Naming, style, minor refactor (backlog)

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- Iyzico entegrasyon kodu — ödeme gateway değişmez
- `VALID_TRANSITIONS` ağırlıkları — iş kararı
- `isGoOrder` / `goOrderMode` field isimleri — diğer modüller bağımlı
- Mevcut Mongoose index'leri — performans kararı, schema analizi yap ama index silme önerme
- `invoice-pdf.service.ts` PDFKit implementasyonu — e-fatura entegrasyonu ayrı sprint
- Return ve early-payment stub'larını implement etme — sadece durumunu raporla

---

## Son Not

Gördüğün her `console.log` bir bug'dır — Logger kullanılmalı.  
Gördüğün her `number` para hesabında bir bug'dır — Decimal128 kullanılmalı.  
Gördüğün her `any` bir teknik borçtur — önceliğini belirle.  
Gördüğün her boş catch bloğu potansiyel çift ödemedir — KRİTİK işaretle.
