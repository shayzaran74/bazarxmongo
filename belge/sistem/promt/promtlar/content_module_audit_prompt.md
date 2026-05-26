# Content Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Content modülü (50 dosya, 10 Mongoose modeli) sistemin statik içerik katmanı — Banner, Policy, Help, Announcement, SEO. Finansal risk taşımıyor ama iki kritik nokta var:

**Önceki audit'ten taşınan bilgi:**
1. `SideAd` hem advertising modülünde hem content modülünde listeleniyor — önceki audit'te tespit edildi, sahiplik hâlâ belirsiz.
2. Frontend'de `siteSettings` Pinia store'u var ama backend'de hangi modülün hangi endpoint'ini serve ettiği belirsiz.

**Content modülüne özgü riskler:**
- Policy (KVKK, Kullanım Şartları) yanlış versiyon gösterimi — hukuki risk
- Help Center yetkilendirmesi (kullanıcı ≠ admin erişimi)
- SEO metadata: `slug` unique index olmadan duplicate slug
- `DynamicContent` — bu model ne içeriyor? Nerede kullanılıyor?
- `HomeBanner` — yayın tarihi kontrolü yapılıyor mu?

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/content/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · Redis  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)

**Mongoose modelleri (10 adet):**
```
HomeBanner          → Ana sayfa üst/alt banner (yayın tarihi, sıra, aktiflik)
HomeQuadCard        → Ana sayfa 4'lü kart bloğu
HomeQuadCardItem    → HomeQuadCard'ın alt öğeleri
HelpArticle         → Yardım merkezi makalesi
HelpCategory        → Yardım kategorisi (HelpArticle üst kategorisi)
Announcement        → Platform duyurusu (hedef kitle: tüm/vendor/kullanıcı)
Policy              → Yasal metin (KVKK, Kullanım Şartları, Gizlilik)
SeoMetadata         → Sayfa bazlı SEO (title, description, og:image, slug)
DynamicContent      → ? (ne için kullanılıyor — kodu oku)
SideAd              → ⚠️ ADVERTISING modülünde de var! Sahiplik belirsiz
```

**Frontend:**
```
Pinia store: siteSettings
Admin panel: içerik yönetimi (banner, duyuru, politika, yardım)
```

---

## Content İş Kuralları — Bunları Bilmeden İnceleme Yapma

### HomeBanner

```
Yayın parametreleri:
  startsAt / endsAt: Yayın zaman aralığı
  order: Görüntülenme sırası (1, 2, 3...)
  isActive: Manuel aktif/pasif
  targetUrl: Tıklanınca nereye?
  platform: 'ALL' | 'MOBILE' | 'DESKTOP'

İş kuralları:
  - Tarih gelince otomatik aktif olur (scheduler veya query filter)
  - endsAt geçince otomatik pasif (scheduler veya query filter?)
  - Aynı anda N tane banner gösterilir (N admin'den konfigüre edilebilir)
  - Sıralama: order field'ına göre ASC
```

### Policy (Yasal Metinler)

```
Policy tipleri:
  PRIVACY_POLICY      → Gizlilik Politikası
  TERMS_OF_USE        → Kullanım Şartları
  KVKK                → KVKK Aydınlatma Metni
  COOKIE_POLICY       → Çerez Politikası
  VENDOR_AGREEMENT    → Satıcı Sözleşmesi

Versiyonlama:
  Her Policy güncellendiğinde yeni versiyon oluşturulmalı
  Eski sürümler arşivlenmeli (kullanıcı hangi versiyonu kabul etti?)
  Aktif versiyon: isActive: true, sadece bir tane aktif olabilir

Risk:
  Policy güncellenince kullanıcı yeni versiyonu kabul etmeli mi?
  Backend bu kontrolü yapıyor mu?
```

### HelpArticle / HelpCategory

```
Help Center yapısı:
  HelpCategory (üst): "Sipariş", "Ödeme", "İade", "Hesap"
  HelpArticle (alt): kategori altında makaleler

Erişim:
  Herkes okuyabilir (auth gerekmez)
  Sadece admin oluşturabilir/güncelleyebilir

Özellikler:
  slug: URL-friendly başlık (/yardım/sipariş-nasıl-verilir)
  isPublished: yayınlanmış mı?
  viewCount: kaç kez görüntülendi?
  tags: arama için etiketler
```

### Announcement

```
Duyuru hedef kitlesi:
  ALL:    Tüm kullanıcılar
  USER:   Sadece alıcı kullanıcılar
  VENDOR: Sadece satıcılar
  ADMIN:  Sadece admin'ler

Duyuru görünürlüğü:
  startDate / endDate: Yayın aralığı
  priority: Önem sırası
  isRead: Kullanıcı başına okundu mu? (ayrı koleksiyon veya embedded?)
```

### SeoMetadata

```
SEO kaydı page bazlı:
  pageType: 'HOME' | 'CATEGORY' | 'LISTING' | 'BRAND' | 'STATIC'
  entityId: İlgili entity'nin ID'si (category, listing vb.)
  slug: URL segmenti (benzersiz olmalı)
  title: meta title (60 karakter?)
  description: meta description (160 karakter?)
  ogImage: Open Graph resmi

Slug kuralları:
  Benzersiz olmalı (unique index)
  Sadece küçük harf, rakam, tire
  Güncelleme: eski slug → 301 redirect (redirect kaydı gerekli mi?)
```

### DynamicContent

```
Bu model için belge yok. Kodu okuyarak öğren:
  - Hangi alanda kullanılıyor?
  - Schema'da ne var?
  - Kim yazıyor, kim okuyor?
  - HomeBanner veya HomeQuadCard ile overlap var mı?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 `SideAd` sahiplik sorunu (önceki audit'ten):**

```bash
grep -rn "SideAdSchema\|SideAd.*schema\|'SideAd'\|\"SideAd\"" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep "forFeature\|Schema\b" | grep -v "\.spec\."
```

- Content modülünde `SideAd` schema tanımlı mı?
- Advertising modülünde ayrıca tanımlı mı?
- Her ikisi de aynı `side_ads` koleksiyonuna yazıyor mu?
- Çözüm: advertising modülü sahibi olsun, content modülü import etsin — veya tam tersi. Hangisi daha mantıklı? Gerekçe yaz.

**1.2 `siteSettings` Pinia store → backend endpoint eşleşmesi:**

```bash
grep -rn "siteSettings\|site-settings\|site_settings\|getSiteSettings\|SiteSettings" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\."
```

- Backend'de `/site-settings` veya benzeri endpoint var mı?
- Yoksa frontend bu store'u nasıl dolduruyor?
- `DynamicContent` bu role mi hizmet ediyor?

**1.3 Policy versiyonlama mekanizması:**

```bash
grep -rn "Policy\|policy\|PRIVACY_POLICY\|TERMS_OF_USE\|KVKK\|version\|isActive.*policy\|policy.*isActive" \
  apps/backend/src/modules/content/ \
  --include="*.ts" \
  | grep -v "schema\|\.spec\."
```

- `Policy` schema'sında `version` field'ı var mı?
- `isActive` field'ı var mı? Sadece bir aktif olabilir mi (unique constraint)?
- Eski versiyonlar arşivleniyor mu?
- Kullanıcı hangi versiyonu kabul etti takibi var mı? (identity modülü veya ayrı koleksiyon)

**1.4 HomeBanner yayın tarihi yönetimi:**

```bash
grep -rn "HomeBanner\|homeBanner\|startsAt\|endsAt\|banner.*schedule\|schedule.*banner\|banner.*active" \
  apps/backend/src/modules/content/ \
  --include="*.ts" \
  | grep -v "schema\|\.spec\."
```

- Banner yayın aralığı (`startsAt`/`endsAt`) query filter'a dahil mi?
- `GET /banners` endpoint'inde "şu an aktif banner" filtresi:
  ```mongodb
  { isActive: true, startsAt: { $lte: now }, endsAt: { $gte: now } }
  ```
  Bu var mı?
- Scheduler ile banner otomatik aktif/pasif yapılıyor mu? Yoksa query filter yeterli mi?

**1.5 `DynamicContent` amacı:**

```bash
grep -rn "DynamicContent\|dynamicContent\|dynamic_content" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "\.spec\."
```

- Schema'da hangi field'lar var?
- Kim yazıyor, kim okuyor? Endpoint var mı?
- `siteSettings` store'una veri sağlıyor mu?
- HomeBanner, HomeQuadCard ile overlap var mı?
- Dead model mi?

**1.6 Modül bağımlılık grafiği:**

- `content.module.ts` hangi modüllere bağımlı?
- Hangi modüller content'e bağımlı? (`SeoMetadata` için catalog?)
- Redis cache kullanılıyor mu? (içerik sık değişmez, cache uygun)
- Admin panelinden content CRUD yapılabiliyor mu? Endpoint'ler tanımlı mı?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm content klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/content/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| dynamicContent.schema.ts | ? | `content: any` | ORTA | `Record<string, unknown>` |
| seo-metadata.handler.ts | ? | `metadata: any` | ORTA | `SeoMetadataDto` |

Risk seviyeleri:
- `YÜKSEK`: Policy response `any` → yanlış hukuki metin gösterilebilir
- `ORTA`: SEO metadata `any` → eksik field, meta tag render edilmez
- `DÜŞÜK`: Display-only content, cascade yok

**Adım 3:** Policy schema tam tip tanımı:

```typescript
export const POLICY_TYPES = [
  'PRIVACY_POLICY',
  'TERMS_OF_USE',
  'KVKK',
  'COOKIE_POLICY',
  'VENDOR_AGREEMENT',
] as const;

export type PolicyType = typeof POLICY_TYPES[number];

interface PolicyDocument {
  _id: Types.ObjectId;
  type: PolicyType;            // string değil — enum
  title: string;
  content: string;             // HTML veya Markdown
  version: string;             // semver: "1.0.0", "1.1.0"
  isActive: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Kısıt: aynı type için sadece bir isActive=true olabilir
// Index: { type: 1, isActive: 1 }
```

**Adım 4:** SeoMetadata slug doğrulaması:

```typescript
// Slug format doğrulaması:
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// Kötü:
slug: string;  // herhangi bir string

// Doğru:
// 1. DTO'da @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
// 2. Schema'da { type: String, unique: true, lowercase: true, trim: true }
// 3. Unique index: { slug: 1 } unique: true
```

**Adım 5:** `HomeBanner` platform enum tipi:

```typescript
// Kötü:
platform: string;  // 'ALL', 'MOBILE', 'DESKTOP' veya herhangi bir string

// Doğru:
export const BANNER_PLATFORMS = ['ALL', 'MOBILE', 'DESKTOP'] as const;
export type BannerPlatform = typeof BANNER_PLATFORMS[number];

interface HomeBannerDocument {
  platform: BannerPlatform;   // string değil
  imageUrl: string;
  targetUrl?: string;
  order: number;
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
}
```

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Policy type dallanması:**
```typescript
// Kötü:
if (type === 'PRIVACY_POLICY') { ... }
else if (type === 'TERMS_OF_USE') { ... }
else if (type === 'KVKK') { ... }
// → string switch veya POLICY_TYPES array ile validate et
// Tip: PolicyType enum ile handler parametresini tiplendir
```

**Pattern B — Announcement hedef kitlesi dallanması:**
```typescript
// Kötü — notification servise göndermede:
if (announcement.target === 'ALL') {
  await notificationService.sendToAll(announcement);
} else if (announcement.target === 'VENDOR') {
  await notificationService.sendToVendors(announcement);
} else if (announcement.target === 'USER') {
  await notificationService.sendToUsers(announcement);
}
// → AnnouncementTargetStrategy interface:
interface IAnnouncementTarget {
  getRecipients(): Promise<Types.ObjectId[]>;
}
```

**Pattern C — SEO metadata pageType dallanması:**
```typescript
// Kötü:
if (pageType === 'LISTING') {
  meta.title = `${listing.title} - BazarX`;
  meta.description = listing.description.slice(0, 160);
} else if (pageType === 'CATEGORY') {
  meta.title = `${category.name} | BazarX`;
} else if (pageType === 'HOME') {
  meta.title = 'BazarX — Türkiye\'nin Takas ve Alışveriş Platformu';
}
// → SEO builder pattern:
interface ISeoBuilder {
  buildTitle(entity: unknown): string;
  buildDescription(entity: unknown): string;
}
```

**Pattern D — Banner aktiflik filtrelemesi:**
```typescript
// Kötü — isActive tek başına yeterli mi?
await HomeBanner.find({ isActive: true });
// → Tarih aralığı filtrelemesi de gerekli:
const now = new Date();
await HomeBanner.find({
  isActive: true,
  $or: [
    { startsAt: { $exists: false } },
    { startsAt: { $lte: now } }
  ],
  $or: [
    { endsAt: { $exists: false } },
    { endsAt: { $gte: now } }
  ]
});
// Bu sorgu doğru mu? $or iki kez kullanılamaz — $and gerekli:
await HomeBanner.find({
  isActive: true,
  $and: [
    { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
    { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
  ]
}).sort({ order: 1 });
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Policy aktif versiyon güncelleme race condition:**
```typescript
// Kötü — "önceki aktifi pasif yap, yeniyi aktif yap":
await Policy.updateMany({ type, isActive: true }, { isActive: false });
await Policy.create({ type, content, isActive: true, version: newVersion });
// → İki adım arasında iki eş zamanlı istek → iki aktif policy

// Doğru — transaction ile:
await session.withTransaction(async () => {
  await Policy.updateMany({ type, isActive: true }, { isActive: false }, { session });
  await Policy.create([{ type, content, isActive: true, version: newVersion }], { session });
});
```

**Antipattern B — Slug duplicate kontrolü olmadan create:**
```typescript
// Kötü:
await SeoMetadata.create({ slug: dto.slug, ... });
// → MongoDB unique index hata fırlatır ama generic error olarak görünür

// Doğru:
const existing = await SeoMetadata.findOne({ slug: dto.slug });
if (existing) {
  throw new ConflictException({ code: 'SLUG_ALREADY_EXISTS', slug: dto.slug });
}
await SeoMetadata.create({ slug: dto.slug, ... });
```

**Antipattern C — DynamicContent cache invalidation:**
```typescript
// DynamicContent değiştirilince Redis cache temizleniyor mu?
// Kötü:
await DynamicContent.updateOne({ key }, { value: newValue });
// Cache temizlenmedi → frontend eski veriyi görüyor

// Doğru:
await DynamicContent.updateOne({ key }, { value: newValue });
await this.redis.del(`dynamic_content:${key}`);
// Veya tag-based invalidation
```

**Antipattern D — HelpArticle viewCount race condition:**
```typescript
// Kötü — iki adımlı:
const article = await HelpArticle.findById(id);
await HelpArticle.updateOne({ _id: id }, { viewCount: article.viewCount + 1 });
// → Atomic:
await HelpArticle.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
```

**3.3 Policy versiyonlama hukuki doğruluk:**

```
KVKK ve Kullanım Şartları güncellenince kullanıcı yeni versiyonu kabul etmeli mi?

Kontrol:
  □ Policy schema'sında version field var mı? (örn: "2.0.0")
  □ User.acceptedPolicyVersions veya benzeri field var mı?
  □ Kullanıcı eski versiyonu kabul etti, yeni versiyon yayınlandı →
    kullanıcı sistemi kullanmaya devam edince uyarı çıkıyor mu?
  □ Bu kontrol identity modülünde mi, content modülünde mi?
  □ Hiç implement edilmemiş mi?

Bu kritik hukuki gereklilik — Türkiye'de KVKK uyumluluğu için.
Yoksa: siteSettings veya auth interceptor'da eklenebilir.
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 `DynamicContent` kullanım analizi:**

```bash
grep -rn "DynamicContent\|dynamicContent\|dynamic_content" \
  apps/backend/src/ \
  --include="*.ts" \
  | grep -v "schema\|module\|import\|\.spec\."
```

- Gerçekten yazılıyor mu?
- Hangi amaçla kullanılıyor?
- `siteSettings` Pinia store'unu besliyor mu?
- Dead model ise: kaldır

**4.2 Dead model tespiti:**

```bash
for model in HomeBanner HomeQuadCard HomeQuadCardItem HelpArticle HelpCategory Announcement Policy SeoMetadata DynamicContent; do
  echo "=== $model ==="
  grep -rn "$model\." apps/backend/src/ --include="*.ts" \
    | grep -v "schema\|module\|import\|type\b\|interface\|\.spec\." | wc -l
done
```

Özellikle:
- `HomeQuadCardItem` — `HomeQuadCard` ile birlikte kullanılıyor mu? Embedded mi ayrı koleksiyon mu?
- `DynamicContent` — yukarıda zaten soruldu

**4.3 Admin content CRUD endpoint'leri:**

```bash
grep -rn "controller.*content\|content.*controller\|@Controller.*content\|@Post.*banner\|@Get.*banner\|@Put.*policy\|@Get.*help" \
  apps/backend/src/modules/content/ \
  --include="*.ts"
```

- Her model için admin CRUD endpoint'leri var mı?
- `HomeBanner` create/update/delete: admin only mu kontrol ediliyor?
- `Policy` create: Super Admin only mu?
- `HelpArticle` create/update: Admin or Super Admin?

**4.4 Redis cache yapısı:**

```bash
grep -rn "redis\|Redis\|cache\|Cache\|setex\|get.*content\|content.*get.*redis" \
  apps/backend/src/modules/content/ \
  --include="*.ts"
```

Content modülü için Redis cache var mı?

Banner, Policy, Help gibi içerikler sık değişmez ama sık okunur. Cache stratejisi:
```
HomeBanner:      Redis TTL: 5 dakika (banner değişirse admin cache temizler)
Policy:          Redis TTL: 1 saat (hukuki metin nadiren değişir)
HelpArticle:     Redis TTL: 15 dakika
Announcement:    Redis TTL: 2 dakika (acil duyuru olabilir)
SeoMetadata:     Redis TTL: 30 dakika
```

Bu cache yapısı var mı, yoksa her request MongoDB'ye mi gidiyor?

**4.5 `content.module.ts` sağlık kontrolü:**

- Providers listesinde kayıtlı ama hiç inject edilmeyen servis var mı?
- 50 dosya için `imports` listesi gereksiz geniş mi?
- `SideAd` bu modüldeyse advertising'e taşıma planı nedir?

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/content/path/to/file.ts:satır`
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

1. **KRİTİK** — Policy aktif versiyon race condition (iki aktif policy olabilir → kullanıcıya yanlış hukuki metin gösterilir), Policy versiyonlama KVKK uyumu eksikliği (kullanıcı yeni versiyonu kabul etmiyor)
2. **YÜKSEK** — `SideAd` çift modül (advertising + content, önceki audit'ten taşındı), Slug unique index eksikliği (duplicate slug → 404 veya yanlış sayfa), Banner tarih filtresi `$or` çift kullanımı (MongoDB sorgu hatası)
3. **ORTA** — `DynamicContent` dead model (schema var, kullanım yok), Redis cache yok (her request MongoDB), HelpArticle viewCount non-atomic
4. **DÜŞÜK** — Policy type string yerine enum, platform enum tipi, admin endpoint yetkilendirme tutarsızlığı

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **Policy içerikleri** (KVKK metni vb.) — hukuki içerik, değiştirme
- **Banner sıralaması** — iş kararı
- **Announcement hedef kitlesi enum değerleri** — frontend bağımlı
- **SEO meta tag uzunlukları (60/160 karakter)** — SEO best practice, iş kararı
- **HomeBanner/HomeQuadCard ayrımı** — tasarım kararı, birleştirme önerme
- **SideAd sahiplik kararı** — advertising'e taşıma önerisi yap ama implement etme (büyük refactor)

---

## Son Not

Content modülünün en kritik riski teknik değil, hukuki:

**Policy race condition** — Admin yeni KVKK metnini yayınladı. Bir kullanıcı tam o anda eski metni okudu ve kabul etti. Aynı anda iki aktif policy varsa, eski metni kabul eden kullanıcı güncel KVKK'yı kabul etmemiş demektir. MongoDB transaction ile bu kapatılır.

**KVKK versiyon takibi yok** — KVKK mevzuatı güncellendi, platform yeni metin yayınladı. Eski kullanıcı tekrar kabul etmeden sistemi kullanmaya devam ediyor. `User.acceptedPolicyVersions` veya benzeri alan olmadan bunu takip etmek imkânsız. Türkiye'de KVKK uyumu için bu gerekli.

Bu ikisi önce raporla.
