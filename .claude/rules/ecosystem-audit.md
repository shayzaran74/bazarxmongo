---
description: "BarterBorsa Ekosistem (BrandEcosystem) ve Bayi Ağı sistemi için uçtan uca denetim kuralları. `/ecosystem-audit` komutuyla tetiklenir."
globs: "apps/backend/src/modules/vendor/**/*.ts, apps/backend/src/modules/barter/**/*.ts, apps/backend/prisma/schema.prisma"
---

# 🌐 Ecosystem & Dealer Network Auditor Rules (Ekosistem Bayi Ağı)

Sen, BazarX (BarterBorsa) projesinde çalışan terminal tabanlı bir `Claude Code` asistanısın. Kullanıcı `/ecosystem-audit` yazdığında veya "ekosistem sistemini denetle" dediğinde aşağıdaki kuralları katı bir şekilde uygula:

1. **Katılım & Yetki Kontrolleri (Membership & RBAC):**
   - `AddEcosystemMemberHandler` içerisinde, eklenen bayi adayının (Vendor) aktif ve onaylanmış (`status === 'APPROVED'`) olup olmadığını doğrula.
   - Sadece Ekosistem Kurucusu'nun (`ownerId === user.id`) veya yetkili bir Admin/SuperAdmin'in ekosisteme üye ekleyebildiğinden veya çıkarabildiğinden emin ol.
   - Aynı bayinin birden fazla ekosisteme katılıp katılamayacağı (Business Rule) sınırlarını `schema.prisma` ve domain handler'larında test et (mevcut yapıda bir Vendor'un tek bir `ecosystemId` si vardır).
2. **Kör Havuz (Blind Pool) ve Gizlilik Denetimi:**
   - Ekosistem `isBlindPool === true` olarak ayarlanmışsa, bayi ağı içerisindeki takas işlemlerinde karşı tarafın kimliğinin (isim, logo, firma bilgisi) sipariş onaylanana kadar gizli tutulduğunu API response'ları üzerinden (DTO map) denetle.
3. **Komisyon İndirimleri (Internal Commission Rate):**
   - `CommissionEngineService` veya ilgili sipariş oluşturma (Order) süreçlerinde, eğer işlem aynı ekosistemdeki iki bayi arasında gerçekleşiyorsa, genel komisyon oranının değil, ekosisteme özel `internalCommRate` indiriminin (örn: %4) uygulandığını doğrula.
4. **Denetim Logları (EcosystemAuditLog):**
   - Üye ekleme, çıkarma, ekosistem ayarı değiştirme (isBlindPool, komisyon oranı güncelleme) gibi kritik eylemlerin tümünün `EcosystemAuditLog` tablosuna `severity: HIGH/INFO` ile eksiksiz yazıldığından emin ol.
5. **Teknik Borç ve TypeScript Hataları (Tech Debt & Type Safety):**
   - Kod tabanındaki (özellikle controller ve handler'lardaki) tüm `any` tiplerini `AuthenticatedUser`, `CreateEcosystemDto`, vb. kesin tiplere çevir.
   - Hatalı `console.error` kullanımlarını `StructuredLogger` ile değiştir ve exception swallowing (hata yutma) durumlarını düzelt.
6. **Raporlama Formatı:** Denetimi bitirdikten sonra bulgularını "Erişim Yetkileri (RBAC)", "Finansal Ayrıcalıklar", "Teknik Borç Düzeltmeleri" ve "Eksik Bulunanlar" başlıkları altında özetle ve terminalden kullanıcıya aktar.
