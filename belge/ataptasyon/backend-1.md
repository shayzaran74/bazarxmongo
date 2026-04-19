BarterBorsa — Frontend × Backend Entegrasyon Implementation Planı

Kural: Backend kodu değiştirilmez. Yalnızca frontend belge/ kodları apps/frontend'e taşınır;
bozuk API path'leri proxy katmanında düzeltilir.
Her faz ayrı bir Gemini 2.0 Flash prompt olarak sunulur.


Sistematik Durum Tespiti
Backend Gerçek URL Yapısı
Global prefix → /api/v1
Backend port  → 3001

Gerçek endpoint örnekleri:
POST  http://localhost:3001/api/v1/auth/login
POST  http://localhost:3001/api/v1/auth/register
GET   http://localhost:3001/api/v1/users/me
GET   http://localhost:3001/api/v1/identity/profile
GET   http://localhost:3001/api/v1/identity/addresses
GET   http://localhost:3001/api/v1/catalog/products
GET   http://localhost:3001/api/v1/wallet
POST  http://localhost:3001/api/v1/cart/add
Frontend Servis Beklentisi (mevcut)
Frontend servisler /api/... kullanıyor:
POST  /api/auth/login          → /api/v1/auth/login    ✓ (devProxy ile fix edilir)
GET   /api/auth/me             → /api/v1/users/me      ⚠ PATH FARK
GET   /api/user/profile        → /api/v1/identity/profile ⚠ PATH FARK
GET   /api/addresses           → /api/v1/identity/addresses ⚠ PATH FARK
GET   /api/products            → /api/v1/catalog/products ⚠ PATH FARK
GET   /api/cart                → /api/v1/cart          ✓
GET   /api/wallet              → /api/v1/wallet        ✓
GET   /api/auth/csrf           → BACKEND'DE YOK ⛔ (BFF'de mock edilecek)
Kritik Gap'ler (Backend'e dokunmadan çözüm)
Frontend istiyorBackend gerçek pathÇözüm/api/auth/me/api/v1/users/meBFF rewrite rule/api/auth/csrfYokNitro server route ile mock/api/user/profile/api/v1/identity/profileBFF rewrite rule/api/user/change-password/api/v1/identity/profile/change-passwordBFF rewrite rule/api/addresses/api/v1/identity/addressesBFF rewrite rule/api/products/api/v1/catalog/productsBFF rewrite rule/api/products/:slug/api/v1/catalog/products/slug/:slugBFF rewrite rule/api/vendors/api/v1/vendors✓ direkt/api/brands/api/v1/catalog/brandsBFF rewrite rule/api/settingsYokNitro server route ile static mock/api/tiers/*/api/v1/xp/* (kısmen)BFF + mock/api/upload/api/v1/media/uploadBFF rewrite rule

Faz Haritası
FAZ 1 (BACKEND TARAF) ─── Nitro BFF + API Bridge (Path Rewrite + Mock Endpoints)
FAZ 2 (FRONTEND)      ─── nuxt.config + bağımlılıklar + temel altyapı
FAZ 3 (FRONTEND)      ─── Core stores (auth, cart, wishlist) + composables
FAZ 4 (FRONTEND)      ─── Layout sistemi (default, admin, vendor, auth)
FAZ 5 (FRONTEND)      ─── Auth akışı (Login, Register, Google OAuth, Forgot/Reset)
FAZ 6 (FRONTEND)      ─── Public sayfalar (Home, Products, Product Detail, Categories)
FAZ 7 (FRONTEND)      ─── Kullanıcı paneli (Profile, Wallet, Orders, Addresses)
FAZ 8 (FRONTEND)      ─── Vendor paneli (Dashboard, Products, Orders, Analytics)
FAZ 9 (FRONTEND)      ─── Admin paneli (Dashboard, Users, Products, Vendors)
FAZ 10 (FRONTEND)     ─── Barter/Auction/Lotteri + Chat + Bildirim sistemi
FAZ 11 (FRONTEND)     ─── Final polish (i18n, PWA, SEO, TypeCheck temizlik)