# Gemini Prompt — Swagger API Dokümantasyonu (Tüm Controller'lar)

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS backend developer'sın. BarterBorsa projesindeki TÜM controller dosyalarına
Swagger/OpenAPI dekoratörleri ekleyeceksin.

PROJE: NestJS 10+ / Fastify / TypeScript strict mode
SWAGGER: @nestjs/swagger paketi zaten kurulu, main.ts'de SwaggerModule setup edilmiş

KULLANILACAK DEKORATÖRLER:
- @ApiTags('TagName') — controller seviyesinde, modül gruplama
- @ApiOperation({ summary: '...', description: '...' }) — her endpoint için
- @ApiResponse({ status: 200, description: '...', type: ResponseDto }) — başarılı response
- @ApiResponse({ status: 400, description: 'Geçersiz istek' }) — hata response'ları
- @ApiResponse({ status: 401, description: 'Yetkilendirme gerekli' })
- @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
- @ApiResponse({ status: 404, description: 'Bulunamadı' })
- @ApiResponse({ status: 409, description: 'Çakışma' })
- @ApiBearerAuth() — JWT gerektiren endpoint'ler (controller veya method seviyesinde)
- @ApiParam({ name: 'id', description: '...' }) — URL parametreleri
- @ApiQuery({ name: 'page', required: false, description: '...' }) — query parametreleri
- @ApiBody({ type: CreateXDto }) — request body
- @ApiProperty() — DTO property'leri (zaten class-validator ile tanımlı, ek olarak Swagger açıklaması ekle)

KURALLAR:
1. Mevcut controller kodunu DEĞİŞTİRME — sadece Swagger dekoratörleri EKLE
2. Mevcut import'ları koru, yeni import'ları en üste ekle
3. @ApiTags() Türkçe değil İngilizce olacak (Swagger UI dili İngilizce)
4. @ApiOperation summary İngilizce, description Türkçe olabilir
5. `any` tipi YASAK
6. Her controller dosyasının TAM GÜNCELLENMİŞ halini yaz (sadece eklenen satırlar değil, tüm dosya)
7. @Public() olan endpoint'lere @ApiBearerAuth() EKLEME
8. @Roles() olan endpoint'lere @ApiBearerAuth() ekle
9. Paginated endpoint'lere @ApiQuery() ile page, limit, sortBy, sortOrder ekle

TAG İSİMLENDİRME:
- Identity: 'Auth', 'Users', 'Profile', 'Addresses'
- Vendor: 'Companies', 'Vendors', 'Vendor Profile', 'Vendor Settings', 'Vendor Bank Accounts', 'Vendor Followers', 'Ecosystems', 'Vendor Admin'
- Catalog: 'Listings'
- Inventory: 'Inventory'
- Commerce: 'Cart', 'Checkout', 'Orders'
- Barter: 'Barter', 'Auctions'
- Communication: 'Chat', 'Notifications', 'Complaints', 'Communication Admin'
- Content: 'Home Banners', 'Help Center', 'Announcements', 'Policies', 'Dynamic Content', 'SEO', 'Content Admin'
- Advertising: 'Ad Campaigns', 'Ad Slots', 'Side Ads', 'Advertising Admin'
- Loyalty: 'XP & Loyalty'
```

### GÖREV

```
Aşağıda vereceğim her controller dosyasına Swagger dekoratörleri ekle.

Her dosya için:
1. Dosyanın mevcut içeriğini oku
2. @ApiTags() controller class'ına ekle
3. @ApiBearerAuth() gerekiyorsa ekle (JWT gerektiren controller'lar)
4. Her metoda @ApiOperation() ekle
5. Her metoda uygun @ApiResponse() ekle (200, 201, 400, 401, 404 vs.)
6. URL parametresi varsa @ApiParam() ekle
7. Query parametresi varsa @ApiQuery() ekle
8. Request body varsa @ApiBody() ekle
9. Dosyanın TAM GÜNCELLENMİŞ halini yaz

ÖNEMLİ: Mevcut iş mantığını, guard'ları, decorator'ları DEĞİŞTİRME.
Sadece Swagger dekoratörlerini EKLE.
```

### FORMAT

Her dosya için şu formatı kullan:

```
=== DOSYA: [tam path] ===

[dosyanın tam güncellenmiş içeriği — Swagger dekoratörleri eklenmiş hali]

=== DOSYA SONU ===
```

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

36 controller var — 4 parçada ver:

### PARÇA 1: Identity + Vendor (13 controller)
Prompt'u yapıştırdıktan sonra şu komutun çıktısını yapıştır:
```bash
echo "=== IDENTITY CONTROLLERS ===" && \
cat apps/backend/src/modules/identity/infrastructure/auth/auth.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/identity/infrastructure/auth/google-oauth.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/identity/presentation/user.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/identity/presentation/profile.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/identity/presentation/address.controller.ts && \
echo "=== VENDOR CONTROLLERS ===" && \
cat apps/backend/src/modules/vendor/presentation/company.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/vendor/presentation/vendor.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/vendor/presentation/vendor-profile.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/vendor/presentation/vendor-settings.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/vendor/presentation/vendor-bank-account.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/vendor/presentation/vendor-follower.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/vendor/presentation/ecosystem.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/vendor/presentation/vendor-admin.controller.ts
```
"Bu controller dosyalarına Swagger dekoratörlerini ekle" de.

### PARÇA 2: Catalog + Inventory + Commerce (5 controller)
```bash
echo "=== CATALOG + INVENTORY + COMMERCE ===" && \
cat apps/backend/src/modules/catalog/infrastructure/http/listing.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/inventory/infrastructure/http/inventory.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/presentation/cart.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/presentation/checkout.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/commerce/presentation/order.controller.ts
```

### PARÇA 3: Barter + Communication + Content (14 controller)
```bash
echo "=== BARTER ===" && \
cat apps/backend/src/modules/barter/infrastructure/http/barter.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/barter/infrastructure/http/auction.controller.ts && \
echo "=== COMMUNICATION ===" && \
cat apps/backend/src/modules/communication/presentation/controllers/chat.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/communication/presentation/controllers/notification.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/communication/presentation/controllers/complaint.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/communication/presentation/controllers/communication-admin.controller.ts && \
echo "=== CONTENT ===" && \
cat apps/backend/src/modules/content/presentation/home-banner.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/content/presentation/help.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/content/presentation/announcement.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/content/presentation/policy.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/content/presentation/dynamic-content.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/content/presentation/seo.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/content/presentation/content-admin.controller.ts
```

### PARÇA 4: Advertising + Loyalty (5 controller)
```bash
echo "=== ADVERTISING ===" && \
cat apps/backend/src/modules/advertising/presentation/ad-campaign.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/advertising/presentation/ad-campaign-vendor.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/advertising/presentation/ad-slot.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/advertising/presentation/advertising-admin.controller.ts && \
echo "---SEPARATOR---" && \
cat apps/backend/src/modules/advertising/presentation/side-ad.controller.ts && \
echo "=== LOYALTY ===" && \
cat apps/backend/src/modules/loyalty/presentation/xp.controller.ts
```

Her parçada system prompt'u TEKRAR VER.
Her parça bitince `pnpm build` çalıştır — hata varsa Gemini'ye gönder.

Tüm parçalar bittikten sonra:
```bash
cd apps/backend && pnpm start:dev
# Tarayıcıda: http://localhost:3001/api/docs
```
Swagger UI'da tüm endpoint'ler tag'larıyla gruplandırılmış görünmeli.

---

SWAGGER TAMAMLANDIKTAN SONRA:
Claude'a "Swagger tamamlandı, test prompt'unu hazırla" de.
Kritik akışlar (auth, checkout, barter accept, payment) için test prompt'u hazırlayacak.
