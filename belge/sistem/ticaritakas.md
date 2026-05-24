---
Son Güncelleme: 2026-05-24
🗺️  SİSTEM HARİTASI — Katman Bazlı Dosya Envanteri

TİCARİ TAKAS (B2B Barter) Ekosistemi
│
├── 📦 SHARED PERSISTENCE (Veritabanı Şemaları)
│   ├── surplusItem.schema.ts          ✅ İyi — 10+ status enum, Decimal128, blockedQuantity, lastReactivatedAt
│   ├── tradeOffer.schema.ts           ✅ DÜZELTİLDİ (Sprint-2) — CashDirection snake_case kaldırıldı + offerSource/batchMatchRunId
│   ├── tradeOfferItem.schema.ts       ✅ estimatedValue Decimal128 — ayrı koleksiyon (trade_offer_items)
│   ├── tradeReview.schema.ts          ✅ YENİ — UUID default _id, rating/comment/tradeOfferId
│   ├── swapSession.schema.ts          ✅ DÜZELTİLDİ (Sprint-2) — shipmentMode enum (STANDARD/CARRIER/HAND_DELIVERY/DIGITAL)
│   │                                     + initiatorHoldId, receiverHoldId, pendingReleaseAt, autoReleasedAt
│   ├── barterPart.schema.ts           ✅ İyi — UNIQUE index (sessionId+partNumber), disputeWindowEndsAt alanı var
│   ├── barterDisputeLog.schema.ts     ✅ DÜZELTİLDİ — resolvedById alanı eklendi, tradeValueInKurus hesaplanıyor
│   ├── chatRoom.schema.ts             ✅ tradeOfferId + participantIds — chat modülü aktif
│   └── chatMessage.schema.ts         ✅ roomId, senderId, isRead, disputeWindowEndsAt indexli
│
├── 🏗️  DOMAIN ENTITIES
│   ├── trade-offer.entity.ts          ✅ accept() / reject() durum makinesi
│   ├── swap-session.entity.ts         ✅ DÜZELTİLDİ — releaseCollateral() + initiatorHoldId/receiverHoldId/pendingReleaseAt/autoReleasedAt
│   ├── barter-part.entity.ts          ✅ İyi
│   └── surplus-item.entity.ts         ✅ lastReactivatedAt alanı — reactivate() domain metodu set ediyor
│
├── ⚙️  APPLICATION — Commands
│   ├── create-surplus-item.handler.ts      ✅ PENDING_APPROVAL set
│   ├── accept-trade-offer.handler.ts       ✅ DÜZELTİLDİ (Oturum 3) + (Sprint-2) — initiatorHoldId/receiverHoldId schema'ya yazılıyor
│   │                                          • TradeOfferItem ayrı koleksiyondan yükleniyor (offeredOfferId)
│   │                                          • estimatedValue fallback: item → props → unitPrice*qty
│   │                                          • Kısmi blokaj: blockedQuantity artırılır, tamamı bloke ise RESERVED
│   │                                          • receiverId (companyId) → Vendor.companyId → userId çözümlemesi
│   │                                          • Compensating refund mekanizması (receiver hold başarısız → initiator iadesi)
│   │                                          • Atomik DB yazımı (MongoDB transaction)
│   │                                          • initiatorHoldId + receiverHoldId → SwapSession.create() içinde set
│   ├── submit-shipping.handler.ts          ✅ DÜZELTİLDİ (Sprint-2) — DIGITAL mod: kargo kodu gerekmez, anında CONFIRMED (24h dispute)
│   ├── confirm-receipt.handler.ts          ✅ DÜZELTİLDİ (Sprint-2) — DIGITAL mod: 24 saat dispute window (72h yerine)
│   ├── finalize-swap.handler.ts            ✅ DÜZELTİLDİ (Sprint-2) — pendingReleaseAt set ediliyor
│   ├── open-dispute.handler.ts             ✅ DÜZELTİLDİ — tradeValueInKurus = collateral * 5 * 100
│   ├── resolve-dispute.handler.ts          ✅ DÜZELTİLDİ — idempotency key deterministik: resolve-{sessionId}-{result}
│   ├── approve-surplus.handler.ts          ✅
│   ├── reject-surplus.handler.ts           ✅
│   └── reactivate-surplus.handler.ts       ✅ DÜZELTİLDİ (Sprint-2) — MAX_REACTIVATIONS=3 + 7 gün zaman penceresi kontrolü
│
├── ⚙️  APPLICATION — Queries
│   ├── get-my-barter-offers.handler.ts     ✅
│   ├── get-my-barter-chains.handler.ts     ✅
│   ├── get-barter-info.handler.ts          ✅
│   └── get-vendor-trust-score.handler.ts   ✅
│
├── ⚙️  APPLICATION — Services
│   ├── collateral-calculator.service.ts   ✅ %20 teminat hesaplaması
│   ├── watchtower.service.ts              ✅ SmartCap kontrolü
│   ├── trust-score-calculator.service.ts  ✅ DÜZELTİLDİ (Sprint-2) — scoreToLevel/isFreezeCandidate kullanılıyor, dondurma adayı log'u
│   ├── trust-score-recalculation.service.ts ✅ Manuel ve cron tetiklemeli
│   ├── b2b-xp-rules.service.ts            ✅ 50/25/25 kuralı
│   ├── barter-match.scheduler.ts          ✅ 02:00 cron, ACTIVE surplus eşleştirme
│   └── swap-session.scheduler.ts          ✅ DÜZELTİLDİ (Sprint-2) — checkTimeouts() + autoReleaseStaleCollaterals() (09:00 hafta içi)
│
├── 🌐 PRESENTATION — Controllers
│   ├── surplus.controller.ts
│   │   ├── GET /surplus                   ✅ Filtreleme + firma populate
│   │   ├── GET /surplus/:id               ✅
│   │   ├── POST /surplus                  ✅ Vendor onay kontrolü
│   │   ├── PATCH /surplus/:id             ✅ Status → PENDING_APPROVAL reset
│   │   ├── DELETE /surplus/:id            ✅ (sahiplik kontrolü, 404 mask — güvenlik tasarımı)
│   │   ├── GET /categories                ✅ Tree yapısı
│   │   └── GET /categories/:id/attributes ✅ DÜZELTİLDİ — CategoryAttribute MongoDB sorgusu
│   │
│   ├── offers.controller.ts
│   │   ├── POST /offers                   ✅ DÜZELTİLDİ — estimatedValue fallback: item → props → unitPrice*qty
│   │   ├── GET /offers/my                 ✅ DÜZELTİLDİ — COMPLETED statüsü de listeleniyor, swapSession populate
│   │   ├── GET /offers/:id                ✅ swapSession populate dahil
│   │   ├── POST /offers/:id/accept        ✅ DÜZELTİLDİ — transaction + kısmi blokaj + userId çözümleme
│   │   ├── POST /offers/:id/counter       ✅ DÜZELTİLDİ — estimatedValue fallback
│   │   └── PATCH /offers/:id/status       ✅
│   │
│   ├── swap-session.controller.ts
│   │   ├── GET /barter/swap/:id           ✅ DÜZELTİLDİ — offeredItems/requestedItems zenginleştirilmiş (title, images)
│   │   │                                     Company bilgileri + initiatorUserId/receiverUserId populate
│   │   ├── POST /barter/swap/:id/ship     ✅
│   │   ├── POST /barter/swap/:id/confirm  ✅
│   │   ├── POST /barter/swap/:id/finalize ✅ DÜZELTİLDİ — PENDING_RELEASE + pendingReleaseAt set
│   │   ├── POST /barter/swap/:id/dispute  ✅
│   │   ├── PATCH /barter/swap/:id/resolve ✅ (Admin only)
│   │   └── companyId çözümlemesi          ✅ DÜZELTİLDİ — ForbiddenException fırlatır
│   │
│   ├── trade-review.controller.ts         ✅ YENİ (Oturum 3)
│   │   ├── POST /trade-reviews            ✅ Değerlendirme oluştur
│   │   ├── GET /trade-reviews             ✅ Liste
│   │   ├── GET /trade-reviews/mutual-status/:tradeOfferId ✅
│   │   ├── GET /trade-reviews/stats/:userId ✅
│   │   └── GET /trade-reviews/pending     ✅ Bekleyen değerlendirmeler
│   │
│   ├── wanted-items.controller.ts
│   │   ├── GET /wanted-items/me           ✅
│   │   ├── POST /wanted-items             ✅ DÜZELTİLDİ — surplusCategoryModel ile kategori doğrulama
│   │   └── DELETE /wanted-items/:id       ✅ DÜZELTİLDİ — companyId vendor'dan çekiliyor
│   │
│   ├── barter-admin.controller.ts
│   │   ├── GET  /admin/barter/offers      ✅
│   │   ├── GET  /admin/barter/offers/pending ✅
│   │   ├── PATCH /admin/barter/offers/:id/approve ✅
│   │   ├── PATCH /admin/barter/offers/:id/reject  ✅
│   │   ├── GET  /admin/barter/users       ✅ gRPC wallet entegrasyonu
│   │   ├── PATCH /admin/barter/user/:id   ✅ DÜZELTİLDİ — b2bTier, barterLimitOverride (Decimal128), b2bCommRate
│   │   ├── GET  /admin/barter/chains      ✅
│   │   ├── GET  /admin/barter/demand-matches ✅ DÜZELTİLDİ — gerçek MongoDB sorgusu + sayfalama
│   │   ├── GET  /admin/barter/timeout-monitor ✅
│   │   ├── POST /admin/barter/run-timeout-check ✅
│   │   ├── GET  /admin/barter/trust-scores ✅
│   │   ├── PATCH /admin/barter/trust-scores/:vendorId ✅
│   │   ├── POST /admin/barter/run-trust-score-recalc  ✅
│   │   ├── GET  /admin/barter/trust-scores/freeze-candidates ✅
│   │   ├── GET  /admin/barter/swap/pending-release    ✅ YENİ — admin onayı bekleyen teminatlar
│   │   └── POST /admin/barter/swap/:id/release-collateral ✅ YENİ — teminat serbest bırakma
│   │
│   ├── barter.controller.ts
│   │   └── POST /barter/transfer          ✅ DÜZELTİLDİ — holdFunds + releaseFunds (P2P escrow)
│   │
│   └── chat.controller.ts (communication modülü)
│       ├── GET  /chat/rooms               ✅
│       ├── POST /chat/rooms               ✅ DÜZELTİLDİ — tradeOfferId ile oda oluştur/getir
│       ├── GET  /chat/rooms/:id/messages  ✅
│       ├── POST /chat/rooms/:id/messages  ✅ DÜZELTİLDİ — HTTP üzerinden mesaj gönderme
│       ├── POST /chat/rooms/:id/read      ✅
│       └── GET  /chat/unread-count        ✅
│
├── 🏗️  INFRASTRUCTURE
│   └── mongo-swap-session.repository.ts   ✅ DÜZELTİLDİ — findByIdWithRelations:
│                                              offeredItems/requestedItems surplus ile zenginleştirme
│                                              Company populate (name, logoUrl)
│                                              Vendor → userId çözümleme
│
└── 🖥️  FRONTEND
    ├── pages/ticaritakas/
    │   ├── index.vue                      ✅ Landing + TtAccessBarrier
    │   ├── b2b-dashboard.vue              ✅ İlanlar / Gelen-Giden Teklifler sekmeleri
    │   ├── inbox.vue                      ✅ DETAY sayfası — ilanlar + teklifler
    │   ├── trust-score.vue                ✅
    │   ├── commission-calc.vue            ✅
    │   ├── chat/[offerId].vue             ❌ SİLİNDİ — sohbet artık my/offers modal + Socket.IO üzerinden çalışıyor
    │   │
    │   ├── swap/[id].vue                  ✅ DÜZELTİLDİ (Sprint-2) — DIGITAL mod adım, collateralIsDone computed, digitalMode prop
    │   │                                     lockCollateral emit kaldırıldı (teminat kabul anında bloke)
    │   │
    │   └── trade-pool/
    │       ├── all.vue                    ✅ Surplus havuz listesi
    │       ├── [id].vue                   ✅ Ürün detay + teklif giriş yönlendirmesi
    │       └── offer/
    │           ├── [id].vue               ✅ DÜZELTİLDİ — Birim fiyat × adet gösterimi, tip bazlı hesaplama
    │           ├── confirm/[id].vue       ✅ DÜZELTİLDİ — total param okunuyor, tip bazlı detay, estimatedValue POST'a dahil
    │           ├── detail/[id].vue        ✅ Teklif detay + kabul/red/karşı teklif
    │           ├── counter/[id].vue       ✅ Karşı teklif formu
    │           ├── counter/success.vue    ✅
    │           └── success.vue            ✅
    │
    ├── pages/admin/
    │   ├── surplus-approvals.vue          ✅ Admin ilan onaylama
    │   ├── surplus-categories/index.vue   ✅
    │   ├── surplus-categories/[id]/attributes.vue ✅
    │   └── barter/collateral.vue          ✅ YENİ — Admin teminat yönetimi (onay bekleyen listesi + serbest bırakma)
    │
    ├── pages/my/offers.vue                ✅ Gelen/Giden teklifler (modal + yönlendirme)
    │
    ├── composables/
    │   ├── useSurplus.ts                  ✅ direction filtering, company fetch
    │   ├── useSurplusForm.ts              ✅ attribute API bağlı
    │   ├── useSwapSession.ts              ✅ DÜZELTİLDİ — isMyFinalized: PENDING_RELEASE desteği
    │   └── useAdminNavigation.ts          ✅ DÜZELTİLDİ — Teminat Yönetimi linki eklendi
    │
    └── components/
        ├── ticaritakas/inbox/InboxOfferItem.vue  ✅ DÜZELTİLDİ — COMPLETED: "TAKAS DETAYI" butonu (sohbet/swap butonları gizli)
        ├── ticaritakas/swap/
        │   ├── SwapHeader.vue             ✅ DÜZELTİLDİ — session.tradeOffer?.requestedItem (null safety)
        │   ├── SwapStepper.vue            ✅ DÜZELTİLDİ (Sprint-2) — done state + CheckCircleIcon, DIGITAL mod "DİJİTAL TESLİM" etiketi
        │   ├── SwapStatusCard.vue         ✅ DÜZELTİLDİ (Sprint-2) — Teminat Kilitle butonu kaldırıldı, bilgi bandı eklendi; DIGITAL mod bilgi bandı
        │   ├── SwapSummary.vue            ✅ DÜZELTİLDİ — teminat durumu bantları (HELD/PENDING_RELEASE/RELEASED)
        │   │                                 offeredItems/requestedItems array desteği, resim çözümleme
        │   └── SwapDisputeModal.vue       ✅
        ├── modals/CreateSurplusModal.vue  ✅
        ├── modals/TradeOfferModal.vue     ✅
        └── trade/
            ├── MyOfferItem.vue            ✅
            ├── OfferDetailModal.vue       ✅ DÜZELTİLDİ (Sprint-2) — offerSource badge ("Sistem eşleşmesi" / "Karşı teklif")
            ├── ReviewStatusBadge.vue      ✅ (duplicate defineProps fix, $api kullanıyor)
            └── ReviewForm.vue             ✅ DÜZELTİLDİ — endpoint /api/v1/trade-reviews, toUserId resolve

---
✅ SPRINT-2 DÜZELTME ÖZETİ (2026-05-24)

Düzeltme 1    Backend'e dokunulmadı — sadece UI düzeltildi
              SwapStatusCard: "Teminat Kilitle" butonu kaldırıldı, bilgi bandı eklendi
              SwapStepper: done state + CheckCircleIcon, DIGITAL mod etiketi
              swap/[id].vue: collateralIsDone computed, lockCollateral emit kaldırıldı, digitalMode prop
Düzeltme 2    reactivate-surplus: 7 gün MIN_REACTIVATION_INTERVAL_DAYS kontrolü + REACTIVATION_TOO_SOON
              lastReactivatedAt schema zaten mevcuttu, surplus-item.repository.interface güncellendi
Düzeltme 3    swapSession.schema: initiatorHoldId + receiverHoldId + pendingReleaseAt + autoReleasedAt
              accept-trade-offer: holdId'ler schema'ya yazılıyor
              finalize-swap: pendingReleaseAt set ediliyor
              swap-session.scheduler: autoReleaseStaleCollaterals() cron (09:00 hafta içi, 3 gün SLA)
              collateral.vue (admin): SLA aşım kırmızı uyarı + daysSincePendingRelease
Düzeltme 4    trust-level.constants: EXCELLENT/GOOD/FAIR/POOR mapping + isFreezeCandidate
              trust-score-calculator: scoreToLevel + isFreezeCandidate kullanımı, dondurma adayı log
              get-ecosystem-dashboard: scoreToLevel fallback
              trust-score.vue (frontend): level renkleri güncellendi
Düzeltme 5    tradeOffer.schema: offerSource (MANUAL/BATCH_MATCH/COUNTER) + batchMatchRunId
              offers.controller counterOffer: offerSource='COUNTER' eklendi
              trade-offer.repository.interface: offerSource/batchMatchRunId create data'ya eklendi
              OfferDetailModal: offerSource badge ("Sistem eşleşmesi" / "Karşı teklif")
Düzeltme 6    submit-shipping: DIGITAL mod → kargo kodu atlanır, anında CONFIRMED (24h dispute)
              confirm-receipt: DIGITAL mod → 24 saat dispute window (72h yerine)
              SwapStatusCard: DIGITAL mod bilgi bandı
              swap/[id].vue: isDigitalMode computed + statusStyle.digitalMode prop
              SwapStepper: DIGITAL mod "DİJİTAL TESLİM" adım etiketi

---
✅ TÜM AÇIK SORUNLAR ÇÖZÜLDÜ — 2026-05-24

---
✅ TÜM OTURUMLARDA TAMAMLANAN DÜZELTMELERİN ÖZETİ

Katman                 Düzeltme
─────────────────────  ──────────────────────────────────────────────────────────────────────────────
Schema                 tradeOffer CashDirection snake_case kaldırıldı → ['NONE','TO_INITIATOR','TO_RECEIVER','BOTH']
Schema                 barterDisputeLog resolvedById alanı eklendi
Schema                 tradeReview.schema.ts: UUID default _id
Handler                accept-trade-offer: TradeOfferItem ayrı koleksiyondan yükleme, kısmi blokaj (blockedQuantity),
                       receiverId→userId çözümleme (Vendor.companyId), compensating refund, atomik transaction
Handler                finalize-swap: PENDING_RELEASE (admin onayı), inceleme süresi atlama, COMPLETED güncelleme
Handler                open-dispute: tradeValueInKurus = collateral * 5 * 100 (gerçek hesaplama)
Handler                resolve-dispute: idempotency key deterministik: resolve-{sessionId}-{result}
Handler                submit-shipping: carrier 2-50 karakter, trackingCode 5-50 karakter, regex doğrulama
Handler                reactivate-surplus: MAX_REACTIVATIONS = 3 limiti
Handler                create-chat-room: { success, id } → { success, data: { id } } standart format
Controller             barter.controller: POST /barter/transfer — holdFunds+releaseFunds (P2P escrow)
Controller             offers.controller: estimatedValue fallback (item→props→unitPrice*qty), COMPLETED listeleme
Controller             swap-session: companyId → ForbiddenException
Controller             barter-admin: teminat yönetimi endpoint'leri (pending-release + release-collateral)
Controller             barter-admin: dynamic require() → static import
Controller             trade-review.controller: YENİ — 5 endpoint (create, list, mutual-status, stats, pending)
Controller             wanted-items: surplusCategoryModel + IVendorRepository
Controller             surplus: GET /categories/:id/attributes — CategoryAttribute gerçek sorgusu
Controller             barter-admin: PATCH /user/:id — VendorB2BData gerçek güncelleme (Decimal128)
Controller             barter-admin: GET /demand-matches — gerçek MongoDB sorgusu + sayfalama
Controller             chat: POST /chat/rooms + POST /chat/rooms/:id/messages HTTP endpoint eklendi
Repository             mongo-swap-session: findByIdWithRelations — offeredItems/requestedItems zenginleştirme,
                       Company populate, userId çözümleme
Module                 barter.module.ts: CategoryAttribute, DemandMatch, VendorB2BData, TradeReview schema kayıtları
Frontend               offer/[id].vue: birim fiyat × adet gösterimi, tip bazlı hesaplama (barter/hybrid/swap)
Frontend               offer/confirm/[id].vue: total param, tip bazlı detay, estimatedValue POST'a dahil
Frontend               SwapHeader.vue: session.offer → session.tradeOffer (null safety)
Frontend               SwapSummary.vue: teminat durumu bantları, offeredItems/requestedItems array, resim çözümleme
Frontend               InboxOfferItem.vue: COMPLETED durumda TAKAS DETAYI butonu (sohbet/swap gizli)
Frontend               swap/[id].vue: part kartlarında firma isimleri (gönderen → alıcı)
Frontend               ReviewForm.vue: endpoint /api/v1/trade-reviews, toUserId resolve
Frontend               admin/barter/collateral.vue: YENİ — admin teminat yönetimi sayfası
Frontend               useAdminNavigation.ts: Teminat Yönetimi linki
Frontend               useSwapSession.ts: isMyFinalized PENDING_RELEASE desteği
Frontend               Tüm double-prefix /api/v1/api/... URL'leri düzeltildi
Frontend               ReviewStatusBadge: duplicate defineProps fix, $fetch → $api
Frontend               swap/[id].vue: chatLink, timeLeft, BarterPart teslimat takip paneli
Frontend               my/offers modal (Socket.IO) — sohbet artık my/offers modal içinde (chat/[offerId].vue silindi)
Schema                 swapSession.schema.ts: ShipmentMode enum eklendi (STANDARD/CARRIER/HAND_DELIVERY/DIGITAL)
Frontend               inbox.vue: SOHBETLER linku kaldırıldı (GELEN/GİDEN TEKLİFLER sekmeleri yeterli)

---
📋 TAM İŞ AKIŞI HARİTASI (Ürün Sahibi Tanımı)

Adım  Aktör          Ekran / Endpoint                        Durum
────  ─────────────  ──────────────────────────────────────  ──────────────────────────────────────────
1     Vendor         b2b-dashboard.vue → CreateSurplusModal  ✅ İlan oluşturma (PENDING_APPROVAL)
2     Admin          admin/surplus-approvals.vue             ✅ Onay → ACTIVE (havuza alınır)
3     Vendor B       trade-pool/all.vue → trade-pool/[id]   ✅ Havuz listesi + ürün detay
4     Vendor B       trade-pool/offer/[id].vue               ✅ Teklif türü seç (nakit / karma / ürün)
5     Vendor B       trade-pool/offer/confirm/[id].vue       ✅ Teklif onayla + XP subsidy göster
6     Sistem         POST /offers → RabbitMQ notification    ✅ Vendor A'ya bildirim gider
7     Vendor A       b2b-dashboard.vue (received sekmesi)    ✅ Teklifi gör
8     Vendor A       trade-pool/offer/detail/[id].vue        ✅ Kabul / Red / Karşı Teklif
9     Sistem         POST /offers/:id/accept                 ✅ SwapSession + 2 BarterPart oluşur
                                                                Her iki tarafın teminatı holdFunds ile bloke edilir
                                                                SurplusItem blockedQuantity güncellenir (kısmi blokaj)
10    Her iki taraf  my/offers modal (Socket.IO)   ✅ Sohbet + pazarlık (artık my/offers modal içinde)
11    Her iki taraf  ticaritakas/swap/{sessionId}            ✅ Swap paneli (firma isimleri, ürün resimleri)
12    Her iki taraf  swap/{id} → submitShipping              ✅ Kargo bilgisi giriş (ACTIVE → SHIPPING)
13    Her iki taraf  swap/{id} → confirmReceipt              ✅ Ürün teslim alındı (3 gün itiraz süresi)
14    Her iki taraf  swap/{id} → finalizeSwap                ✅ ONAYLA & TAMAMLA → PENDING_RELEASE
                                                                İnceleme süresi atlanır (tüm partlar CONFIRMED ise)
15    Admin          admin/barter/collateral.vue             ✅ YENİ — Teminat onayı + serbest bırakma
                     POST /admin/barter/swap/:id/release-collateral → RELEASED
16    Alternatif     swap/{id} → openDispute                 ✅ Anlaşmazlık bildirimi → DISPUTED
17    Admin          PATCH /barter/swap/:id/resolve          ✅ Hakem kararı → COMPLETED / CANCELLED

Teminat Durumu Akışı:
  HELD → (finalize) → PENDING_RELEASE → (admin onayı veya 3 gün SLA aşımı) → RELEASED

✅ ÇÖZÜLDÜ (Sprint-2): Adım 9'da teminat kabul anında bloke edildiği için "Teminat Kilitle" butonu kaldırıldı.
    UI'da bilgi bandı gösteriliyor. SwapStepper'da teminat adımı ACTIVE sonrası otomatik ✓ tamamlanmış gösteriyor.

---
