# BazarX B2B Ticari Takas — Tek Sistem Entegrasyon Planı

**Tarih:** 2026-05-02
**Hazırlayan:** Claude Code (Opus 4.7)
**Durum:** ⏳ Onay Bekliyor (kodlama başlamadı)

---

## 0. Yönetici Özeti

Şu an iki paralel sistem var: yeni `ticaritakas/*` (müzakere — teklif/karşı teklif/onay) ve eski `my/surplus/*` (operasyon — swap session, teminat, kargo). Birbirine bağlı değil; **kabul edilen bir teklif boşa düşüyor** çünkü:

- Backend `acceptOffer` `sessionId` döndürüyor ama frontend kullanmıyor.
- Frontend `useSwapSession` `/api/barter/swap/...` çağırıyor ama **backend'de bu controller hiç yok** (5 endpoint sıfırdan yazılacak).
- Frontend swap status enum'ları backend ile uyuşmuyor (`COLLATERAL_DEPOSITED` ≠ `ACTIVE`).

**Hedef Mimari:**
- ✅ **Yeni `ticaritakas/*` ekosistemi tek doğruluk kaynağı (single source of truth) olacak.**
- ✅ **Eski `my/surplus/swap/*` operasyon akışı `ticaritakas/swap/*` altına taşınacak** (tasarım yükseltilerek).
- ✅ **Eski `my/surplus/index.vue` panel + komponentler `ticaritakas/dashboard` ve `ticaritakas/inbox`'a entegre edilecek.**
- ✅ **Backend'de `SwapSessionController` (5 endpoint) sıfırdan yazılacak.**
- ✅ Tüm eski URL'lerden yeni URL'lere kalıcı yönlendirme (301-style middleware) eklenecek.

---

## 1. Mevcut Durum Envanteri (Kanıt)

### 1.1 Backend — Mevcut Olan
| Dosya | Endpoint | Durum |
|---|---|---|
| `offers.controller.ts:269` | `PATCH /api/v1/offers/:id/accept` | ✅ Çalışıyor — `{ success, sessionId }` döner |
| `offers.controller.ts:178` | `POST /api/v1/offers/:id/counter` | ✅ Çalışıyor — `parentOfferId/counterOfferId` set edilir |
| `accept-trade-offer.handler.ts:55-60` | `SwapSession` oluşturma | ✅ Atomik tx ile |
| `accept-trade-offer.handler.ts:66-101` | `holdFunds` (collateral) | ✅ İki taraf için sıralı blokaj |
| `barter.controller.ts:60` | `GET /api/v1/barter/my-chains` | ✅ Swap session listesi |
| `PrismaSwapSessionRepository` | DB I/O | ✅ Mevcut |
| `SwapSession` entity + mapper | Domain | ✅ Mevcut |

### 1.2 Backend — EKSİK (kritik)
| İhtiyaç | Yok mu? |
|---|---|
| `SwapSessionController` | ❌ **YOK** |
| `GET /api/v1/barter/swap/:id` | ❌ |
| `POST /api/v1/barter/swap/:id/lock` (collateral lock manuel tetikleme) | ❌ |
| `POST /api/v1/barter/swap/:id/ship` (kargo bilgisi gönderme) | ❌ |
| `POST /api/v1/barter/swap/:id/confirm` (teslim onayı) | ❌ |
| `POST /api/v1/barter/swap/:id/dispute` (anlaşmazlık açma) | ❌ |
| `POST /api/v1/barter/swap/:id/finalize` (inceleme sonu — fonu serbest bırakma) | ❌ |

### 1.3 Frontend — Mevcut Sayfalar
**Yeni (kalıcı olacak):**
- `pages/ticaritakas/index.vue` — Landing
- `pages/ticaritakas/b2b-dashboard.vue` — Premium dashboard (stats + grid)
- `pages/ticaritakas/trade-pool/all.vue` — Havuz keşif/arama
- `pages/ticaritakas/trade-pool/[id].vue` — İlan detayı
- `pages/ticaritakas/trade-pool/offer/[id].vue` — Teklif oluşturma
- `pages/ticaritakas/trade-pool/offer/confirm/[id].vue` — Onay
- `pages/ticaritakas/trade-pool/offer/counter/[id].vue` — Karşı teklif
- `pages/ticaritakas/trade-pool/offer/counter/success.vue` — Başarı

**Eski (taşınacak/kaldırılacak):**
- `pages/my/surplus/index.vue` — Tab'lı panel (İLANLARIM/GELEN/GİDEN) → `ticaritakas/inbox.vue`'a taşı
- `pages/my/surplus/swap/[id].vue` — Swap operasyon → `ticaritakas/swap/[id].vue`'a taşı

### 1.4 Frontend — Mevcut Composable'lar
| Dosya | Durum | Sorun |
|---|---|---|
| `composables/useSurplus.ts` | ✅ Çalışıyor | `acceptOffer()` `sessionId`'yi yutuyor (sat.118) |
| `composables/useSurplusForm.ts` | ✅ | — |
| `composables/useTradeOffer.ts` | ✅ | — |
| `composables/useSwapSession.ts` | ⚠️ | **Bütün endpoint'leri ölü** + parametre kabul etmiyor + 7 metot eksik |

### 1.5 Frontend — Komponentler
**Eski `components/my/surplus/swap/*` (taşınacak):**
- `SwapHeader.vue`, `SwapStepper.vue`, `SwapStatusCard.vue`, `SwapSummary.vue`, `SwapDisputeModal.vue`
- → `components/ticaritakas/swap/*` altına taşınacak (tasarım yükseltilecek)

**Eski `components/my/surplus/*` (refactor + taşı):**
- `SurplusItemCard.vue` → `components/ticaritakas/SurplusItemCard.vue` (premium tasarım, SVG ikonlar)
- `SurplusOfferItem.vue` → `components/ticaritakas/inbox/OfferItem.vue` (COUNTER_OFFERED desteği)
- `SurplusChainModal.vue` → `components/ticaritakas/ChainModal.vue`

### 1.6 Status Enum Uyumsuzluğu (Acil)
| Frontend Hardcoded | Backend Gerçek | Durum |
|---|---|---|
| `PENDING_COLLATERAL` | `PENDING_COLLATERAL` | ✅ |
| `COLLATERAL_DEPOSITED` | `ACTIVE` | ❌ Frontend'i düzelt |
| `SHIPPING_IN_PROGRESS` | `SHIPPING` | ❌ Frontend'i düzelt |
| `INSPECTION_PERIOD` | (yok) | ❌ Backend'e ekle veya `PARTIALLY_COMPLETED` kullan |
| `COMPLETED` | `COMPLETED` | ✅ |
| (frontend yok) | `DISPUTED`, `CANCELLED`, `TIMEOUT` | ❌ Frontend'e ekle |

---

## 2. Hedef Mimari (Tek Sistem)

```
ticaritakas/
├── index.vue                   ← Landing (mevcut, korunacak)
├── b2b-dashboard.vue           ← Vendor B2B paneli (mevcut, +Inbox widget)
├── inbox.vue                   ← YENİ: Eski my/surplus/index.vue'nin yerine geçecek
├── trade-pool/
│   ├── all.vue                 ← Havuz keşif (mevcut)
│   ├── [id].vue                ← İlan detay (mevcut)
│   └── offer/
│       ├── [id].vue            ← Teklif oluşturma (mevcut)
│       ├── detail/[id].vue     ← YENİ: Teklif/müzakere detay
│       ├── confirm/[id].vue    ← Onay (mevcut)
│       └── counter/
│           ├── [id].vue        ← Karşı teklif (mevcut)
│           └── success.vue     ← Başarı (mevcut)
└── swap/
    └── [id].vue                ← YENİ: Eski my/surplus/swap/[id].vue'nun yerine

components/ticaritakas/
├── SurplusItemCard.vue         ← Eskiden taşındı, premium yenilendi
├── inbox/
│   ├── OfferItem.vue           ← COUNTER_OFFERED dahil tüm statüler
│   └── ChainModal.vue          ← Karşı teklif zinciri görünümü
└── swap/
    ├── SwapHeader.vue
    ├── SwapStepper.vue
    ├── SwapStatusCard.vue
    ├── SwapSummary.vue
    └── SwapDisputeModal.vue
```

**URL Migration Map (kalıcı redirect middleware):**
| Eski | Yeni |
|---|---|
| `/my/surplus` | `/ticaritakas/inbox` |
| `/my/surplus/swap/:id` | `/ticaritakas/swap/:id` |

---

## 3. Faz Planı (Kodlama Sırası)

### 🔥 Faz 1 — Backend SwapSessionController (BLOKER)
**Hedef:** Frontend swap akışının çalışabilmesi için 6 endpoint.

**Dosyalar:**
- ➕ `apps/backend/src/modules/barter/presentation/swap-session.controller.ts` (YENİ)
- ➕ `apps/backend/src/modules/barter/presentation/dto/swap-shipping.dto.ts` (YENİ)
- ➕ `apps/backend/src/modules/barter/presentation/dto/swap-dispute.dto.ts` (YENİ)
- ➕ `apps/backend/src/modules/barter/application/commands/lock-collateral.command.ts` + handler (YENİ)
- ➕ `apps/backend/src/modules/barter/application/commands/submit-shipping.command.ts` + handler (YENİ)
- ➕ `apps/backend/src/modules/barter/application/commands/confirm-receipt.command.ts` + handler (YENİ)
- ➕ `apps/backend/src/modules/barter/application/commands/finalize-swap.command.ts` + handler (YENİ)
- ➕ `apps/backend/src/modules/barter/application/commands/open-dispute.command.ts` + handler (YENİ)
- ➕ `apps/backend/src/modules/barter/application/queries/get-swap-session.handler.ts` (YENİ)
- ✏️ `apps/backend/src/modules/barter/barter.module.ts` (controller + handler kayıt)

**Endpoint Şeması:**
```
GET    /api/v1/barter/swap/:id
       → SwapSessionDto (status, parties, parts, collateralStatus, holds, deadlines)

POST   /api/v1/barter/swap/:id/lock
       → AcceptTradeOfferHandler içinde zaten yapılıyor.
         Bu endpoint manuel re-trigger / partial recovery için. (opsiyonel; gerekmiyorsa atla)

POST   /api/v1/barter/swap/:id/ship
       Body: { trackingCode: string, carrier: string }
       Guards: vendor part'ın sahibi mi? Status === ACTIVE mi?
       Action: BarterPart.status → SHIPPED, AuditLog: PART_SHIPPED

POST   /api/v1/barter/swap/:id/confirm
       Guards: karşı part'ın alıcısı mı? BarterPart.status === SHIPPED mi?
       Action: BarterPart.status → DELIVERED → CONFIRMED, AuditLog: PART_CONFIRMED
       Side effect: İki taraf da CONFIRMED ise SwapSession.status → COMPLETED

POST   /api/v1/barter/swap/:id/finalize
       Guards: SwapSession.status === COMPLETED, inceleme süresi geçmiş
       Action: releaseFunds (gRPC) iki taraf için, AuditLog: SWAP_FINALIZED

POST   /api/v1/barter/swap/:id/dispute
       Body: { reason: string }
       Action: SwapSession.status → DISPUTED, AuditLog: SWAP_DISPUTED (severity: HIGH)
```

**Kabul Kriterleri:**
- Tüm endpoint'ler `@Roles('VENDOR','ADMIN','SUPER_ADMIN')` ile korunmuş
- Vendor sahiplik kontrolü her endpoint'te (`session.fromVendorId === user.vendorId || session.toVendorId === ...`)
- Her komut `AuditLog` yazar
- `any` = 0, `console.error` yok, tip güvenliği tam

---

### 🔥 Faz 2 — useSwapSession Composable Refactor (BLOKER)
**Dosya:** `apps/frontend/composables/useSwapSession.ts` (rewrite)

**Yeni İmza:**
```typescript
export const useSwapSession = (sessionId: Ref<string> | string) => {
  // session: ref<SwapSessionDto | null>
  // myCompany: computed → benim taraf bilgisi
  // counterparty: computed → karşı taraf
  // isFromCompany: computed
  // isMyCollateralLocked: computed
  // isMyShippingProvided: computed
  // isMyReceiptConfirmed: computed
  // isMyFinalized: computed
  // currentStep: computed (1-5)

  // fetchSession(): Promise<void>
  // lockCollateral(): Promise<void>           // gerekirse
  // submitShipping(trackingCode, carrier)
  // confirmReceipt()
  // finalizeSwap()
  // sendDispute(reason)
}
```

**API Path Düzeltmeleri:** Tüm yollar `/api/barter/swap/...` → `/api/v1/barter/swap/...`

---

### 🔥 Faz 3 — accept→swap Köprüsü (BLOKER)
**Dosya:** `apps/frontend/composables/useSurplus.ts:115-127`

**Değişiklik:**
```typescript
const acceptOffer = async (id: string) => {
  const response = await $api<{ success: boolean; sessionId: string }>(
    `/api/v1/offers/${id}/accept`,
    { method: 'PATCH' }
  )
  if (response.success && response.sessionId) {
    await navigateTo(`/ticaritakas/swap/${response.sessionId}`)
  }
}
```

---

### 🟠 Faz 4 — Eski my/surplus/swap'ı Yeni Konuma Taşı
**Yeni Dosyalar:**
- ➕ `apps/frontend/pages/ticaritakas/swap/[id].vue` — eski içerik + status enum'ları DOĞRU değerlerle (`ACTIVE`, `SHIPPING`, `COMPLETED`, `DISPUTED`)
- ➕ `apps/frontend/components/ticaritakas/swap/SwapHeader.vue`
- ➕ `apps/frontend/components/ticaritakas/swap/SwapStepper.vue`
- ➕ `apps/frontend/components/ticaritakas/swap/SwapStatusCard.vue`
- ➕ `apps/frontend/components/ticaritakas/swap/SwapSummary.vue`
- ➕ `apps/frontend/components/ticaritakas/swap/SwapDisputeModal.vue`

**Tasarım:** [#002444] palet, SVG ikonlar (heroicons → inline SVG), Türkçe i18n

**Silinecek (Faz 6'da):**
- ❌ `apps/frontend/pages/my/surplus/swap/[id].vue`
- ❌ `apps/frontend/components/my/surplus/swap/*`

---

### 🟠 Faz 5 — Inbox Sayfası (eski my/surplus/index.vue yerine)
**Yeni:** `apps/frontend/pages/ticaritakas/inbox.vue`

**İçerik:** Tab'lı panel
- **İLANLARIM** — `useSurplus().items` → `<SurplusItemCard>` grid
- **GELEN TEKLİFLER** — `useSurplus().incomingOffers` → `<inbox/OfferItem>` list
- **GİDEN TEKLİFLER** — `useSurplus().outgoingOffers` → `<inbox/OfferItem>` list
- "YENİ İLAN OLUŞTUR" modal trigger (eski sistemden taşınacak)

**OfferItem.vue Düzeltmeleri (kritik):**
- `COUNTER_OFFERED` durumu → "Karşı Teklifi Görüntüle" butonu (`/ticaritakas/trade-pool/offer/detail/:id`)
- `ACCEPTED` durumu → "Swap Paneli" butonu (`/ticaritakas/swap/:sessionId`) — sessionId offer'dan çekilecek
- Tüm enum karşılaştırmaları `.toUpperCase()` normalizasyonu

---

### 🟠 Faz 6 — Teklif Detay Sayfası (yeni eksiklik)
**Yeni:** `apps/frontend/pages/ticaritakas/trade-pool/offer/detail/[id].vue`

**İçerik:**
- Teklif tam detayı (barter miktarı, nakit, mod, not, tarih, durum)
- Müzakere zinciri (`parentOfferId` chain) — chronological timeline
- Aksiyon butonları:
  - `PENDING` (alıcı): "Kabul Et" / "Reddet" / "Karşı Teklif Ver"
  - `COUNTER_OFFERED` (orijinal teklifi veren): "Karşı Teklifi Kabul Et" / "Yeni Karşı Teklif"
  - `ACCEPTED`: "Swap Paneline Git"

**Backend hazır:** `GET /api/v1/offers/:id` (varsa) — yoksa Faz 1'e ekle.

---

### 🟢 Faz 7 — Yönlendirme Middleware'i
**Yeni:** `apps/frontend/middleware/legacy-redirect.global.ts`

```typescript
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/my/surplus') return navigateTo('/ticaritakas/inbox', { redirectCode: 301 })
  if (to.path.startsWith('/my/surplus/swap/')) {
    const id = to.path.split('/').pop()
    return navigateTo(`/ticaritakas/swap/${id}`, { redirectCode: 301 })
  }
})
```

---

### 🟢 Faz 8 — Navigation Güncellemesi
**Dosyalar:**
- `components/layout/Header.vue` — `/my/surplus` linklerini `/ticaritakas/inbox` ile değiştir
- `components/layout/vendor/VendorSidebar.vue` — "TAKAS PANELİ" → `/ticaritakas/inbox`
- `pages/ticaritakas/b2b-dashboard.vue` — "Yeni İlan Oluştur" link'i `/ticaritakas/inbox`'a (modal aç)

---

### 🟢 Faz 9 — Eski Dosyaları Sil
**Silinecek:**
- ❌ `apps/frontend/pages/my/surplus/swap/[id].vue`
- ❌ `apps/frontend/pages/my/surplus/index.vue`
- ❌ `apps/frontend/components/my/surplus/*` (tüm klasör — yenileri `components/ticaritakas/` altında)

**Korunacak (başka modüller kullanıyorsa kontrol):**
- `pages/my/surplus/` altında başka bir şey kalırsa (örn: `[id].vue` git status'ta deleted görünüyor) — kalmıyor, hepsi taşınacak.

---

## 4. Test Planı (Manuel Tarayıcı Testi)

### Faz 1-3 sonrası (BLOKERLERİ doğrula):
1. Vendor A `surplus` ilanı oluştur
2. Vendor B `/ticaritakas/trade-pool/all` → ilan detay → teklif ver
3. Vendor A `inbox` GELEN TEKLİFLER → "Karşı Teklif Ver" → counter offer
4. Vendor B `inbox` GELEN TEKLİFLER → COUNTER_OFFERED → "Karşı Teklifi Görüntüle" → "Kabul Et"
5. **Beklenen:** `/ticaritakas/swap/:sessionId` sayfasına yönlendirme + teminat HELD durumu

### Faz 4 sonrası (Swap operasyonu):
6. Vendor A swap sayfasında "Kargoyu Bildir" → trackingCode, carrier gir → API 200
7. Vendor B swap sayfasında "Teslim Aldım" → status DELIVERED → CONFIRMED
8. Karşılıklı CONFIRMED → SwapSession.status → COMPLETED
9. İnceleme süresi sonrası "Tamamla" → fonlar release

### Faz 7 sonrası (URL redirect):
10. `/my/surplus` adresini elle yaz → `/ticaritakas/inbox` redirect
11. `/my/surplus/swap/abc123` → `/ticaritakas/swap/abc123` redirect

---

## 5. Risk & Rollback

| Risk | Olasılık | Önlem |
|---|---|---|
| SwapSessionController eksik handler I/O hatası | Orta | Her command tx içinde, hata throw → NestJS exception filter |
| Frontend status enum yanlış kalırsa swap sayfası boş kalır | Yüksek | Faz 4'te enum mapping testi (manuel) |
| Eski dosyalar silinince başka import edilen yer kırılır | Düşük | Faz 9 öncesi `grep -r "my/surplus"` ile referans taraması |
| Redirect middleware sonsuz döngü | Düşük | Path tam eşleşme + return immediate |
| `holdId` persist edilmeyen eski session'lar var | Orta | Migration script: NULL `fromCollateralHoldId` olan ACTIVE session'ları işaretle (admin manuel çözer) |

**Rollback:** Tüm değişiklikler tek branch'te, faz commit'leri ayrı. Her faz sonrası geri alınabilir. Eski dosyalar Faz 9'a kadar silinmiyor — `git stash` ile hızlı geri dönüş mümkün.

---

## 6. Tahmini Efor

| Faz | İşin Kapsamı | Tahmin |
|---|---|---|
| 1 | Backend 1 controller + 5 handler + DTO + module | ~3 saat |
| 2 | useSwapSession rewrite | ~45 dk |
| 3 | acceptOffer redirect | ~10 dk |
| 4 | Swap sayfa + 5 component taşıma + tasarım | ~2 saat |
| 5 | Inbox sayfa + OfferItem refactor | ~1.5 saat |
| 6 | Teklif detay sayfa | ~1.5 saat |
| 7 | Redirect middleware | ~15 dk |
| 8 | Nav güncellemeleri | ~30 dk |
| 9 | Eski dosya temizliği | ~15 dk |
| **TOPLAM** | | **~9.5 saat** |

---

## 7. Açık Sorular (Onay Öncesi)

### S1. Inbox sayfası `/ticaritakas/inbox` mı, `/ticaritakas/dashboard` mı?
- **Önerim:** `/ticaritakas/inbox` (tab'lı operasyon paneli) — `b2b-dashboard.vue` istatistik/keşif odaklı kalsın.
- Alternatif: Tek `/ticaritakas/dashboard` altında her şey.

### S2. Eski `/my/surplus` URL'leri tamamen kapatılsın mı?
- **Önerim:** 301 redirect ile `/ticaritakas/inbox`'a yönlendir (Faz 7).
- Alternatif: 404 göster + "Yeni adres: …" mesajı.

### S3. `lockCollateral` endpoint'i (Faz 1, opsiyonel) yazılsın mı?
- Şu an `acceptOffer` zaten teminatı bloke ediyor. Manuel re-trigger ihtiyacı görülmedi.
- **Önerim:** Atlayalım; sadece partial-failure recovery için admin endpoint'i `barter-admin.controller.ts`'e ekleyelim.

### S4. `INSPECTION_PERIOD` status'u backend'e eklensin mi?
- Frontend bekliyor ama backend `SwapSessionStatus`'ta yok.
- **Önerim:** `PARTIALLY_COMPLETED` mevcut — bunu kullanalım, frontend label'ı "İNCELEME DÖNEMİ" yapalım. Schema değişikliği gerekmez.
- Alternatif: Schema'ya `INSPECTION_PERIOD` ekle → migration → 24h soak süresi cron'u yaz.

### S5. Teklif detay sayfası için `GET /api/v1/offers/:id` endpoint'i var mı?
- Keşifte controller'da görmedim. Doğrulayıp gerekirse Faz 1'e ekleyelim.
- **Önerim:** Faz 1'e dahil edelim (5 dk'lık iş).

---

## 8. Onay Talebi

Bu planı onaylıyor musunuz? Onayladıktan sonra:

- ✅ "**Onaylıyorum, başla**" → Faz 1'den başlayıp sırayla ilerlerim, her faz sonu kısa rapor.
- ✏️ Belirli bir fazı atla / değiştir → bana yazın, planı güncellerim.
- ❓ Açık sorulardan herhangi biri için karar bekliyorum (S1-S5).

**Not:** Plan onaylanmadan tek satır kod değiştirmeyeceğim.
