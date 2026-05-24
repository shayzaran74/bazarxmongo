---
Son Güncelleme: 2026-05-24 (Sprint 2-3-4 + Oturum 3 düzeltmeleri sonrası)
🗺️  SİSTEM HARİTASI — Ekosistem (Fabrika–Bayi Ağı) Modülü

Ekosistem Modülü (BarterBorsa Kurumsal / Dealer Network)
│
├── 📦 SHARED PERSISTENCE (Veritabanı Şemaları)
│   ├── brandEcosystem.schema.ts         ✅ Çalışıyor
│   │   Koleksiyon: brand_ecosystems
│   │   Alanlar: id, name, slug, description, status (ACTIVE/INACTIVE),
│   │            ownerId (Vendor ID), internalCommRate (Decimal128, default 4.0),
│   │            isBlindPool (Boolean, default true), maxMembers (Number, default 50),
│   │            logoUrl, createdAt, updatedAt
│   │   Alias'lar: internal_comm_rate, is_blind_pool, owner_id, logo_url, max_members
│   │   Export: createModelProxy → BrandEcosystem
│   │
│   ├── ecosystemAuditLog.schema.ts      ✅ Çalışıyor
│   │   Koleksiyon: ecosystem_audit_logs
│   │   Alanlar: id, ecosystemId, vendorId, action (string), severity (INFO/WARN/HIGH/CRITICAL),
│   │            details (Mixed), createdAt
│   │   Index'ler: ecosystemId, vendorId, action, severity
│   │   Export: createModelProxy → EcosystemAuditLog
│   │
│   ├── ecosystemMembership.schema.ts    ✅ Çalışıyor
│   │   Koleksiyon: ecosystem_memberships
│   │   Alanlar: id, dealerId, ecosystemId, status (ACTIVE/SUSPENDED), joinedAt, addedByUserId
│   │
│   └── ecosystemOrder.schema.ts         ✅ Çalışıyor
│       Koleksiyon: ecosystem_orders
│       Sipariş sonrası kota aggregate için kullanılır
│
├── 🏗️  DOMAIN
│   ├── entities/brand-ecosystem.entity.ts    ✅ Çalışıyor
│   │   AggregateRoot<BrandEcosystemProps>
│   │   Props: name, slug, description, status, ownerId, internalCommRate, isBlindPool, logoUrl
│   │   Factory: BrandEcosystem.create() → status='ACTIVE', internalCommRate=4.0, isBlindPool=true
│   │   Metod: setCommissionRate(rate)
│   │   Event: EcosystemCreatedEvent emit eder
│   │
│   ├── events/ecosystem-created.event.ts     ✅ Tanımlı + Handler mevcut
│   │   DomainEvent — ecosystemId, name, ownerId
│   │   Consumer: EcosystemCreatedHandler — loglama (Sprint 3)
│   │
│   ├── events/ecosystem-member-removed.event.ts  ✅ Tanımlı + Handler mevcut
│   │   Üye çıkarılınca BazarX unpublish tetikler (Sprint 3)
│   │
│   ├── events/listing-price-changed.event.ts     ✅ MAP kontrolü tetikler (Sprint 3)
│   │
│   ├── events/listing-visibility-changed.event.ts ✅
│   │
│   ├── constants/ecosystem.constants.ts          ✅
│   │
│   └── repositories/ (Interface'ler)
│       ├── brand-ecosystem.repository.interface.ts    ✅ YENİ (Oturum 3)
│       │   IBrandEcosystemRepository: findById, findByOwnerId, findAll, create, update, save
│       ├── ecosystem-audit-log.repository.interface.ts ✅ YENİ (Oturum 3)
│       │   IEcosystemAuditLogRepository: create, findByEcosystemId
│       ├── i-ecosystem-membership.repository.ts       ✅ (Sprint 2)
│       │   IEcosystemMembershipRepository: findActiveByDealerId, findByEcosystemId, findOne, create
│       └── i-ecosystem-order.repository.ts            ✅ (Sprint 2)
│
├── ⚙️  APPLICATION — Commands
│   ├── create-ecosystem.command.ts           ✅ userId, body: { name, description }
│   ├── create-ecosystem.handler.ts           ✅ Çalışıyor
│   │   • APEX tier kontrolü (vendor.tier !== 'APEX' → ForbiddenException)
│   │   • Tekil ekosistem kontrolü (findByOwnerId)
│   │   • Slug otomatik üretim (name + random)
│   │   • Entity.create() + ecosystemRepo.save(entity) + eventBus.publishAll()
│   │   • AuditLog: ECOSYSTEM_CREATED, severity: INFO
│   │
│   ├── add-ecosystem-member.command.ts       ✅ userId, memberVendorId, ecosystemId
│   ├── add-ecosystem-member.handler.ts       ✅ Çalışıyor + DÜZELTİLDİ (Oturum 3)
│   │   • Sadece ecosystem owner üye ekleyebilir
│   │   • Member vendor APPROVED olmalı
│   │   • APEX vendor başka ekosisteme üye olamaz
│   │   • Tek ekosisteme üyelik kontrolü (findOne)
│   │   • maxMembers limiti kontrolü (default 50) — YENİ
│   │   • IEcosystemMembershipRepository ile kayıt
│   │   • AuditLog: MEMBER_ADDED, severity: HIGH
│   │
│   ├── remove-ecosystem-member.command.ts    ✅ userId, memberVendorId
│   ├── remove-ecosystem-member.handler.ts    ✅ Çalışıyor
│   │   • Sadece ecosystem owner çıkarabilir
│   │   • EcosystemMemberRemovedEvent tetikler → BazarX unpublish
│   │   • AuditLog: MEMBER_REMOVED, severity: HIGH
│   │
│   ├── update-ecosystem-settings.command.ts  ✅ userId, settings: { isBlindPool?, internalCommRate? }
│   └── update-ecosystem-settings.handler.ts  ✅ Çalışıyor
│       • Sadece ecosystem owner güncelleyebilir
│       • isBlindPool ve internalCommRate güncellenebilir
│       • AuditLog: SETTINGS_UPDATED, severity: HIGH
│
├── ⚙️  APPLICATION — Queries
│   ├── get-my-ecosystem.query.ts             ✅ userId
│   ├── get-my-ecosystem.handler.ts           ✅ Çalışıyor
│   │   • Kurucu veya üye olarak arar (IEcosystemMembershipRepository)
│   │   • isApexPlus kontrolü
│   │   • Döner: { isOwner, ecosystem, isApexPlus }
│   │
│   ├── get-ecosystem-dashboard.query.ts      ✅ actorUserId, ecosystemId
│   ├── get-ecosystem-dashboard.handler.ts    ✅ Çalışıyor (Master Plan v4.3 §4)
│   │   • Marka Yönetim Paneli — bayi TrustScore + stok hareketleri
│   │   • Owner veya üye erişimi kontrolü
│   │   • Blind Pool: isAnonymousViewer → anon-XXXXXXXX maskeleme
│   │   • Her üye için: vendorId, vendorName, tier, trustScore, trustLevel,
│   │     violationCount, isFrozen, activeListings, recentTradeCount, lastActivityAt
│   │   • Summary: avgTrustScore, frozenCount, totalActiveItems, totalTradesLast30
│   │
│   ├── get-ecosystem-audit-logs.query.ts     ✅ userId
│   └── get-ecosystem-audit-logs.handler.ts   ✅ Çalışıyor (son 20 log)
│
├── ⚙️  APPLICATION — Event Handlers
│   ├── ecosystem-created.handler.ts          ✅ Loglama (Sprint 3)
│   ├── ecosystem-member-removed.handler.ts   ✅ BazarX unpublish tetikler (Sprint 3)
│   ├── listing-price-changed.handler.ts      ✅ MAP kontrolü (Sprint 3)
│   └── listing-visibility-changed.handler.ts ✅
│
├── ⚙️  APPLICATION — Services
│   ├── bazarx-publish.service.ts             ✅ Publish/unpublish + MAP kontrolü (Sprint 3)
│   ├── garage-sale.service.ts                ✅ Garaj günü kampanya yönetimi (Sprint 2)
│   ├── watchover.service.ts                  ✅ checkSmartCap() + checkDealerQuota() (Sprint 2)
│   └── commission-engine.service.ts          ✅ Komisyon motoru — internalCommRate uygulaması
│
├── ⚙️  APPLICATION — Schedulers
│   └── garage-sale.scheduler.ts              ✅ Cron ile otomatik açma/kapama (Sprint 2)
│
├── ⚙️  APPLICATION — DTOs
│   ├── create-ecosystem.dto.ts               ✅ name (2-100 karakter), description? (max 500)
│   └── update-ecosystem-settings.dto.ts      ✅ isBlindPool?, internalCommRate? (1-20 arası)
│
├── 🗄️  INFRASTRUCTURE — Repositories
│   ├── mongo-brand-ecosystem.repository.ts   ✅ DÜZELTİLDİ (Oturum 3)
│   │   implements IBrandEcosystemRepository
│   │   Metodlar: findById, findByOwnerId, findAll, create, update, save
│   │
│   ├── mongo-ecosystem-audit-log.repository.ts ✅ DÜZELTİLDİ (Oturum 3)
│   │   implements IEcosystemAuditLogRepository
│   │   Metodlar: create, findByEcosystemId
│   │
│   ├── repositories/mongo-ecosystem-membership.repository.ts ✅ (Sprint 2)
│   │   implements IEcosystemMembershipRepository
│   │
│   └── repositories/mongo-ecosystem-order.repository.ts      ✅ (Sprint 2)
│
├── 🌐 PRESENTATION — Controllers
│   ├── ecosystem.controller.ts               ✅ Çalışıyor (Vendor API)
│   │   Route: /api/v1/ecosystem
│   │   Guard: JwtAuthGuard + RolesGuard
│   │   Roller: VENDOR, ADMIN, SUPER_ADMIN
│   │   Endpoint'ler:
│   │   ├── GET  /ecosystem/my                ✅ Kendi ekosistem durumum
│   │   ├── POST /ecosystem/create            ✅ Yeni ekosistem kur (APEX zorunlu)
│   │   ├── PATCH /ecosystem/settings         ✅ isBlindPool + internalCommRate güncelle
│   │   ├── GET  /ecosystem/audit             ✅ Denetim logları
│   │   ├── POST /ecosystem/members           ✅ Üye ekle (body: { memberVendorId })
│   │   ├── GET  /ecosystem/:ecosystemId/dashboard  ✅ Yönetim paneli (TrustScore + stok)
│   │   └── DELETE /ecosystem/members/:vendorId     ✅ Üye çıkar
│   │
│   ├── ecosystem-admin.controller.ts         ✅ Çalışıyor (Admin API) + DÜZELTİLDİ (Oturum 3)
│   │   Route: /api/v1/admin/ecosystems
│   │   Guard: JwtAuthGuard + RolesGuard
│   │   Roller: ADMIN, SUPER_ADMIN
│   │   Endpoint'ler:
│   │   ├── GET  /admin/ecosystems            ✅ Tüm ekosistemler (owner, members, stats, commissionStats)
│   │   ├── GET  /admin/ecosystems/logs       ✅ Tüm audit logları (batch populate)
│   │   ├── GET  /admin/ecosystems/map-violations ✅ YENİ — MAP ihlal listesi (Oturum 3)
│   │   ├── POST /admin/ecosystems/trust-score ✅ TrustScore override
│   │   └── DELETE /admin/ecosystems/members/:vendorId ✅ Admin üye çıkarma
│   │
│   └── dealer.controller.ts                  ✅ (Sprint 2)
│       Route: /api/v1/dealer
│       Endpoint'ler:
│       └── GET  /dealer/garage-sales         ✅ Aktif garaj günü kampanyaları (üye olunan ekosistemlerde)
│
├── 📦 MODULE REGISTRATION (vendor.module.ts)
│   ✅ Tüm handler'lar kayıtlı (command + query + event)
│   ✅ Tüm schema'lar kayıtlı
│   ✅ Tüm repository'ler ve service'ler provider olarak kayıtlı
│   ✅ Tüm controller'lar kayıtlı
│
├── 🛡️  MIDDLEWARE
│   ├── 01.ecosystem-guard.global.ts          ✅ Global middleware
│   │   • /barterborsa ve /ticaritakas rotaları için auth kontrolü
│   │   • /barterborsa: APEX tier kontrolü (vendor.tier === 'APEX')
│   │
│   └── ecosystemGuard.ts                     ✅ Route-level middleware
│       • /surplus rotaları için vendor kontrolü
│       • Dış erişim engelleme (sadece uygulama içi navigasyona izin)
│
├── 📜 MIGRATION SCRIPTS
│   ├── 2026-05-19-listing-ecosystem-fields.ts ✅ Listing default backfill
│   ├── 2026-05-24-listing-bazarx-fields.ts    ✅ BazarX publish alanları (Sprint 3)
│   ├── 2026-05-24-order-ecosystem-fields.ts   ✅ Order ecosystem alanları (Sprint 3)
│   └── 2026-05-24-ecosystem-membership-backfill.ts ✅ Membership backfill
│
└── 🖥️  FRONTEND
    ├── pages/
    │   ├── admin/ecosystems.vue              ✅ Watchtower admin paneli
    │   └── vendor/ecosystem.vue              ✅ Vendor ekosistem yönetim sayfası (Sprint 4)
    │       + vendor/ecosystem/index.vue
    │
    ├── composables/
    │   ├── useAdminEcosystems.ts              ✅ Strict typed (Sprint 4)
    │   │   Interface'ler: AdminEcosystem, AdminEcosystemMember, AdminAuditLog, TrustScoreOverrideDto
    │   │   Fonksiyonlar: fetchData, submitOverride, removeMember
    │   │
    │   └── useVendorEcosystem.ts              ✅ Çalışıyor
    │       Fonksiyonlar: fetchData, createEcosystem, updateSettings, addMember, removeMember
    │       isApexPlus computed (APEX tier kontrolü)
    │
    ├── components/admin/ecosystems/
    │   ├── EcoList.vue                       ✅ Ekosistem listesi
    │   ├── EcoSidebar.vue                    ✅ 3 sekme: Üyeler / MAP İhlaller / Audit
    │   ├── EcoStats.vue                      ✅ İstatistik kartları
    │   ├── EcoAuditLogs.vue                  ✅ Audit log listesi
    │   └── TrustOverrideModal.vue            ✅ TrustScore override modalı
    │
    ├── components/vendor/ecosystem/
    │   ├── EcosystemInviteModal.vue           ✅ Bayi arama + ekle
    │   ├── EcosystemMembersTable.vue          ✅ Üye bayiler tablosu
    │   ├── EcosystemStatsSidebar.vue          ✅ Performans istatistikleri
    │   ├── EcosystemWatchtower.vue            ✅ Güvenlik günlüğü
    │   ├── BazarXPublishTable.vue             ✅ Publish toggle + MAP ihlal gösterimi (Sprint 4)
    │   ├── GarageSaleCard.vue                 ✅ Garaj günü kampanya kartı (Sprint 4)
    │   └── EcosystemUpgradeBanner.vue         ✅ Kota dolunca yükseltme CTA (Sprint 4)
    │
    └── components/product/form/
        └── ProductFormEcosystem.vue            ✅ Ürün formu ekosistem alanları (209 satır)

---
🔴 AÇIK SORUNLAR — Tümü Kapatıldı (Oturum 3)

Eski #1 (Entity bypass)     → ✅ DÜZELTİLDİ — BrandEcosystem.create() + save() + publishAll()
Eski #3 (Repository interface) → ✅ DÜZELTİLDİ — IBrandEcosystemRepository + IEcosystemAuditLogRepository
Eski E4 (maxMembers eksik)   → ✅ DÜZELTİLDİ — Schema'ya maxMembers eklendi, handler'da limit kontrolü
Eski E5 (MAP endpoint yok)   → ✅ DÜZELTİLDİ — GET /admin/ecosystems/map-violations

---
✅ ÇALIŞAN ÖZELLİKLER (Tümü doğrulanmış — ekosistem-dogrulama.md)

Özellik                                      Durum
──────────────────────────────────────────── ────────
Ekosistem oluşturma (APEX zorunlu)            ✅
Ekosistem oluşturma domain event + handler    ✅
Tekil ekosistem limiti                        ✅
Üye ekleme (APPROVED + maxMembers kontrolü)   ✅
Üye çıkarma (owner + admin)                  ✅
Üye çıkarılınca BazarX unpublish              ✅
Ayar güncelleme (blindPool, commRate)         ✅
Audit logging (tüm CRUD + HIGH severity)      ✅
Admin paneli (Watchtower) + commissionStats   ✅
Admin MAP violations endpoint                 ✅
Dashboard sorgusu (TrustScore + stok + trade)  ✅
Blind Pool kimlik maskeleme (anon-ID)          ✅
Ürün formu ekosistem alanları                 ✅
Route guard (APEX tier)                       ✅
Ekosistem içi takas yasağı                    ✅
Smart Cap (%25)                               ✅
Dealer kota (maxOrderQtyPerDealer)            ✅
EcosystemOrder kaydı                          ✅
Garaj Günü flash sale + scheduler             ✅
BazarX publish / unpublish + MAP kontrolü      ✅
ListingPriceChanged event + handler            ✅
Order ecosystem alanları                      ✅
Admin strict typing                           ✅
Vendor ekosistem sayfası                      ✅
Ekosistem kota progress bar + upgrade banner   ✅
Repository interface'ler (DDD uyumlu)          ✅
maxMembers üye limiti                          ✅

---
📋 ENDPOINT HARİTASI

Vendor API (/api/v1/ecosystem):
  GET    /my                          → Kendi ekosistem durumum (kurucu/üye)
  POST   /create                      → Yeni ekosistem kur (APEX zorunlu)
  PATCH  /settings                    → isBlindPool + internalCommRate güncelle
  GET    /audit                       → Denetim logları (son 20)
  POST   /members                     → Üye ekle (body: { memberVendorId })
  GET    /:ecosystemId/dashboard      → Yönetim paneli (TrustScore + stok)
  DELETE /members/:vendorId           → Üye çıkar

Dealer API (/api/v1/dealer):
  GET    /garage-sales                → Aktif garaj günü kampanyaları

Admin API (/api/v1/admin/ecosystems):
  GET    /                            → Tüm ekosistemler (detaylı — owner, members, stats, commissionStats)
  GET    /logs                        → Tüm audit logları (batch populate)
  GET    /map-violations              → MAP ihlal listesi (fiyat < minMarketPrice)
  POST   /trust-score                 → TrustScore override (body: { vendorId, newScore, reason })
  DELETE /members/:vendorId           → Admin üye çıkarma

---
🏗️  MİMARİ NOTLAR

• Ekosistem modülü vendor modülü içinde yaşıyor (ayrı modül değil)
• Repository'ler interface kullanıyor ✅ (IBrandEcosystemRepository, IEcosystemAuditLogRepository)
• Entity.create() + repo.save() + eventBus.publishAll() pattern'i uygulanıyor ✅
• Vendor.ecosystemId + EcosystemMembership ayrı koleksiyon ile 1:N ilişki
• Listing'lerde bazarxPublished + internetSalesEnabled + minMarketPrice alanları mevcut
• Admin panelinde batch sorgular optimize (N+1 yok — Promise.all + Map yapısı)
• maxMembers ile üye limiti kontrolü (default 50)

---
📋 ÜRÜN SAHİBİ İŞ TANIMI

BarterBorsa sayfası ekosistemin ana sayfasıdır. Kimlerin ekosistemde var olduğu
ve reklamlarının döndüğü genel bilgilendirmelerin olduğu bir sayfa.

Ekosistem özelliğini satın alan fabrika APEX üyeliği yaptırmak zorunda.
Bu üyelik sonrası kendi bayilerini yarattığı ekosisteme kayıt etmeli.

1. Ürünler sadece o fabrikaya ait ekosistemde listeleniyor ve bayiler buradan
   sepete atarak sipariş geçebiliyorlar.
   → Listing.bazarxPublished.ecosystemId ✅ + CheckoutService ✅

2. Fabrikanın uyguladığı depo günlerinde ürünlere kota uygulaması koyabilir
   (örneğin en fazla 5 adet indirimli bu üründen alabilir).
   → GarageSaleService + WatchoverService.checkDealerQuota() ✅

3. Bayilerin her türlü hareketini fabrikalar kendi ürünlerinde takibini yapabilecek.
   → EcosystemAuditLog + Dashboard (TrustScore + stok + trade) ✅

4. Bayilerin internet satış yetkisi varsa tek tıkla BazarX'te yayınlamaya başlayabilecek
   fakat fabrikanın fiyat politikasının altında kalmadığını görebiliyor olması lazım.
   → BazarXPublishService + ListingPriceChangedEvent + MAP violations ✅
