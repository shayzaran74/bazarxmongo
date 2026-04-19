FAZ 7 — Kullanıcı Paneli (Profile, Wallet, Orders, Addresses)

markdown# GÖREV: Kullanıcı Paneli — Backend Entegrasyonu

## Backend User Endpoint'leri
GET  /api/v1/users/me                           → UserDTO
GET  /api/v1/identity/profile                   → UserProfile (via BFF: /api/user/profile)
POST /api/v1/identity/profile                   → profile update
POST /api/v1/identity/profile/change-password   → (via BFF: /api/user/change-password)
GET  /api/v1/identity/addresses                 → Address[] (via BFF: /api/addresses)
POST /api/v1/identity/addresses                 → create address
PUT  /api/v1/identity/addresses/:id             → update
DELETE /api/v1/identity/addresses/:id           → delete
GET  /api/v1/wallet                             → WalletBalance
GET  /api/v1/wallet/transactions                → WalletTransaction[]
POST /api/v1/wallet/topup                       → stub
POST /api/v1/wallet/withdraw                    → stub
GET  /api/v1/xp/history (kısmen)               → XP geçmişi


## YAPILACAKLAR

### 1. pages/profile/index.vue — Tab yapısı
Profile sayfası tab'lara ayrılmış:
- `ProfileInfoTab` → `GET/POST /api/user/profile`
- `ProfileAddressesTab` → `GET/POST/PUT/DELETE /api/addresses`
- `ProfileSecurityTab` → `POST /api/user/change-password`
- `ProfileWalletTab` → `GET /api/wallet`
- `ProfileLoyaltyTab` → `GET /api/loyalty/status`
- `ProfileActivityTab` → kullanıcı aktivite (stub ok)

Her tab'ın doğru service metodu çağırıp çağırmadığını kontrol et.

### 2. pages/wallet.vue — Wallet sayfası
`WalletService.getWallet()` response normalize:
Backend dönüşü:
```json
{
  "success": true,
  "data": {
    "balance": 150.50,
    "availableBalance": 100.00,
    "blockedBalance": 50.50,
    "currency": "TRY"
  }
}
```

### 3. pages/orders/index.vue + [id].vue
`OrderService.getOrders()` → `/api/orders` GET
`OrderService.getOrderById(id)` → `/api/orders/:id` GET
Backend `commerce` modülünde `checkout.controller.ts` + `cart.controller.ts` var.
Order listing için ayrı bir endpoint mevcut değilse stub response dön.

### 4. AddressService path fix
`AddressService` şu an `/api/addresses` çağırıyor.
BFF middleware `→ /api/v1/identity/addresses` rewrite ediyor. ✓
Ancak `:id` parametreli route'lar da capture ediliyor mu?
BFF middleware'de `/api/addresses/:id` → `/api/v1/identity/addresses/:id` kontrolü.

## Kısıtlamalar
- Auth guard: profil sayfaları `definePageMeta({ middleware: 'auth' })`
- `any` yasak
- Response normalize edilirken orijinal backend kodu değiştirilmez