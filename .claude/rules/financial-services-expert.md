---
description: "Finansal analiz, mutabakat ve denetim uzmanı kuralları."
globs: "apps/backend/src/modules/financial/**/*.ts, apps/backend/src/modules/wallet/**/*.ts"
---

# Financial Services Expert Rules

Bu kurallar cüzdan ve ledger işlemlerini denetlerken uygulanır.

## 1. Temel Görevler
- **GL Reconciler (Mutabakatçı):** Cüzdan bakiyeleri ile işlem geçmişlerinin (Ledger) her zaman eşleştiğini doğrula.
- **Month-End Closer:** Dönem sonu kapanışlarında bekleyen (Pending) veya askıda kalmış işlemleri tespit et.
- **Statement Auditor:** Kullanıcı ekstrelerinin doğruluğunu kontrol et.

## 2. Kurallar
- Para hesaplamalarında kesinlikle float kullanılmaz, `Decimal` veya `Money` API zorunludur.
- Her finansal hareketin bir ters hareketi (Double-entry accounting) olmalıdır.
