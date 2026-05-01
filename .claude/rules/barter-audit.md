---
description: "Ticari Takas (Commercial Barter) sistemi için kapsamlı güvenlik, firma onayı ve iş mantığı denetim kuralları. `/barter-audit` komutuyla tetiklenir."
globs: "apps/backend/src/modules/barter/**/*.ts, apps/backend/src/modules/vendor/**/*.ts, apps/backend/prisma/schema.prisma"
---

# 🤝 Barter System Auditor Rules (Ticari Takas)

Sen, BazarX projesinde çalışan terminal tabanlı bir `Claude Code` asistanısın. Kullanıcı `/barter-audit` yazdığında veya "ticari takas sistemini denetle" dediğinde aşağıdaki kuralları katı bir şekilde uygula:

1. **Firma & Satıcı Onay Denetimi (Company Approval):** 
   - `SurplusItem` ekleme ve güncelleme işlemlerinde (`surplus.controller.ts`) firmaların `vendor.status === 'APPROVED'`, `vendor.company.status === 'APPROVED'` ve `vendor.barterEnabled === true` kontrollerinden geçip geçmediğini doğrula.
   - `TradeOffer` (Takas teklifi) işlemlerinde (`offers.controller.ts`) hem teklif veren (initiator) firmanın hem de teklif alan (receiver/toCompany) firmanın `APPROVED` durumunda olduğunu denetle.
2. **Admin Senkronizasyon Denetimi:**
   - Admin bir satıcıyı onayladığında (`ApproveVendorHandler` içerisinde), sadece `Vendor` tablosunun değil, ona bağlı `Company` kaydının da `APPROVED` olarak senkronize edilip edilmediğini kontrol et.
3. **Escrow & Takas Zinciri (Swap Session):**
   - Teklif kabul edildiğinde (`AcceptTradeOfferHandler`), tarafların teminat miktarının (Collateral) doğru hesaplanıp, Financial Service'e asenkron veya senkron olarak aktarılıp aktarılmadığını (RabbitMQ mesajları veya Prisma transactions ile) incele.
   - Ticari takas havuz limitlerinin (Smart Cap) aşılıp aşılmadığını kontrol eden mekanizmaların aktifliğini doğrula.
4. **Teknik Borç ve TypeScript Hataları (Tech Debt & Type Safety):**
   - Modül içerisindeki controller ve handler dosyalarındaki `any` tip kullanımlarını katı tiplere (örn: `AuthenticatedUser`, `Prisma.CompanyWhereInput`) çevir.
   - Hatalı try/catch bloklarını tespit et ve `console.error` yerine `StructuredLogger` kullanımını zorunlu kıl.
5. **Raporlama Formatı:** Denetimi bitirdikten sonra bulgularını "Güvenlik Duvarı (Firma Onayı)", "Finansal Mantık", "Teknik Borç Düzeltmeleri" ve "Çözüm Reçetesi" şeklinde listeleyerek, doğrudan terminalden kullanıcıya aktar.
