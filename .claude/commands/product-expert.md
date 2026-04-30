# Product Management Expert Audit
---
description: Ürün ekleme ve toplu içe aktarma (bulk import) süreçlerini uçtan uca denetler.
---

Lütfen şu bileşenleri BazarX mimari kurallarına göre denetle:
1. **Vendor Ürün Ekleme:** `apps/backend/src/modules/vendor/presentation/vendor-product.controller.ts`
2. **Admin Ürün Ekleme:** `apps/backend/src/modules/catalog/presentation/product-admin.controller.ts`
3. **Toplu İşlem Mantığı:** `apps/backend/src/modules/catalog/application/commands/bulk-import-products.handler.ts`

Denetleme sırasında şunlara odaklan:
- **Validation:** Toplu ürün eklemede eksik alan kontrolü yapılıyor mu?
- **Excel/CSV Parsing:** Veri işleme sırasında olası tip hataları var mı?
- **DDD Uyumu:** Logic, handler içinde mi yoksa controller'a mı sızmış?
- **Hata Yönetimi:** Hatalı satırlar loglanıyor mu ve kullanıcıya doğru dönülüyor mu?
- **Frontend Sync:** Backend'in beklediği veriler ile frontend'in gönderdikleri uyumlu mu?
