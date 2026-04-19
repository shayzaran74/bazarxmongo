Backend'e Eklenecekler (Ayrı Prompt — Backend Ekibi İçin)

Bu bölüm backend'de ek geliştirme gerektiren noktalardır.
Frontend bu noktaları stub ile geçici olarak çözüyor.
Backend hazır olunca stub'lar kaldırılır.


📦 Backend Ek Geliştirme Promtu
markdown# GÖREV: Backend Eksik Endpoint'ler — Yeni Controller ve Route Eklemeleri

Bu değişiklikler mevcut DDD/CQRS mimarisini bozmadan yapılmalı.
Test suite'i kırmamalı (pnpm test hepsi pass).

## 1. CommunicationModule — Aktifleştirme
`apps/backend/src/app.module.ts` içinde:
```typescript
// ÖNCE (yorumlu):
// CommunicationModule,
// SONRA (aktif):
CommunicationModule,
```
Bu değişiklik sonrası:
- `GET /api/v1/chat/rooms` → chat room listesi
- `GET /api/v1/chat/rooms/:id/messages` → mesajlar
- `GET /api/v1/notifications` → bildirimler
- `GET /api/v1/notifications/unread-count` → okunmamış sayı

## 2. AuctionController — Yeni Controller
`apps/backend/src/modules/auction/presentation/auction.controller.ts` oluştur:
```typescript
@ApiTags('Auctions')
@Controller('auction')
export class AuctionController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Public()
  @Get('active')
  async getActiveAuctions(@Query() query: any) {
    // TODO: GetActiveAuctionsQuery implement
    return { success: true, data: [], total: 0 }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bid')
  async placeBid(@CurrentUser() user: any, @Body() dto: PlaceBidDto) {
    return this.commandBus.execute(new PlaceBidCommand(user.id, dto.auctionId, dto.amount))
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('draw')
  async drawLottery(@Body() dto: DrawLotteryDto) {
    return this.commandBus.execute(new DrawLotteryCommand(dto.lotteryId))
  }
}
```
`auction.module.ts`'e controller ekle.

## 3. SurplusController — Listings alias
`apps/backend/src/modules/catalog/presentation/surplus.controller.ts` oluştur:
```typescript
// /api/v1/surplus → /api/v1/listings alias
@Controller('surplus')
export class SurplusController extends ListingController {}
```
Böylece frontend `/api/surplus` → backend `/api/v1/surplus` → listings işler.

## 4. Vendor Orders Endpoint
`apps/backend/src/modules/vendor/presentation/vendor.controller.ts` içine:
```typescript
@Get('orders')
@Roles('VENDOR')
@UseGuards(JwtAuthGuard, RolesGuard)
async getVendorOrders(@CurrentUser() user: any, @Query() query: any) {
  // TODO: vendor scope'unda order query
  return { success: true, data: [], total: 0 }
}
```

## 5. Auth — `GET /auth/me` alias
`auth.controller.ts` içine:
```typescript
@Public() // Değil — JWT korumalı
@Get('me')
async me(@Req() req: any) {
  return this.queryBus.execute(new GetUserQuery(req.user.id))
}
```
Bu sayede BFF rewrite gerekmez, frontend direkt `/api/auth/me` kullanabilir.

## Doğrulama
```bash
pnpm test    # tüm testler pass
pnpm build   # 0 error
```

Yürütme Sırası ve Checkpoint'ler
[  ] FAZ 1  → Nitro BFF + Mock routes
              ✓ pnpm typecheck, ✓ pnpm build
              ✓ curl /api/auth/csrf dönüyor
              ✓ curl /api/settings dönüyor

[  ] FAZ 2  → Bağımlılıklar + Config
              ✓ pnpm install hatasız
              ✓ pnpm typecheck

[  ] FAZ 3  → Stores + Composables
              ✓ pnpm typecheck
              ✓ Auth store init çalışıyor

[  ] FAZ 4  → Layout sistemi
              ✓ pnpm typecheck
              ✓ Tüm layout'lar render oluyor

[  ] FAZ 5  → Auth akışı (backend bağlantısı)
              ✓ Login → token alınıyor
              ✓ /profile sayfası yükleniyor
              ✓ Google OAuth callback çalışıyor

[  ] FAZ 6  → Public sayfalar
              ✓ Ana sayfa bileşenleri render
              ✓ Ürün listesi backend'den geliyor
              ✓ Ürün detay sayfası çalışıyor

[  ] FAZ 7  → Kullanıcı paneli
              ✓ Profile güncelleme
              ✓ Adres CRUD
              ✓ Wallet bakiye görünüyor

[  ] FAZ 8  → Vendor paneli
              ✓ Vendor dashboard yüklüyor
              ✓ Ürün listesi + form çalışıyor

[  ] FAZ 9  → Admin paneli
              ✓ Admin guard çalışıyor
              ✓ User listesi geliyor

[  ] FAZ 10 → Barter/Auction + Chat
              ✓ Surplus ilanları listeleniyor
              ✓ Socket graceful fallback

[  ] FAZ 11 → Final polish
              ✓ pnpm typecheck → 0 hata
              ✓ pnpm build → başarılı
              ✓ PWA manifest geçerli

[  ] BACKEND FAZ → Eksik endpoint'ler
              ✓ pnpm test → tüm testler pass
              ✓ CommunicationModule aktif
              ✓ AuctionController eklendi

Önemli Notlar
Iyzico vs Stripe
Mevcut frontend plugins/stripe.client.ts ve components/forms/StripePayment.vue Stripe kullanıyor.
Geçiş planı konuşulmuştu. Şimdilik:

Stripe yapıyı iskelet olarak koru
Payment endpoint'lerini stub bırak (/api/payment/*)
FAZ 12 olarak Iyzico entegrasyonu ayrı bir plan

@barterborsa/shared-types
Frontend bu package'ı kullanıyor (UserDTO, Product, ApiResponse vb.).
Bu package monorepo içinde packages/shared-types olarak bulunmalı.
Eğer yoksa: types/ klasöründeki local type'ları interface olarak kullan.
SSR Dikkat Noktaları

localStorage kullanımı: process.client guard'ı ile
window.* kullanımı: onMounted içinde
Cookie: useCookie() her iki tarafta çalışır (SSR safe)

Socket.io + SSR
composables/useSocket.ts — sadece client-side çalıştır:
typescriptif (process.server) return // Socket sadece client'ta