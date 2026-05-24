# Catalog Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Sen bu projenin baş mimarısın. Catalog modülünü bugün ilk kez görüyor değilsin — sistemin tamamını biliyorsun. Görüşlerini veri destekli, doğrudan ve net olarak ifade et. "Belki", "genellikle", "önerilir" gibi muğlak ifadeler kullanma. Her tespitte kaynak dosyayı ve satır bağlamını belirt.

---

## Sistem Bağlamı

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · pnpm workspaces  
**Proje yolu:** `apps/backend/src/modules/catalog/`  
**Pattern zorunlulukları:**
- Controller → CommandBus/QueryBus → Handler → Repository (katman atlamak yasak)
- Para değerleri: `Decimal128` (JS `number` yasak)
- Log: `Logger` (`console.*` yasak)
- Tip: strict TypeScript (`any` yasak)
- Business logic: domain entity'de, handler'da değil

**Catalog modülünün rolleri:**
- `CatalogProduct` = platform master ürün kaydı
- `Listing` = vendor'ın fiyat/stok kaydı (CatalogProduct'a bağlı)
- `Category` = ağaç yapısı (parentId ile self-referential)
- `Brand` = marka, `BrandViolation` = ihlal kaydı
- `Campaign` = ürün bazlı kampanya
- `BuyBox` = aynı ürünü listeleyen vendor'lar arası sıralama skoru

**Buybox iş kuralları (bunları bilmeden refactor etme):**
- Aynı CatalogProduct'ı listeleyen vendor'lardan BuyBox skoru hesaplanır
- Skor bileşenleri: fiyat+kargo %40 · mağaza puanı %30 · kargoya verme süresi %20 · stok güvenilirliği %10
- En yüksek skorlu listing "Sepete Ekle" butonuna atanır
- Diğerleri "X satıcıdan daha ucuzu" bölümünde listelenir

**Listing flag'leri (tüm flag'ler aktif — bunlara dokunma):**
- `isFeatured` → ✨ Featured bölümü (ana sayfada önce sıralanır)
- `isFlashSale` → ⚡ Flash Sale bölümü
- `isSpecialOffer` → 🔥 Özel Fırsat bölümü
- `isActive` → genel aktiflik

**Commerce bağımlılığı:**
- `checkout.service.ts` Listing'den fiyat, stok ve `maxOrderQtyPerDealer` okur
- Listing silinmesi veya pasif edilmesi açık CartItem'ları etkiler — cascade rule var

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Aşağıdaki soruları **kod okuyarak** yanıtla. Her yanıta kanıt dosya yolu ekle.

**1.1 Katman ihlalleri:**
Hangi controller doğrudan Mongoose model inject ediyor? Hangi handler repository yerine başka handler çağırıyor? Hangi servis domain entity bypass ederek doğrudan DB yazıyor?

**1.2 Entity vs Schema ayrımı:**
`CatalogProduct` domain entity'si var mı, yoksa sadece Mongoose document mu kullanılıyor? `Listing` için durum ne? Entity varsa domain logic nerede — entity method'larında mı, handler'larda mı?

**1.3 Repository pattern uyumu:**
Her Mongoose model için bir repository var mı? Repository interface'i (soyutlama) tanımlı mı yoksa concrete implementation doğrudan inject mi ediliyor? `MongoCatalogProductRepository`, `MongoListingRepository` ayrı dosyalar mı?

**1.4 BuyBox hesaplama yeri:**
BuyBox skoru nerede hesaplanıyor — scheduled job mu, listing kayıt/güncelleme anında mı, query zamanında mı? Hesaplama domain servisinde mi, handler'da mı? Atomic mi yoksa race condition riski var mı?

**1.5 Modül bağımlılık grafiği:**
`catalog.module.ts`'in import ettiği modüller neler? Catalog dışından catalog'a hangi modüller doğrudan depend ediyor (circular dependency riski)? `imports` listesi `exports` ile tutarlı mı?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm `catalog/` altındaki `.ts` dosyalarını tara:

```bash
grep -rn ": any\|as any\|<any>\| any " apps/backend/src/modules/catalog/ \
  --include="*.ts" \
  | grep -v "// eslint-disable\|\.spec\.\|\.d\."
```

**Adım 2:** Her `any` bulgusu için şu tabloyu doldur:

| Dosya | Satır | Kullanım | Risk Seviyesi | Doğru Tip |
|---|---|---|---|---|
| listing.handler.ts | 47 | `data: any` | YÜKSEK | `CreateListingDto` |
| ... | ... | ... | ... | ... |

**Risk seviyeleri:**
- `YÜKSEK`: Runtime crash potansiyeli var (undefined property erişimi, Decimal128 yerine number kullanımı)
- ORTA: Tip güvensizliği var ama crash düşük ihtimal
- DÜŞÜK: Geçici cast, bağımsız scope

**Adım 3:** Her `YÜKSEK` riskli `any` için tam tip tanımını yaz. Sadece "bunu interface yap" deme — interface'i yaz:

```typescript
// Örnek:
interface CreateListingInput {
  catalogProductId: Types.ObjectId;
  vendorId: Types.ObjectId;
  price: Types.Decimal128;       // number değil
  stock: number;
  maxOrderQtyPerDealer?: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  isSpecialOffer: boolean;
}
```

**Adım 4:** `Listing`/`CatalogProduct` response shape'lerinde `any` varsa — özellikle query handler'larının döndüğü objeler — tam tip tanımını yaz.

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

Şu pattern'i ara:

```typescript
// Kötü pattern — bulunca raporla:
if (listing.type === 'A') {
  // ...
} else if (listing.type === 'B') {
  // ...
} else if (listing.type === 'C') {
  // ...
}
```

Her bulgu için:
- Nerede olduğunu söyle (dosya + satır)
- Kaç dal var
- Domain enum veya strategy pattern ile nasıl yerine konulabileceğini göster (sadece söyleme, kodu yaz)

**3.2 try/catch antipattern tespiti:**

Şu antipattern'leri ara:

```typescript
// Antipattern A — sessiz yutma:
try { ... } catch (e) { }          // hata yutuldu, log yok

// Antipattern B — generic rethrow:
try { ... } catch (e) { throw e; } // try/catch gereksiz

// Antipattern C — kontrolsüz re-throw:
try { ... } catch (e) { throw new Error(e) } // tip bilgisi kayboldu

// Antipattern D — iç içe try/catch:
try {
  try { ... } catch { ... }
} catch { ... }
```

Her bulgu için:
- Dosya + satır
- Hangi antipattern
- Doğru implementasyon (kodu yaz)

**3.3 Business rule sızıntısı:**

Business logic controller veya repository'de mi? Kontrol et:

- Controller'da fiyat hesabı var mı?
- Repository'de validation var mı?
- Handler'da domain rule'lar kodlanmış mı (entity yerine)?

Her sızıntıyı raporla. Sızıntıyı doğru yere taşıyan kodu yaz.

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead code tespiti:**

```bash
# Referans verilmeyen export'lar:
grep -rn "export.*function\|export.*class\|export.*const" \
  apps/backend/src/modules/catalog/ --include="*.ts" | \
  while read line; do
    # Her export'un başka bir yerde import edilip edilmediğini kontrol et
  done
```

Tespit ettiğin dead code için:
- Dosya adı
- Export adı
- Neden dead olduğuna dair kanıt ("X dosyasında import edilmiyor")
- Kaldırılabilir mi yoksa gelecekte kullanılacak mı (yoruma bak)

**4.2 Duplicate logic tespiti:**

Birden fazla handler/servis'te tekrar eden kod bloklarını bul. Özellikle:
- Listing validasyonu birden fazla yerde mi yapılıyor?
- BuyBox tetiklemesi birden fazla handler'da mı tekrarlanıyor?
- Slug üretimi/normalize etme birden fazla yerde mi?

Her duplicate için: iki kaynak dosyayı göster, shared utility/domain service olarak nasıl birleştirileceğini göster.

**4.3 Gereksiz dosya tespiti:**

Şunları ara:
- Sadece re-export yapan index dosyaları (gereksiz katman)
- Body'si boş veya tek satır olan handler'lar (stub kalmış)
- Import edilmeyen util dosyaları
- Yorum satırı haline gelmiş eski implementasyonlar

**4.4 Mongoose model şişkinliği:**

`CatalogProduct` veya `Listing` schema'sında:
- Hiçbir handler/repository'de query edilmeyen field'lar var mı?
- Her field için: nerede yazılıyor, nerede okunuyor — ikisi de yoksa kaldır öner

---

## Çıktı Formatı

Her bölüm için şu yapıyı kullan:

```
## [BÖLÜM X.Y] — [Başlık]

**Tespit:** [Ne buldun — dosya:satır ile]

**Sorun:** [Neden sorun — tek cümle]

**Düzeltme:**
[Kod bloğu — tam, çalışır, copy-paste edilebilir]

**Etki:** [Bu düzeltme başka neyi etkiler — cascade]
```

---

## Sınırlar — Bunlara Dokunma

- `isFeatured`, `isFlashSale`, `isSpecialOffer`, `isActive` flag'leri — aktif, dokunma
- BuyBox skor **ağırlıkları** (%40/%30/%20/%10) — iş kararı, değiştirme
- Listing → Commerce bağımlılığı — cascade kuralları iş kuralı
- `Decimal128` kullanımı — zaten doğru, bozma
- Herhangi bir migration — schema değişikliği önerirsen migration'ı da yaz ama eski field'ı hemen silme

---

## Önceliklendirme

Tespitlerini şu sırada sun:

1. **Kritik** — Runtime crash riski veya veri bütünlüğü sorunu (hemen düzelt)
2. **Yüksek** — Tip güvensizliği veya iş kuralı sızıntısı (bu sprint)
3. **Orta** — Duplicate logic, gereksiz dosya (sonraki sprint)
4. **Düşük** — Style, naming, minor refactor (backlog)

Her öncelik seviyesi için toplam bulgu sayısını belirt.

---

## Son Not

Kod okumadan tahmin yürütme. Her tespit koda dayalı olsun. Bir şeyi göremiyorsan "X dosyasını görmem gerekiyor" de — yokmuş gibi davranma.
