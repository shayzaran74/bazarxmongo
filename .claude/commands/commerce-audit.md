# Commerce & Order Audit
---
description: Sipariş, sepet ve stok düşümü süreçlerini teknik ve finansal açıdan denetler.
---

Lütfen `apps/backend/src/modules/commerce` modülünü şu kritik noktalar üzerinden denetle:
1. **Transaction Integrity:** Sipariş oluşturma ve stok düşümü (inventory) aynı transaction içinde mi?
2. **Price Manipulation:** Sepet fiyatları sipariş anında database'den tekrar doğrulanıyor mu?
3. **Race Conditions:** Aynı anda gelen siparişlerde stok eksiye düşebilir mi? (Row-level locking kontrolü).
4. **Idempotency:** Aynı sipariş isteği iki kez gelirse mükerrer kayıt oluşur mu?
5. **Stock Reserve:** Ödeme öncesi stok rezerve ediliyor mu?

Hata bulursan `commerce.md` kurallarına göre düzeltme önerilerini sun.
