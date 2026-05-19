---
description: "BazarX takas (barter) sistemi kuralları, durum geçişleri ve uyuşmazlık yönetimi."
globs: "apps/backend/src/modules/barter/**/*.ts, apps/backend/prisma/schema.prisma"
---

# BazarX Takas (Barter) Sistemi Kuralları

Bu kurallar `MasterPlan_v4.3`, sistem incelemesi ve ürün sahibinin direktiflerine dayanmaktadır.

## 1. TradeOffer (Takas Teklifi) Kuralları
- **Zaman Aşımı:** Teklifler varsayılan olarak **7 gün** geçerlidir (`expiresInDays: 7`).
- **Nakit Desteği:** Takas tekliflerinde nakit para yönü `TO_INITIATOR` veya `TO_RECEIVER` olabilir.
- **Durumlar:** Sadece `PENDING` veya `COUNTER_OFFERED` durumundaki teklifler kabul edilebilir veya reddedilebilir.

## 2. SwapSession (Takas Oturumu) Kuralları
- **Zaman Aşımı:** Takas oturumu varsayılan olarak **30 gün** içinde tamamlanmalıdır.
- **Timeout Tetikleyicisi:** Tüm timeout geçişleri (`TIMEOUT`) bir **cron job** ile tetiklenir.
  - Zamanlama: Her gece `02:00` (batch matching ile aynı pencere, önce matching sonra timeout taraması).
  - Uygulama: `SwapSchedulerService` → `checkTimeouts()` → expire olan session'ları `TIMEOUT`'a geçirir.
- **Durum Geçişleri (State Machine):**
  - `PENDING_COLLATERAL` → `ACTIVE`, `CANCELLED`, `TIMEOUT`
  - `ACTIVE` → `SHIPPING`, `DISPUTED`, `TIMEOUT`
  - `SHIPPING` → `PARTIALLY_COMPLETED`, `DISPUTED`, `COMPLETED`
  - `PARTIALLY_COMPLETED` → `COMPLETED`, `DISPUTED`
  - `DISPUTED` → `COMPLETED`, `CANCELLED`

## 3. TicariTakas (B2B) Kuralları
- **Üyelik Seviyeleri ve Barter Komisyonları:**
  - **CORE:** %12 Komisyon (Havuz Limiti: 150.000 ₺)
  - **PRIME:** %10 Komisyon (Havuz Limiti: 500.000 ₺)
  - **ELITE:** %8 Komisyon (Havuz Limiti: 1.500.000 ₺)
  - **APEX:** %6 Komisyon (Havuz Limiti: 10.000.000 ₺)
- **Takas Kredisi Kuralı:** Üyelik ücreti miktarının **5 katı** kadar havuzda takas kredisi açılır.
- **Havuz Limiti Dolduğunda:** Yeni teklif girişi reddedilir; `POOL_LIMIT_EXCEEDED` hatası fırlatılır. Seviye yükseltme önerisi bildirim olarak gönderilir.
- **Komisyon Yapısı ve İndirimler:**
  - **Grup İçi Oranlar:** CORE: %9, PRIME: %8, ELITE: %7, APEX: %6.
  - **XP İndirimi Sonrası Oranlar (Maksimum):** CORE: %6, PRIME: %5, ELITE: %4, APEX: %3.
  - **XP İndirimi Formülü:** `Standart Komisyon * 0.5`.
- **⚠️ Kritik Komisyon Kuralları:**
  - XP indirimi komisyonun **maksimum %50'sine** uygulanabilir. Kalan %50 her zaman **nakit** ödenir.
  - XP indirimi ve grup içi oran **aynı işlemde birlikte uygulanamaz**.
- **TrustScore Algoritması:**
  - **Ticari Performans (%40):** Tamamlanan takas hızı. 90 günde işlem yoksa −10 puan/ay.
  - **XP Sadakati (%30):** Cüzdandaki XP miktarı. Bakiye sıfırlanırsa −5 puan/ay.
  - **Uyumluluk (%30):** Price Floor ve kota uyumu. 1. ihlal uyarı, 2. −15 puan, 3. dondurma.
- **Price Floor:**
  - Her ürün/hizmet kategorisi için sistem yöneticisi tarafından belirlenir.
  - Teklif girerken Price Floor kontrolü yapılır; altında teklif verilemez (`PRICE_FLOOR_VIOLATION` hatası).
  - İhlal tespiti teklif anında gerçekleşir (batch beklenmez).

## 4. BarterBorsa Havuz Eşleşme Motoru (Batch Matching Engine) ⭐
- **Eşleşme Türü:** Toplu (Batch) — gerçek zamanlı değil.
- **Zamanlama:** Her gece **02:00**'de otomatik çalışır (`BarterMatchScheduler`).
- **Tetikleyici:** Cron job → `BarterMatchService.runDailyBatch()`.
- **Teklif Tercihleri:** `FULL_ONLY`, `PARTIAL_ACCEPT`, `PARTIAL_CASH_DIFF`.
- **Eşleşme Öncelik Sırası:** 1. TrustScore (DESC), 2. FIFO (ASC).

## 5. BarterBorsa (Kurumsal) Kuralları — Fabrika Ekosistemi
- **Aktörler:** Fabrika (`APEX`), Bayi (`CORE`).
- **Görünürlük:** Fabrika ürünleri sadece kendi bayilerine görünür.
- **Kota (Watchover):** `DEALER_QUOTA_EXCEEDED` kontrolü.
- **Kör Havuz:** Sadece `anonymousId` expose edilir.
- **Smart Cap:** Maksimum %25 havuz payı.
- **Ekosistem İçi Takas Yasağı ⚠️:** Bayiler ekosistem içinde birbirleriyle takas yapamazlar!

## 6. Güvenli Takas (Escrow & 5 Adım) Kuralları ⭐
- **%20 Teminat:** İşlem başında her iki taraftan bloke edilir.
- **5 Kademeli Teslimat:** Toplam miktar 5 defada gerçekleştirilir.
- **Teminat İadesi:** Son gönderimde her iki taraf onay verdiğinde, 7 gün içinde komisyon kesilerek iade edilir.
- **Uyuşmazlık:** Arabulucu yönetir.
- **Gizlilik:** Sanal isimler kullanılır, platform atlama (bypass) engellenir.
- **Çapraz Takas:** A→B→C→A zincirleri desteklenir.
