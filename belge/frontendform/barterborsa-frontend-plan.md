# BarterBorsa — Frontend Yeniden Yazma Planı (10 Bölüm)

> Her yeni konuşmada `barterborsa-final-summary.md` + bu dosyayı paylaş.
> "Bölüm N'den başlayalım" de — Claude detaylı prompt hazırlar, Gemini implemente eder.

---

## Genel Kurallar (Tüm Bölümler İçin)

```
✅ TypeScript strict — `any` YASAK (0 tolerans)
✅ Nuxt 3 + Vue 3 <script setup lang="ts"> + Tailwind CSS + Pinia
✅ SSR-safe: onMounted/onBeforeMount içinde browser API, process.client guard
✅ useApi composable — tip güvenli, base URL çevresel değişkenden
✅ BFF proxy: frontend/server/api/v1/[...].ts → backend :3001
✅ Cookie-to-bearer dönüşümü BFF'de (token frontend'e asla açık gelmez)
✅ Tüm API response'lar { success, data, meta?, timestamp } envelope
✅ Hata yakalama: useApi hata → toast + fallback UI
✅ i18n hazırlığı: tüm string'ler ayrı dosyada (başlangıçta sadece TR)
✅ Her bölüm sonunda: pnpm build + pnpm typecheck + 0 any + 0 warning
```

---

## Bölüm 1 — Proje İskeleti + Layout + Auth Altyapısı

**Hedef:** Nuxt 3 projesi ayağa kalksın, layout'lar çalışsın, auth akışı (Google OAuth2) uçtan uca tamamlansın.

### Çıktılar

```
frontend/
├── nuxt.config.ts
├── tailwind.config.ts
├── app.vue
├── error.vue                          # Global hata sayfası
├── layouts/
│   ├── default.vue                    # Header + Footer + slot
│   ├── auth.vue                       # Minimal layout (login/register)
│   ├── vendor.vue                     # Vendor panel layout (sidebar + topbar)
│   └── admin.vue                      # Admin panel layout
├── middleware/
│   ├── auth.global.ts                 # Her route'ta session kontrolü
│   └── guest.ts                       # Zaten login ise redirect
├── plugins/
│   ├── api.ts                         # useApi provider (baseURL, interceptor)
│   └── toast.ts                       # Toast notification provider
├── composables/
│   ├── useApi.ts                      # Tip güvenli fetch wrapper
│   ├── useAuth.ts                     # login, logout, refresh, user state
│   └── useToast.ts                    # Toast mesajları
├── stores/
│   └── auth.ts                        # Pinia — user, token, isAuthenticated
├── components/
│   ├── app/
│   │   ├── AppHeader.vue              # Logo + nav + user menu + search bar
│   │   ├── AppFooter.vue              # Link grupları + copyright
│   │   ├── AppSidebar.vue             # Vendor/Admin sidebar
│   │   └── AppToast.vue               # Toast container
│   └── ui/
│       ├── UiButton.vue               # Variant: primary, secondary, ghost, danger
│       ├── UiInput.vue                # Label, error state, prefix/suffix slot
│       ├── UiModal.vue                # Teleport to body, ESC close, backdrop
│       ├── UiDropdown.vue             # Trigger + panel, click outside close
│       ├── UiAvatar.vue               # İnisyal fallback, boyut prop
│       ├── UiSpinner.vue              # Loading indicator
│       ├── UiBadge.vue                # Status badge (renk prop)
│       └── UiEmptyState.vue           # İkon + mesaj + aksiyon slot
├── server/
│   └── api/
│       └── v1/
│           └── [...].ts               # BFF catch-all proxy
├── types/
│   ├── api.ts                         # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   ├── auth.ts                        # User, LoginResponse, TokenPair
│   └── common.ts                      # PaginationMeta, SortDirection, BaseEntity
└── assets/
    └── css/
        └── main.css                   # Tailwind directives + custom utilities
```

### Detaylar

**useApi.ts:**
- `$fetch` wrapper, generic tip: `useApi<T>(url, options): Promise<ApiResponse<T>>`
- Base URL: `useRuntimeConfig().public.apiBase` (SSR'da server-side, CSR'da BFF proxy)
- Otomatik `Authorization: Bearer` header ekleme (cookie'den)
- 401 → refresh token dene → başarısız → logout + /auth/login redirect
- Request/response interceptor hook'ları

**BFF Proxy ([...].ts):**
- Gelen cookie'den token çıkar → `Authorization: Bearer {token}` header ekle
- `event.node.req` pipe → backend :3001
- CORS yok (aynı origin)

**Auth Store (Pinia):**
- State: `user: User | null`, `isAuthenticated: boolean`
- Actions: `login()` → Google OAuth2 popup/redirect, `logout()`, `refreshSession()`, `fetchUser()`
- SSR-safe: `useRequestHeaders(['cookie'])` ile server-side session

**Auth Middleware (auth.global.ts):**
- Public route listesi: `/`, `/auth/*`, `/products/*`, `/categories/*`
- Diğer tüm route'lar → `isAuthenticated` kontrolü → değilse `/auth/login`
- Vendor route'ları → role === 'VENDOR' kontrolü
- Admin route'ları → role === 'ADMIN' || 'SUPER_ADMIN' kontrolü

**UI Bileşenleri:**
- Her bileşen: props + emits tam tipli, slot desteği
- UiButton: `variant`, `size`, `loading`, `disabled`, `as` (button/a/NuxtLink)
- UiInput: `v-model`, `type`, `label`, `error`, `hint`, `prefix`/`suffix` slot
- UiModal: `v-model:open`, `title`, `size`, teleport, focus trap, ESC close

---

## Bölüm 2 — Public Sayfalar (Anasayfa, Ürün Listesi, Ürün Detay, Kategori)

**Hedef:** Ziyaretçinin göreceği tüm public sayfalar. SEO uyumlu, SSR ile render.

### Çıktılar

```
pages/
├── index.vue                          # Anasayfa
├── products/
│   ├── index.vue                      # Ürün listesi (filtreleme + sıralama + pagination)
│   └── [slug].vue                     # Ürün detay
├── categories/
│   ├── index.vue                      # Tüm kategoriler (tree görünüm)
│   └── [slug].vue                     # Kategori detay (o kategorinin ürünleri)
├── brands/
│   └── [slug].vue                     # Marka detay sayfası
├── vendors/
│   └── [slug].vue                     # Vendor vitrin sayfası (public profil)
└── search.vue                         # Arama sonuçları

composables/
├── useProducts.ts                     # Ürün listesi, filtreleme, sıralama
├── useProduct.ts                      # Tekil ürün detay
├── useCategories.ts                   # Kategori tree
├── useSearch.ts                       # Arama (debounce + suggestion)
└── useSeo.ts                          # Dinamik meta tag'ler (SeoMetadata API)

stores/
├── catalog.ts                         # Ürün cache, son görüntülenenler
└── search.ts                          # Arama geçmişi, öneriler

components/
├── product/
│   ├── ProductCard.vue                # Kart: görsel, isim, fiyat, badge, favori
│   ├── ProductGrid.vue                # Responsive grid (2-3-4 kolon)
│   ├── ProductFilters.vue             # Sidebar: kategori, fiyat aralığı, marka, rating
│   ├── ProductSort.vue                # Sıralama dropdown
│   ├── ProductGallery.vue             # Ana görsel + thumbnail slider
│   ├── ProductInfo.vue                # İsim, fiyat, stok durumu, vendor linki
│   ├── ProductVariants.vue            # Renk/beden seçici
│   ├── ProductReviews.vue             # Yorum listesi + ortalama puan
│   └── ProductBreadcrumb.vue          # Kategori yolu
├── home/
│   ├── HomeBanner.vue                 # Hero slider (HomeBanner API)
│   ├── HomeQuadCards.vue              # 4'lü kart grid (HomeQuadCard API)
│   ├── HomeFeaturedProducts.vue       # Öne çıkan ürünler carousel
│   ├── HomeCampaigns.vue              # Aktif kampanyalar
│   └── HomeCategories.vue             # Popüler kategoriler
├── category/
│   ├── CategoryTree.vue               # Hiyerarşik kategori ağacı
│   └── CategoryCard.vue               # Kategori kartı (ikon + isim + ürün sayısı)
└── search/
    ├── SearchBar.vue                  # Debounced input + öneriler dropdown
    └── SearchResults.vue              # Sonuç listesi + filtreler
```

### Detaylar

**Anasayfa (index.vue):**
- SSR: `useAsyncData` ile banner, quad card, featured products, campaigns paralel fetch
- Content API'den dinamik bölümler (HomeBanner, HomeQuadCard)
- Lazy load: alt bölümler viewport'a girince yüklensin

**Ürün Listesi (products/index.vue):**
- URL-driven filtreleme: `/products?category=elektronik&minPrice=100&sort=price_asc&page=2`
- `useProducts` composable: `watchEffect` ile URL query değişince refetch
- Infinite scroll VEYA sayfalama (pagination meta'dan)
- Skeleton loading state

**Ürün Detay ([slug].vue):**
- `useAsyncData('product-{slug}')` SSR fetch
- Breadcrumb: kategori hiyerarşisi
- Galeri: ana görsel + zoom + thumbnail navigation
- Varyant seçimi → listing değişir → fiyat/stok güncellenir
- Yorumlar: lazy load, pagination
- "Sepete Ekle" butonu (Bölüm 5'te bağlanır)
- SEO: `useHead` ile dinamik title, description, og:image

**Arama:**
- SearchBar: 300ms debounce, minimum 2 karakter
- Öneri dropdown: son aramalar + anlık öneriler
- Enter → /search?q=... sayfasına git
- Sonuç sayfası: ürün grid + filtreler (products/index.vue ile aynı filter component'leri)

---

## Bölüm 3 — Auth Sayfaları (Login, Register, Profil, Adresler)

**Hedef:** Kullanıcı kimlik doğrulama sayfaları ve hesap yönetimi.

### Çıktılar

```
pages/
├── auth/
│   ├── login.vue                      # Google OAuth2 butonu + email/password (ileride)
│   ├── register.vue                   # Kayıt formu
│   └── callback.vue                   # OAuth2 callback handler
└── account/
    ├── index.vue                      # Hesap özeti dashboard
    ├── profile.vue                    # Profil düzenleme
    ├── addresses.vue                  # Adres yönetimi (CRUD)
    ├── orders.vue                     # Sipariş geçmişi (Bölüm 5 ile bağlantılı)
    ├── favorites.vue                  # Favori ürünler
    ├── notifications.vue              # Bildirim ayarları
    └── security.vue                   # Oturum yönetimi, aktif sessionlar

composables/
├── useProfile.ts                      # Profil CRUD
├── useAddresses.ts                    # Adres CRUD
└── useFavorites.ts                    # Favori toggle + liste

components/
├── auth/
│   ├── AuthGoogleButton.vue           # Google ile giriş butonu
│   ├── AuthLoginForm.vue              # Email/password formu
│   └── AuthRegisterForm.vue           # Kayıt formu
├── account/
│   ├── AccountSidebar.vue             # Hesap menüsü
│   ├── ProfileForm.vue                # Ad, soyad, telefon, avatar
│   ├── AddressCard.vue                # Adres kartı (düzenle/sil)
│   ├── AddressForm.vue                # Adres formu (il/ilçe cascading select)
│   └── SessionList.vue                # Aktif oturumlar (cihaz, IP, tarih)
└── ui/
    ├── UiFormGroup.vue                # Label + input + error wrapper
    ├── UiSelect.vue                   # Native veya custom select
    └── UiTextarea.vue                 # Textarea + karakter sayacı
```

### Detaylar

**Google OAuth2 Akışı:**
1. "Google ile Giriş" → backend `/auth/google` redirect
2. Google consent → backend callback → JWT üret → set cookie
3. Frontend `/auth/callback` → cookie'den session oku → auth store güncelle → redirect

**Profil:**
- `GET /users/me/profile` → form doldur
- `PATCH /users/me/profile` → kaydet
- Avatar: dosya yükleme (ileride, şimdilik URL input)

**Adresler:**
- `GET /users/me/addresses` → liste
- İl seçince ilçeler yüklensin (cascading)
- Varsayılan adres işaretleme
- Silme: onay modal

**Favoriler:**
- Kalp ikonu toggle: `POST /favorites` / `DELETE /favorites/:id`
- CatalogProduct bazlı (listing değil)
- Favori sayfası: ürün grid + "Sepete Ekle"

---

## Bölüm 4 — Vendor Paneli

**Hedef:** Satıcının ürün, sipariş, stok ve mağaza yönetimini yapacağı panel.

### Çıktılar

```
pages/vendor/
├── index.vue                          # Vendor dashboard (özet metrikler)
├── products/
│   ├── index.vue                      # Ürün listesi (listing'ler)
│   ├── new.vue                        # Yeni ürün ekleme
│   └── [id]/
│       └── edit.vue                   # Ürün düzenleme
├── orders/
│   ├── index.vue                      # Sipariş listesi (filtreli)
│   └── [id].vue                       # Sipariş detay + durum güncelleme
├── inventory/
│   ├── warehouses.vue                 # Depo yönetimi
│   ├── stocks.vue                     # Stok listesi + düzenleme
│   ├── purchase-orders.vue            # Satın alma siparişleri
│   └── transfers.vue                  # Depolar arası transfer
├── settings/
│   ├── profile.vue                    # Mağaza profili (logo, açıklama, banner)
│   ├── bank-accounts.vue              # Banka hesapları (IBAN)
│   └── subscription.vue               # Abonelik planı
├── analytics.vue                      # Satış grafikleri + metrikler
└── wallet.vue                         # Cüzdan bakiyesi + işlem geçmişi

composables/
├── useVendorListings.ts               # Vendor listing CRUD
├── useVendorOrders.ts                 # Vendor sipariş yönetimi
├── useInventory.ts                    # Stok yönetimi
├── useVendorWallet.ts                 # Cüzdan (gRPC via BFF)
└── useVendorMetrics.ts                # Dashboard metrikleri

stores/
└── vendor.ts                          # Vendor state (profil, aktif plan, metrikler)

components/
├── vendor/
│   ├── VendorDashboardStats.vue       # KPI kartları (satış, sipariş, trafik)
│   ├── VendorRevenueChart.vue         # Gelir grafiği (günlük/haftalık/aylık)
│   ├── VendorOrderTable.vue           # Sipariş tablosu + aksiyon butonları
│   ├── VendorProductForm.vue          # Ürün formu (çok adımlı wizard)
│   ├── VendorProductImageUpload.vue   # Çoklu görsel yükleme + sıralama
│   ├── VendorStockTable.vue           # Stok tablosu (inline düzenleme)
│   ├── VendorWalletSummary.vue        # Bakiye kartı + son işlemler
│   └── VendorSidebar.vue              # Panel navigasyon menüsü
└── ui/
    ├── UiTable.vue                    # Sortable, pagination, responsive tablo
    ├── UiTabs.vue                     # Tab navigasyon
    ├── UiFileUpload.vue               # Drag & drop + preview
    ├── UiDatePicker.vue               # Tarih seçici
    ├── UiChart.vue                    # Chart wrapper (recharts veya chart.js)
    └── UiStepWizard.vue               # Çok adımlı form wizard
```

### Detaylar

**Dashboard (index.vue):**
- KPI kartları: bugünkü satış, bekleyen sipariş, aktif ürün sayısı, cüzdan bakiyesi
- Gelir grafiği: son 30 gün, günlük breakdown
- Son siparişler listesi (5 adet)
- Stok uyarıları (düşük stoklu ürünler)

**Ürün Ekleme (products/new.vue):**
- Wizard: 1) Temel bilgi (isim, açıklama, kategori) → 2) Varyantlar + fiyat → 3) Görseller → 4) Stok → 5) Önizleme + yayınla
- Kategori seçimi: hiyerarşik (CatalogProduct → Listing ilişkisi)
- Varyant: renk/beden matrix oluşturma
- Görsel: drag & drop, sıralama, crop

**Sipariş Yönetimi:**
- Filtreler: durum, tarih aralığı, müşteri
- Durum güncelleme: CONFIRMED → PROCESSING → SHIPPED (kargo kodu girişi)
- Sipariş detay: ürünler, müşteri bilgisi, adres, ödeme durumu

**Stok Yönetimi:**
- Depo listesi + yeni depo ekleme
- Stok tablosu: ürün × depo matrix, inline quantity düzenleme
- Low stock alert göstergesi
- Transfer: kaynak depo → hedef depo, miktar

---

## Bölüm 5 — Sepet + Checkout Akışı

**Hedef:** Ürünü sepete eklemekten ödeme tamamlanana kadar tüm akış.

### Çıktılar

```
pages/
├── cart.vue                           # Sepet sayfası
└── checkout/
    ├── index.vue                      # Checkout — adres + kargo + ödeme özeti
    ├── payment.vue                    # Ödeme sayfası (Iyzico entegrasyonu)
    └── result.vue                     # Ödeme sonucu (başarı/hata)

composables/
├── useCart.ts                         # Sepet CRUD (add, remove, updateQuantity, clear)
├── useCheckout.ts                     # Checkout akışı (adres, kargo, kupon, ödeme)
└── useCoupon.ts                       # Kupon uygulama/kaldırma

stores/
└── cart.ts                            # Pinia — sepet items, toplam, item sayısı

components/
├── cart/
│   ├── CartItem.vue                   # Ürün satırı (görsel, isim, fiyat, miktar, sil)
│   ├── CartSummary.vue                # Ara toplam, kargo, indirim, genel toplam
│   ├── CartCoupon.vue                 # Kupon kodu input + uygula
│   └── CartEmpty.vue                  # Boş sepet state
├── checkout/
│   ├── CheckoutAddressSelect.vue      # Kayıtlı adres seçimi veya yeni ekle
│   ├── CheckoutShippingOptions.vue    # Kargo seçenekleri
│   ├── CheckoutOrderSummary.vue       # Sipariş özeti (son kontrol)
│   └── CheckoutPaymentForm.vue        # Iyzico ödeme formu embed
└── ui/
    ├── UiQuantitySelector.vue         # +/- butonlu miktar seçici
    └── UiPriceDisplay.vue             # Fiyat formatlama (₺, indirimli/eski fiyat)
```

### Detaylar

**Sepet:**
- `POST /cart/items` (listingId, quantity) — aynı listing → quantity artır
- Stok kontrolü: quantity > availableStock → uyarı
- Miktar değişikliği: debounced PATCH
- Sepet badge: header'da item sayısı

**Checkout Akışı:**
1. Adres seçimi (kayıtlı adresler veya yeni ekle inline)
2. Kargo seçimi (backend'den gelen seçenekler)
3. Kupon uygulama (opsiyonel)
4. Sipariş özeti (fiyat breakdown)
5. "Ödemeye Geç" → backend `POST /checkout` (tek transaction: stok reserve + escrow + order)
6. Ödeme sayfası: Iyzico iframe/popup
7. Sonuç: başarı → sipariş detay, hata → retry

**Cart Store (Pinia):**
- Server-side cart (DB'de) — her işlem API call
- Optimistic UI: hemen güncelle, hata olursa geri al
- `itemCount` getter → header badge
- `subtotal`, `shippingCost`, `discount`, `total` computed

---

## Bölüm 6 — Barter Sayfaları

**Hedef:** Platformun ana özelliği — şirketler arası takas sistemi.

### Çıktılar

```
pages/barter/
├── index.vue                          # Barter ana sayfa (surplus item feed)
├── surplus/
│   ├── index.vue                      # Surplus item listesi (filtreleme)
│   ├── new.vue                        # Yeni surplus item ekleme
│   └── [id].vue                       # Surplus item detay
├── wanted/
│   ├── index.vue                      # Wanted item listesi
│   └── new.vue                        # Yeni wanted item ekleme
├── offers/
│   ├── index.vue                      # Gelen/giden teklifler
│   └── [id].vue                       # Teklif detay + counter-offer
├── sessions/
│   ├── index.vue                      # Aktif swap session'lar
│   └── [id].vue                       # Swap session detay (kargo takibi)
└── matches.vue                        # Otomatik eşleştirme önerileri

composables/
├── useSurplus.ts                      # Surplus item CRUD
├── useWanted.ts                       # Wanted item CRUD
├── useTradeOffers.ts                  # Teklif gönder/kabul/red/counter
├── useSwapSession.ts                  # Swap session yönetimi
└── useBarterMatch.ts                  # Eşleştirme önerileri

stores/
└── barter.ts                          # Barter state (aktif teklifler, session'lar)

components/
├── barter/
│   ├── SurplusItemCard.vue            # Surplus item kartı
│   ├── SurplusItemForm.vue            # Surplus ekleme formu
│   ├── WantedItemCard.vue             # Wanted item kartı
│   ├── TradeOfferCard.vue             # Teklif kartı (durum badge)
│   ├── TradeOfferDetail.vue           # Teklif detay (item'lar + değerler)
│   ├── CounterOfferForm.vue           # Karşı teklif formu
│   ├── SwapSessionTimeline.vue        # Session durumu timeline
│   ├── BarterPartStatus.vue           # Her kargo parçasının durumu
│   ├── MatchSuggestionCard.vue        # Eşleştirme öneri kartı (score göstergesi)
│   └── CollateralInfo.vue             # Teminat bilgisi (%25 deposit)
└── ui/
    └── UiTimeline.vue                 # Adımlı timeline component
```

### Detaylar

**Surplus Item:**
- Şirketin fazla ürünlerini listele
- Kategori (hiyerarşik SurplusCategory), miktar, birim fiyat, lokasyon
- Fotoğraflar + açıklama

**Wanted Item:**
- İhtiyaç duyulan ürünleri listele
- Eşleştirme motoru bunu surplus item'larla karşılaştırır

**Teklif Akışı:**
1. Surplus item'a teklif gönder (hangi ürünlerini teklif ediyor + değer)
2. Karşı taraf: kabul / red / counter-offer
3. Counter-offer zinciri (ileri-geri pazarlık)
4. Kabul → collateral hold (%25) → SwapSession başlar

**Swap Session:**
- İki taraf da kargo gönderir (2 BarterPart)
- Her parça: PENDING → SHIPPED → DELIVERED → CONFIRMED
- İki taraf da CONFIRMED → trade complete → collateral release
- Timeline UI: her adımı görsel olarak göster
- Kargo takip numarası girişi

---

## Bölüm 7 — Auction + Lottery Sayfaları

**Hedef:** Açık artırma ve çekiliş özellikleri.

### Çıktılar

```
pages/
├── auctions/
│   ├── index.vue                      # Aktif açık artırmalar
│   ├── [id].vue                       # Açık artırma detay + teklif verme
│   └── my.vue                         # Katıldığım açık artırmalar
└── lotteries/
    ├── index.vue                      # Aktif çekilişler
    ├── [id].vue                       # Çekiliş detay + bilet alma
    └── my.vue                         # Katıldığım çekilişler

composables/
├── useAuctions.ts                     # Auction listesi + bid
├── useAuctionDetail.ts                # Tekil auction + real-time bid
└── useLotteries.ts                    # Lottery listesi + bilet

components/
├── auction/
│   ├── AuctionCard.vue                # Auction kartı (kalan süre, mevcut fiyat)
│   ├── AuctionDetail.vue              # Detay: ürün bilgisi + bid geçmişi
│   ├── AuctionBidForm.vue             # Teklif formu (minimum bid kontrolü)
│   ├── AuctionCountdown.vue           # Geri sayım timer
│   ├── AuctionBidHistory.vue          # Teklif geçmişi listesi
│   └── AuctionWinnerBadge.vue         # 1. 2. 3. kazanan gösterimi
├── lottery/
│   ├── LotteryCard.vue                # Çekiliş kartı
│   ├── LotteryDetail.vue              # Detay + bilet satın alma
│   ├── LotteryTicketCount.vue         # Alınan bilet sayısı
│   └── LotteryResult.vue             # Çekiliş sonucu animasyonu
└── ui/
    └── UiCountdown.vue                # Genel geri sayım component
```

### Detaylar

**Açık Artırma:**
- Durum: SCHEDULED (yaklaşan) → ACTIVE (canlı) → ENDED → COMPLETED
- Canlı bid: WebSocket veya polling (5sn interval)
- Minimum bid: currentPrice + minimumIncrement
- Deposit: katılım için depozito hold
- Geri sayım: auction.endDate'e kadar

**Çekiliş:**
- Bilet satın alma (adet seçimi)
- Çekiliş sonucu: kazanan animasyonu
- Geçmiş çekilişler + sonuçlar

---

## Bölüm 8 — Chat + Bildirimler

**Hedef:** Real-time mesajlaşma ve bildirim sistemi.

### Çıktılar

```
pages/
├── messages/
│   ├── index.vue                      # Sohbet listesi
│   └── [roomId].vue                   # Sohbet odası
└── account/
    └── notifications.vue              # Bildirim merkezi (var olan sayfayı güncelle)

composables/
├── useChat.ts                         # Socket.IO bağlantı + mesaj gönder/al
├── useChatRooms.ts                    # Oda listesi
└── useNotifications.ts                # Bildirim listesi + okundu işaretle

stores/
├── chat.ts                            # Aktif oda, mesajlar, online durumu
└── notifications.ts                   # Bildirimler, okunmamış sayısı

components/
├── chat/
│   ├── ChatRoomList.vue               # Sol panel: oda listesi
│   ├── ChatRoom.vue                   # Sağ panel: mesaj akışı
│   ├── ChatMessage.vue                # Tek mesaj balonu (TEXT/IMAGE/SYSTEM)
│   ├── ChatInput.vue                  # Mesaj input + gönder + görsel ekleme
│   ├── ChatRoomHeader.vue             # Oda başlığı (sipariş/teklif linki)
│   └── ChatOnlineIndicator.vue        # Online/offline durumu
├── notification/
│   ├── NotificationBell.vue           # Header'daki bildirim ikonu + badge
│   ├── NotificationDropdown.vue       # Dropdown: son bildirimler
│   └── NotificationItem.vue           # Tekil bildirim satırı
└── ui/
    └── UiInfiniteScroll.vue           # Yukarı scroll → eski mesajlar yükle
```

### Detaylar

**Chat (Socket.IO):**
- Namespace: `/chat`
- Events: `join-room`, `leave-room`, `send-message`, `new-message`, `typing`
- Room: orderId veya tradeOfferId bazlı (backend tarafından oluşturuluyor)
- Mesaj tipleri: TEXT, IMAGE, SYSTEM
- Scroll: en son mesaj altta, yukarı scroll → lazy load eski mesajlar

**Bildirimler:**
- Tipleri: ORDER_STATUS, BARTER_OFFER, AUCTION_BID, CAMPAIGN, SYSTEM
- Polling veya WebSocket ile real-time
- Okunmamış sayısı → header badge
- Tıklama → ilgili sayfaya yönlendirme (order detail, trade offer, auction)
- Bildirim tercihleri: hangi tipleri email/push/in-app olarak alsın

---

## Bölüm 9 — Admin Paneli

**Hedef:** Platform yönetimi — kullanıcılar, vendor'lar, siparişler, içerik, reklamlar.

### Çıktılar

```
pages/admin/
├── index.vue                          # Admin dashboard (platform metrikleri)
├── users/
│   ├── index.vue                      # Kullanıcı listesi
│   └── [id].vue                       # Kullanıcı detay + rol yönetimi
├── vendors/
│   ├── index.vue                      # Vendor listesi + onay bekleyenler
│   └── [id].vue                       # Vendor detay + onay/red
├── orders/
│   ├── index.vue                      # Tüm siparişler
│   └── [id].vue                       # Sipariş detay
├── disputes/
│   ├── index.vue                      # Açık dispute'lar
│   └── [id].vue                       # Dispute detay + karar verme
├── catalog/
│   ├── categories.vue                 # Kategori yönetimi (tree CRUD)
│   ├── brands.vue                     # Marka onayları
│   └── products.vue                   # Ürün moderasyonu
├── content/
│   ├── banners.vue                    # Banner yönetimi
│   ├── announcements.vue              # Duyuru yönetimi
│   └── help.vue                       # Yardım makaleleri
├── campaigns/
│   ├── index.vue                      # Reklam kampanyaları
│   └── [id].vue                       # Kampanya detay + metrikler
├── analytics.vue                      # Platform-çapı analitik dashboard
├── loyalty/
│   ├── missions.vue                   # Mission tanımlama
│   └── tiers.vue                      # Tier yapılandırması
└── settings.vue                       # Platform ayarları

composables/
├── useAdminUsers.ts
├── useAdminVendors.ts
├── useAdminOrders.ts
├── useAdminDisputes.ts
├── useAdminCatalog.ts
├── useAdminContent.ts
├── useAdminCampaigns.ts
├── useAdminAnalytics.ts
└── useAdminLoyalty.ts

components/
├── admin/
│   ├── AdminDashboardStats.vue        # Platform KPI'ları
│   ├── AdminRevenueChart.vue          # Platform gelir grafiği
│   ├── AdminUserTable.vue             # Kullanıcı tablosu + aksiyonlar
│   ├── AdminVendorApproval.vue        # Vendor onay/red formu
│   ├── AdminDisputePanel.vue          # Dispute karar paneli
│   ├── AdminCategoryTree.vue          # Kategori tree CRUD (sürükle-bırak)
│   ├── AdminBannerEditor.vue          # Banner oluştur/düzenle
│   └── AdminCampaignMetrics.vue       # Reklam performans grafikleri
└── ui/
    ├── UiDataTable.vue                # Gelişmiş tablo (sort, filter, bulk action)
    ├── UiTreeView.vue                 # Hiyerarşik tree CRUD
    ├── UiRichTextEditor.vue           # Zengin metin editörü (help makaleleri)
    └── UiConfirmDialog.vue            # Onay dialogu (tehlikeli aksiyonlar)
```

### Detaylar

**Dashboard:**
- Toplam kullanıcı, aktif vendor, günlük sipariş, toplam ciro
- Gelir grafiği (günlük/haftalık/aylık)
- Onay bekleyen vendor/marka sayısı
- Açık dispute sayısı

**Vendor Onayı:**
- Başvuru listesi (PENDING status)
- Detay: şirket bilgileri, vergi no, MERSIS, belgeler
- Onay / Red (red nedeni)

**Dispute Yönetimi:**
- OPEN → UNDER_REVIEW → RESOLVED
- Her iki tarafın mesajları
- Karar: REFUND_BUYER / FAVOR_SELLER / PARTIAL_REFUND
- Karar notu zorunlu

---

## Bölüm 10 — Content Sayfaları + Son Dokunuşlar

**Hedef:** Yardım merkezi, politika sayfaları, duyurular ve genel iyileştirmeler.

### Çıktılar

```
pages/
├── help/
│   ├── index.vue                      # Yardım merkezi ana sayfa (kategori listesi)
│   ├── [categorySlug]/
│   │   ├── index.vue                  # Kategori altındaki makaleler
│   │   └── [articleSlug].vue          # Makale detay
│   └── search.vue                     # Yardım arama
├── policies/
│   └── [slug].vue                     # Politika sayfası (gizlilik, kullanım, iade)
├── announcements/
│   ├── index.vue                      # Duyuru listesi
│   └── [id].vue                       # Duyuru detay
└── [...slug].vue                      # Dynamic content catch-all (DynamicContent API)

composables/
├── useHelp.ts                         # Yardım kategorileri + makaleler
├── usePolicies.ts                     # Politika sayfaları
└── useAnnouncements.ts                # Duyurular

components/
├── content/
│   ├── HelpCategoryList.vue           # Kategori kartları
│   ├── HelpArticleList.vue            # Makale listesi
│   ├── HelpArticleContent.vue         # Makale içeriği + upvote/downvote
│   ├── HelpSearchBar.vue              # Yardım içi arama
│   ├── PolicyContent.vue              # Politika içeriği (versiyonlu)
│   └── AnnouncementBanner.vue         # Üst banner (aktif duyuru)
└── seo/
    └── SeoHead.vue                    # Dinamik SEO meta (SeoMetadata API)
```

### Son Dokunuşlar (Bu Bölümde Ek Olarak)

```
Performans:
├── Lazy loading: tüm route'lar defineAsyncComponent veya lazy import
├── Image optimization: nuxt/image + lazy load + placeholder
├── Bundle analizi: `nuxt analyze` ile gereksiz dependency temizliği

Erişilebilirlik:
├── Tüm form elemanları: label + aria attribute
├── Keyboard navigation: focus trap (modal), tab order
├── Renk kontrastı: WCAG AA minimum

Hata Yönetimi:
├── error.vue: 404, 500, genel hata sayfaları
├── Her API çağrısı: loading + error + empty state
├── Offline banner: navigator.onLine kontrolü

Test:
├── Vitest: composable unit testleri
├── Component test: kritik bileşenler (checkout, barter offer)
├── E2E: Playwright ile kritik akışlar (login → sepet → checkout)

Son Kontrol:
├── pnpm build — 0 hata
├── pnpm typecheck — 0 any, 0 warning
├── Lighthouse: Performance ≥ 90, Accessibility ≥ 90
├── Tüm sayfalar responsive (mobile, tablet, desktop)
```

---

## Bağımlılık Haritası

```
Bölüm 1 ──────── Temel (tüm bölümler buna bağlı)
  │
  ├── Bölüm 2 ── Public sayfalar
  │     │
  │     └── Bölüm 5 ── Sepet + Checkout (ürün detaydan sepete ekle)
  │
  ├── Bölüm 3 ── Auth + Hesap (login gerekli bölümler buna bağlı)
  │     │
  │     ├── Bölüm 4 ── Vendor paneli
  │     ├── Bölüm 6 ── Barter
  │     ├── Bölüm 7 ── Auction + Lottery
  │     ├── Bölüm 8 ── Chat + Bildirimler
  │     └── Bölüm 9 ── Admin paneli
  │
  └── Bölüm 10 ── Content + Son dokunuşlar (en son)
```

---

## Kullanım

Her bölüm için Claude'a şunu de:

> "Bölüm N'den başlayalım. [barterborsa-final-summary.md ve bu plan dosyasını paylaş]"

Claude:
1. Bu plandaki bölümü okur
2. Backend API endpoint'leriyle eşleştirir
3. Gemini'ye verilecek detaylı implementation prompt'u hazırlar
4. Prompt'ta: dosya listesi, her dosyanın içeriği, API tipleri, edge case'ler, test senaryoları yer alır

> Her bölüm sonunda: `pnpm build` + `pnpm typecheck` + 0 any + 0 warning kontrolü.
