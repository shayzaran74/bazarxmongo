# BarterBorsa Frontend — Bölüm 6: Barter Sayfaları (Takas Sistemi)

## SİSTEM TALİMATLARI

Bölüm 1-5 tamamlandı. Bu bölümde platformun **ana özelliği olan barter (takas) sistemi** yazılacak. Şirketler arası fazla ürün takası: surplus item listeleme, teklif gönderme/alma, swap session yönetimi.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK**
- `<script setup lang="ts">` zorunlu
- SSR-safe: browser API → `onMounted` veya `import.meta.client` guard
- Bölüm 1-5'teki composable/component'leri kullan
- `brand-*` ve `surface-*` Tailwind renk paleti

### ÖNEMLİ İŞ MANTIĞI

Barter akışı:
1. **Firma** kaydı gerekli — kullanıcı vendor olmalı ve şirket profili olmalı
2. **Surplus Item** — şirketin fazla ürününü ilan olarak yayınlar (kategori, miktar, birim fiyat, görseller)
3. **Wanted Item** — ihtiyaç duyulan ürünü belirtir (eşleştirme motoru kullanır)
4. **Trade Offer** — başka şirketin surplus item'ına teklif gönderir (kendi surplus item'ından)
5. **Counter-offer** — teklif kabul/red/karşı teklif zinciri
6. **Kabul** → Collateral hold (%25 teminat) → **Swap Session** başlar
7. **Swap Session** — iki taraf da kargo gönderir (2 BarterPart)
8. Her parça: PENDING → SHIPPED → DELIVERED → CONFIRMED
9. İki taraf da CONFIRMED → takas tamamlanır → teminat serbest bırakılır

### BACKEND API ENDPOINTLERİ

```
# Firma (Company)
GET  /companies/me                     → { success, data: Company }
POST /companies                        → { success, data: Company }  body: { name, taxNumber, mersisNumber, kepAddress, city, district }

# Surplus Items
GET  /surplus-items                    → { success, data: SurplusItem[], meta }  query: page, categoryId, search, status
GET  /surplus-items/:id                → { success, data: SurplusItem }
POST /surplus-items                    → { success, data: SurplusItem }
PATCH /surplus-items/:id               → { success, data: SurplusItem }
DELETE /surplus-items/:id              → { success }
PATCH /surplus-items/:id/reactivate    → { success }  body: { quantity }

# Wanted Items
GET  /wanted-items                     → { success, data: WantedItem[], meta }
POST /wanted-items                     → { success, data: WantedItem }
DELETE /wanted-items/:id               → { success }

# Trade Offers
GET  /trade-offers                     → { success, data: TradeOffer[], meta }  query: type=received|sent, status
GET  /trade-offers/:id                 → { success, data: TradeOffer }
POST /trade-offers                     → { success, data: TradeOffer }
PATCH /trade-offers/:id/accept         → { success }
PATCH /trade-offers/:id/reject         → { success }  body: { reason }
POST /trade-offers/:id/counter         → { success, data: TradeOffer }

# Swap Sessions
GET  /swap-sessions                    → { success, data: SwapSession[], meta }
GET  /swap-sessions/:id                → { success, data: SwapSession }
PATCH /swap-sessions/:id/lock-collateral → { success }
PATCH /swap-sessions/:id/ship          → { success }  body: { trackingNumber, carrier }
PATCH /swap-sessions/:id/confirm-delivery → { success }

# Demand Matches
GET  /demand-matches                   → { success, data: DemandMatch[] }

# Trade Reviews
POST /trade-reviews                    → { success }  body: { tradeOfferId, rating, comment }

# Surplus Categories
GET  /surplus-categories               → { success, data: SurplusCategory[] }  query: includeChildren
```

---

## 1. TİP TANIMLARI — `types/barter.ts`

```typescript
import type { BaseEntity } from '~/types/common'

export interface Company extends BaseEntity {
  name: string; taxNumber: string; mersisNumber: string | null; kepAddress: string | null
  city: string; district: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; userId: string
}
export interface CompanyInput { name: string; taxNumber: string; mersisNumber?: string; kepAddress?: string; city: string; district: string }

export interface SurplusCategory extends BaseEntity { name: string; slug: string; icon: string | null; parentId: string | null; isActive: boolean; children?: SurplusCategory[] }

export interface SurplusItem extends BaseEntity {
  title: string; description: string | null; categoryId: string; category?: SurplusCategory | null
  quantity: number; unit: string; unitPrice: number; totalValue: number
  status: SurplusItemStatus; images: { id: string; url: string; sortOrder: number }[]
  location: string | null; companyId: string; company?: { name: string } | null
}
export type SurplusItemStatus = 'ACTIVE' | 'INACTIVE' | 'TRADED' | 'EXPIRED' | 'PENDING_APPROVAL'
export interface SurplusItemInput { title: string; description?: string; categoryId: string; quantity: number; unit: string; unitPrice: number; images?: string[]; location?: string }

export interface WantedItem extends BaseEntity {
  title: string; description: string | null; categoryId: string; category?: SurplusCategory | null
  quantity: number; unit: string; maxUnitPrice: number | null; status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED'; companyId: string
}
export interface WantedItemInput { title: string; description?: string; categoryId: string; quantity: number; unit: string; maxUnitPrice?: number }

export interface TradeOffer extends BaseEntity {
  status: TradeOfferStatus; message: string | null
  surplusItemId: string; surplusItem?: SurplusItem
  offeredSurplusItemId: string; offeredSurplusItem?: SurplusItem
  offeredQuantity: number; offeredValue: number
  fromCompanyId: string; fromCompany?: { id: string; name: string }
  toCompanyId: string; toCompany?: { id: string; name: string }
  counterOffers?: TradeOffer[]; parentOfferId: string | null
}
export type TradeOfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'CANCELLED' | 'WAITING_APPROVAL' | 'LEGAL_PENDING' | 'COMPLETED'

export interface SwapSession extends BaseEntity {
  status: SwapSessionStatus; offerId: string; offer?: TradeOffer
  collateralAmount: number; parts: BarterPart[]
}
export type SwapSessionStatus = 'PENDING_COLLATERAL' | 'ACTIVE' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'

export interface BarterPart extends BaseEntity {
  swapSessionId: string; companyId: string; company?: { name: string }
  status: BarterPartStatus; trackingNumber: string | null; carrier: string | null
  shippedAt: string | null; deliveredAt: string | null; confirmedAt: string | null; isMyPart?: boolean
}
export type BarterPartStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CONFIRMED'

export interface DemandMatch extends BaseEntity { score: number; surplusItem?: SurplusItem; wantedItem?: WantedItem; matchedCompany?: { id: string; name: string } }

export const BARTER_CARRIER_OPTIONS = ['Yurtiçi Kargo', 'Aras Kargo', 'MNG Kargo', 'PTT Kargo', 'Sürat Kargo'] as const
```

---

## 2. COMPOSABLE'LAR

4 composable yaz (her biri tam tip-güvenli, useApi kullanarak):

### 2.1 `composables/useCompany.ts`
- `company`, `loading`, `hasCompany`, `isApproved` (computed)
- `fetchCompany()` → GET /companies/me
- `createCompany(data: CompanyInput)` → POST /companies

### 2.2 `composables/useSurplusItems.ts`
- `items`, `loading`, `meta`, `categories` (SurplusCategory[])
- `fetchItems(params?)` → GET /surplus-items (paginated, filterable)
- `fetchItem(id)` → GET /surplus-items/:id
- `createItem(data)` → POST /surplus-items
- `updateItem(id, data)` → PATCH /surplus-items/:id
- `deleteItem(id)` → DELETE /surplus-items/:id
- `reactivateItem(id, quantity)` → PATCH /surplus-items/:id/reactivate
- `fetchCategories()` → GET /surplus-categories?includeChildren=true

### 2.3 `composables/useTradeOffers.ts`
- `offers`, `loading`
- `fetchOffers(type: 'received'|'sent', status?)` → GET /trade-offers?type=X
- `fetchOffer(id)` → GET /trade-offers/:id
- `sendOffer(data)` → POST /trade-offers
- `acceptOffer(id)` → PATCH /trade-offers/:id/accept (onay dialogu göster)
- `rejectOffer(id, reason?)` → PATCH /trade-offers/:id/reject
- `sendCounterOffer(offerId, data)` → POST /trade-offers/:id/counter

### 2.4 `composables/useSwapSessions.ts`
- `sessions`, `loading`
- `fetchSessions()` → GET /swap-sessions
- `fetchSession(id)` → GET /swap-sessions/:id
- `lockCollateral(sessionId)` → PATCH /swap-sessions/:id/lock-collateral
- `shipPart(sessionId, { trackingNumber, carrier })` → PATCH /swap-sessions/:id/ship
- `confirmDelivery(sessionId)` → PATCH /swap-sessions/:id/confirm-delivery

---

## 3. SAYFALAR

### 3.1 `pages/barter/index.vue` — Barter Ana Sayfa (Surplus Feed)
- Hero bölüm + "İlan Oluştur" butonu
- Kategori filtresi + arama
- Surplus item grid (tüm aktif ilanlar)
- Firma kontrolü: yoksa uyarı

### 3.2 `pages/barter/surplus/[id].vue` — Surplus Item Detay
- Görsel galeri + bilgiler + firma kartı
- "Teklif Gönder" modal (kendi surplus item'ını seç + miktar + mesaj)

### 3.3 `pages/barter/wanted/index.vue` — Wanted Item Listesi
- CRUD: listele + yeni ekle (modal) + sil

### 3.4 `pages/barter/my/index.vue` — Benim İlanlarım + Tekliflerim
- 3 tab: İLANLARIM | GELEN TEKLİFLER | GİDEN TEKLİFLER
- İlanlarım: surplus item CRUD kartları
- Gelen: kabul/red/karşı teklif butonları
- Giden: durum gösterimi
- Firma yoksa: CompanyCreateForm göster

### 3.5 `pages/barter/offers/[id].vue` — Teklif Detay
- Teklif bilgileri + counter-offer zinciri
- Aksiyonlar: Kabul / Red / Karşı Teklif formu

### 3.6 `pages/barter/sessions/index.vue` — Aktif Swap Session'lar
- Session kartları: teklif özeti + durum + part durumları

### 3.7 `pages/barter/sessions/[id].vue` — Swap Session Detay (**EN KRİTİK**)
- Progressive stepper: Teminat → Kargo → Teslimat → Onay → Tamamlandı
- PENDING_COLLATERAL: teminat tutarı + "Kilitle" butonu
- ACTIVE: kargo formu (carrier select + tracking input + "Gönderildi" butonu)
- Karşı tarafın durumu (sadece görüntüle)
- DELIVERED: "Teslim aldım, onaylıyorum" butonu
- COMPLETED: başarı durumu

### 3.8 `pages/barter/matches.vue` — Eşleştirme Önerileri
- Eşleşme kartları: skor + ürünler + "Teklif Gönder" butonu

---

## 4. COMPONENT'LER — `components/barter/`

```
SurplusItemCard.vue        — Kart (görsel, başlık, kategori, miktar, değer, durum, aksiyonlar)
SurplusItemForm.vue        — Oluşturma/düzenleme formu (modal)
TradeOfferCard.vue         — Teklif kartı (gelen/giden, durum, aksiyonlar)
TradeOfferDetail.vue       — Teklif detay + zincir
CounterOfferForm.vue       — Karşı teklif formu
SendOfferModal.vue         — Teklif gönderme modal
SwapSessionCard.vue        — Session özet kartı
SwapSessionTimeline.vue    — Progressive stepper
BarterPartStatus.vue       — Kargo parçası durumu + aksiyonlar
CollateralInfo.vue         — Teminat bilgisi
MatchSuggestionCard.vue    — Eşleştirme kartı
CompanyCreateForm.vue      — Firma oluşturma formu (vergi no, MERSIS, KEP, il, ilçe)
```

Ek UI:
```
UiTimeline.vue             — Adımlı timeline (yatay, aktif/tamamlanmış adımlar)
```

---

## 5. i18n — `locales/tr.json`'a ekle

barter.title, barter.subtitle, barter.createListing, barter.myListings, barter.receivedOffers, barter.sentOffers, barter.noListings, barter.surplus.* (title, name, description, category, quantity, unit, unitPrice, status.*), barter.wanted.*, barter.offer.* (sendOffer, accepted, rejected, counterOffer, acceptConfirm, status.*), barter.session.* (title, collateral, lockCollateral, shipping, trackingNumber, carrier, markShipped, confirmDelivery, status.*, steps.*), barter.matches.*, barter.company.* (required, create, name, taxNumber, mersisNumber, kepAddress), barter.review.*

---

## 6. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/barter` → Surplus item feed, filtre, arama
4. `/barter/surplus/:id` → Detay + teklif gönderme modal
5. `/barter/wanted` → Wanted item CRUD
6. `/barter/my` → Tab yapısı: ilanlarım CRUD + gelen/giden teklifler
7. `/barter/my` → Firma yoksa: firma oluşturma formu
8. `/barter/offers/:id` → Teklif detay + counter-offer
9. `/barter/sessions` → Session listesi
10. `/barter/sessions/:id` → Progressive stepper, teminat, kargo, onay — tüm adımlar çalışır
11. `/barter/matches` → Eşleştirme önerileri
12. Teklif kabul → onay dialogu
13. Swap session kargo: carrier + tracking
14. Mobile responsive

---

## 7. DOSYA YAPISI

```
types/barter.ts
composables/useCompany.ts, useSurplusItems.ts, useTradeOffers.ts, useSwapSessions.ts
components/barter/SurplusItemCard.vue, SurplusItemForm.vue, TradeOfferCard.vue, TradeOfferDetail.vue, CounterOfferForm.vue, SendOfferModal.vue, SwapSessionCard.vue, SwapSessionTimeline.vue, BarterPartStatus.vue, CollateralInfo.vue, MatchSuggestionCard.vue, CompanyCreateForm.vue
components/ui/UiTimeline.vue
pages/barter/index.vue, surplus/[id].vue, wanted/index.vue, my/index.vue, offers/[id].vue, sessions/index.vue, sessions/[id].vue, matches.vue
locales/tr.json (GÜNCELLENDİ)
```

> **Not:** Her dosyayı tam implementasyonla yaz. Swap session detay sayfası (progressive stepper, teminat, kargo, teslimat onayı) en kritik. Firma oluşturma: vergi no, MERSIS, KEP. Counter-offer zinciri görsel olarak gösterilmeli.
