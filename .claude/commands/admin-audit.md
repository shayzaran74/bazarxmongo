# Admin Dashboard Security & System Audit
---
description: Admin panelindeki kritik fonksiyonları, yetkilendirmeyi ve sistem ayarlarını denetler.
---

Lütfen Admin Dashboard bileşenlerini (Backend & Frontend) şu noktalar üzerinden denetle:

1. **RBAC (Yetkilendirme):** 
   - Tüm admin endpoint'lerinde `@UseGuards(AdminGuard)` veya `@Roles(Role.ADMIN)` kontrolü var mı?
   - Frontend'de admin rotaları middleware (`auth-admin`) ile korunuyor mu?

2. **System Settings:** 
   - Komisyon oranları, kargo limitleri gibi kritik ayarların güncellenmesi sırasında `ValidationPipe` kullanılıyor mu?
   - Bu ayarların değişimi `AuditLog` servisine kaydediliyor mu?

3. **User & Vendor Management:** 
   - Vendor onaylama (approval) sürecinde durum geçişleri (`status machine`) doğru kurgulanmış mı?
   - Hassas işlemler (şifre sıfırlama, bakiye müdahalesi) için loglama yapılıyor mu?

4. **Analytics:** 
   - Dashboard istatistikleri (sales, users, revenue) çekilirken veritabanı performansı gözetilmiş mi? (Aggregations & Indexing).
