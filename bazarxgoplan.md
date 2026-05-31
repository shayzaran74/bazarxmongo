# BazarX Go — Sipariş Akışı & Restoran Hakedişleri Planı (v2 — teknik inceleme sonrası)

> Bu doküman **plandır, kod içermez.** financial-gateway + **financial-service** + proto tabanı incelenerek revize edildi. v1'deki "Seçenek A (çift hold)" önerisi, aşağıdaki kısıtlar nedeniyle **terk edildi**; mimari **Seçenek B (tek hold + batch payout)** olarak güncellendi.

---

## 0. 🔴 ACİL BULGU — `sellerId` gRPC Proto Uyuşmazlığı (her şeyi blokluyor)
`financial.proto` (hem backend hem service) `HoldFundsRequest` tanımı yalnızca 6 alan içerir; **`sellerId` YOK:**
```protobuf
message HoldFundsRequest {
  string userId = 1; string amount = 2; string reason = 3;
  string referenceId = 4; string referenceType = 5; string idempotencyKey = 6;
}
```
- gRPC, proto'da tanımsız alanları **wire'da serileştirmez** → TS interface'inde `sellerId` olsa bile `escrow.grpc.controller.ts` tarafında `data.sellerId || ''` **her zaman `''`** olur.
- **Sonuç:** Tüm hold'lar `sellerId: ""` ile açılıyor; `releaseFunds` parayı **boş/tanımsız hesaba** götürüyor → ne restoran ne platform fiilen ödeme alıyor.
- **Etki alanı geniş:** Bu yalnızca BazarXGO'yu değil, **zaten commit'lenmiş barter komisyon capture'ını da** (aynı proto, `sellerId=PLATFORM` geçiyor ama wire'a çıkmıyor) **fiilen çalışmaz** kılıyor.
- **Acil düzeltme:** `financial.proto`'nun her iki kopyasına `string sellerId = 7;` ekle.
- ✅ **DÜZELTİLDİ (Faz 1.5):** `sellerId = 7` her iki proto'ya eklendi. NestJS dinamik proto-loader kullandığı için codegen gerekmez; TS'in iki tarafı (gateway `EscrowGrpcService` + service `EscrowGrpcController`) zaten `sellerId` taşıyordu. Artık capture, hold'un `sellerId` hesabına gider (BazarXGO **ve** barter komisyon). _(Not: financial-service/backend `dist/` kopyaları rebuild gerektirir.)_

---

## 1. KARAR: Mimari = Seçenek B (Tek Hold + Periyodik Batch Payout)
```
Müşteri ──(total)──▶ [HOLD: Platform Escrow (TEK hold, sellerId=PLATFORM)]
                          │  teslimat onayı
                          ▼
                    [Platform Cüzdanı]  ← komisyon + deliveryFee burada kalır
                          │  haftalık/T+X batch payout job
                          ▼  TransferBetweenUsers (YENİ primitif)
                    [Restoran Cüzdanı]  ← restaurantPayoutAmount = subtotal − goCommission
İptal (teslimattan önce): HOLD ──(total)──▶ Müşteri (refundFunds)
```

---

## 2. Seçenek A (Çift Hold) NEDEN ELENDİ (teknik inceleme)
1. **Negatif platform holdu:** Platform-finanse kupon senaryosunda platform payı negatif olabilir.
   Örn: subtotal 100, komisyon 15, deliveryFee 20, kupon 40 → `total = 100+20−40 = 80`; restoran payı `100−15 = 85`; platform payı `80−85 = −5 ₺`. **`holdFunds` negatif tutarla çağrılamaz → A çöker.**
2. **Otomatik çift komisyon (double-commissioning):** `release-escrow.handler.ts`, release anında `sellerAccount.vendorTier`'a göre (CORE %12 …) **otomatik komisyon kesip** platforma atıyor. Restoran payını (85 ₺) doğrudan release edersek üstünden **bir daha** %6–12 kesilir (restoran çift komisyon öder); platform payından da komisyon kesilmeye çalışılır.
3. **Mükerrer `orderId` (unique) engeli:** `create-escrow.handler.ts` `orderId`'ye göre tekilleştiriyor; aynı `orderId` ile ikinci hold yeni kayıt açmaz, ilkini döndürür. İki hold için `orderId-rest` / `orderId-plat` gibi **suni ID türetmek** gerekirdi.

➡️ Bu üç kısıt nedeniyle A hem riskli hem de mevcut escrow mantığıyla uyumsuz. **Seçenek B seçildi.**

---

## 3. Seçenek B — Gereksinimler
### 3.1 Yeni gRPC primitifi: `TransferBetweenUsers` ✅ (Faz 3)
Platform→Restoran için `financial.proto`'ya yeni RPC eklendi (her iki kopya) + financial-service `WalletGrpcController.transferBetweenUsers` (çift taraflı account/wallet güncelleme + `idempotencyKey`'le idempotent, `referenceType='GO_PAYOUT'` tx) + backend `WalletGrpcService`/`FinancialGatewayService` wrapper'ları.
```protobuf
message TransferBetweenUsersRequest {
  string fromUserId = 1; string toUserId = 2;
  string amount = 3; string note = 4; string idempotencyKey = 5;
}
```
### 3.2 GO escrow'unda otomatik B2B komisyonu DEVRE DIŞI ✅ (Faz 2)
`release-escrow.handler.ts` artık `escrow.reason === 'GO_ORDER'` ise vendorTier komisyonu kesmiyor (platform tek hold'u tam alır). `reason` escrow zincirine eklendi: proto `HoldFundsRequest.reason` (mevcut) → `EscrowGrpcController` → `CreateEscrowCommand` → escrow şeması (`reason` alanı) → `release-escrow`. GO komisyonu ayrı `GoCommissionService` ile hesaplanır.
### 3.3 Proto `sellerId` düzeltmesi (§0)
Platform escrow'una capture'ın doğru hesaba gitmesi için `sellerId=7` eklenmeli (ya da GO için platform = sabit hesap kabul edilip release default platforma yönlendirilmeli).

---

## 4. §13 — Kararlar (NETLEŞTİ ✅)
| # | Karar | Sonuç |
|---|-------|-------|
| 1 | **Komisyon oranı** | B2B tier'dan **bağımsız**; restoran bazlı `goCommissionRate`, yoksa global `GO_COMMISSION_RATE = 0.15` |
| 2 | **Kupon finansmanı** | **Platform finanse eder** → restoran hakediş tabanı her zaman **yalın `subtotal`** |
| 3 | **Delivery fee** | Kurye modülüne (Faz 4) kadar **platform cüzdanında** toplanır |
| 4 | **Hakediş zamanlaması** | **T+X (haftalık) batch** — per-order REDDEDİLDİ (iptal/iade'de restoran cüzdanından geri çekme/chargeback yok → finansal risk) |
| 5 | **Restoran onboarding** | Restoran bir **vendor kullanıcısı (`ownerUserId`)** ile eşleşir; `payoutAccountId = ownerUserId` |
| 6 | **İade/dispute penceresi** | Açık (öneri: 3–7 gün; batch payout bu pencere kapanınca çalışır) |

---

## 5. Hakediş Hesabı (locked kararlara göre)
```
goCommission = subtotal × (restaurant.goCommissionRate ?? GO_COMMISSION_RATE)   // tier'dan bağımsız
restaurantPayoutAmount = subtotal − goCommission        // kupon dahil DEĞİL (platform finanse)
platformGross = total − restaurantPayoutAmount          // komisyon + deliveryFee − (platform finanse kupon)
```
- `total = subtotal + deliveryFee − discount` (müşteriden bloke edilen).
- Kupon platform finanse olduğundan restoran tabanı yalın `subtotal`'dır; indirimin yükü `platformGross`'tan düşer.

---

## 6. Para Olayları × Durum (Seçenek B)
| Durum geçişi | Para olayı |
|--------------|-----------|
| → RECEIVED (place-order) | Müşteriden `total` **tek hold** (sellerId=PLATFORM) → settlementStatus=HELD |
| RECEIVED/PREPARING → CANCELLED | `refundFunds` → müşteri; payoutStatus=CANCELLED |
| → DELIVERED | `releaseFunds` → **platform cüzdanı**; `restaurantPayoutAmount` hesaplanır, `payoutStatus=PENDING` kaydedilir |
| Batch payout job (T+X) | `TransferBetweenUsers(platform→restoran, restaurantPayoutAmount)`; payoutStatus=PAID |
| Teslimat sonrası dispute | Pencere içinde ise payout durdurulur/iade (refund) |

---

## 7. Veri Modeli Değişiklikleri
- **`GoRestaurant`:** `+ ownerUserId` (vendor user), `+ goCommissionRate?` (override). `payoutAccountId = ownerUserId`.
- **`GoOrder`:** `+ restaurantPayoutAmount`, `+ platformFeeAmount`, `+ payoutStatus` (`PENDING`|`PAID`|`CANCELLED`), `+ payoutBatchId?`. (settlementStatus mevcut.)
- **`GoPayout` (yeni ledger):** `id, orderId, restaurantId(ownerUserId), amount, status, batchId, transferIdempotencyKey, createdAt`.
- **Config/env:** `GO_COMMISSION_RATE=0.15`, `BAZARXGO_PLATFORM_ACCOUNT_ID` (mevcut, admin userId).

---

## 8. Fazlama / Yol Haritası (revize)
| Faz | İçerik | Durum |
|-----|--------|-------|
| **Faz 1** | Müşteriden tahsilat (HELD) + capture/refund + kupon | ✅ kod var — **ama §0 proto bug'ı yüzünden capture fiilen platforma gitmiyor** |
| **Faz 1.5 (ACİL)** | `financial.proto`'ya `sellerId=7` ekle → mevcut capture (BazarXGO **ve barter komisyon**) gerçekten platform hesabına gider | ✅ **TAMAM** |
| **Faz 2** | GO escrow'da B2B komisyon kesimi devre dışı (`reason='GO_ORDER'`) + `GoCommissionService` + `GoRestaurant.ownerUserId/goCommissionRate` + place-order'da `restaurantPayoutAmount`/`platformFeeAmount` persist + teslimatta `payoutStatus=PENDING` (transfer Faz 3) | ✅ **TAMAM** |
| **Faz 3** | `TransferBetweenUsers` gRPC primitifi + **batch payout job** (`GoPayoutScheduler`, günlük 04:00, dispute penceresi `GO_PAYOUT_DISPUTE_WINDOW_DAYS=3`) + `payoutStatus` PENDING→PAID + `payoutBatchId`. _GoPayout ayrı koleksiyon yerine: order alanları + financial `AccountTransaction(referenceType=GO_PAYOUT)` ledger'ı._ | ✅ **TAMAM** |
| **Faz 4** | Gerçek kurye dispatch + `deliveryFee` kurye dağıtımı | ⏳ |

---

## 9. Edge-Case'ler
| Durum | Davranış |
|-------|----------|
| İptal (hazırlanmadan) | Tek hold `refundFunds` → müşteri (mevcut) |
| Teslimat sonrası dispute (pencere içinde) | Payout batch'i bekletilir; haklıysa müşteriye iade (platform cüzdanından), restorana ödeme yapılmaz |
| Restoran hesabı (`ownerUserId`) yok | Hakediş `payoutStatus=PENDING` birikir; hesap bağlanınca ödenir (para platformda güvende) |
| Kupon | Platform finanse; restoran tabanı `subtotal`; usageCount artar |
| Capture/transfer başarısız | İlgili status (HELD/PENDING) korunur, idempotent yeniden denenir |

---

## 10. Acil Aksiyon Sırası (kod aşamasına geçilince)
1. ✅ **§0 proto fix** (`sellerId=7`) — TAMAM (Faz 1.5). BazarXGO **ve** barter komisyon capture'ını aynı anda düzeltti.
2. ✅ GO escrow'da otomatik B2B komisyon kesimi `reason='GO_ORDER'` ayrımıyla devre dışı — TAMAM (Faz 2).
3. ✅ `GoCommissionService` + `GoRestaurant.ownerUserId/goCommissionRate` + place-order'da hakediş persist + teslimatta `payoutStatus=PENDING` — TAMAM (Faz 2).
4. ✅ `TransferBetweenUsers` + batch payout (`GoPayoutScheduler`) — TAMAM (Faz 3).

> **Durum:** Faz 1.5 + Faz 2 + Faz 3 uygulandı (backend + financial-service tsc temiz). Faz 4 (gerçek kurye dispatch + deliveryFee dağıtımı) kapsam dışı bırakıldı.
> **Go-live ön-koşulları:** financial-service + backend + shared-persistence **build/restart** (proto + şema değişti); `BAZARXGO_PLATFORM_ACCOUNT_ID` (✅ admin ID set), restoran `ownerUserId/payoutAccountId` doldurma; restoran cüzdanları mevcut olmalı. Tüm değişiklikler `main`'de değil (deploy için merge gerekir).
