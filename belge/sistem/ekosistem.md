---
Son Güncelleme: 2026-05-24 (Sprint 2-3-4 sonrası)
🗺️  SİSTEM HARİTASI — Ekosistem (Fabrika–Bayi Ağı) Modülü

Ekosistem Modülü (BarterBorsa Kurumsal / Dealer Network)
│
├── 📦 SHARED PERSISTENCE (Veritabanı Şemaları)
│   ├── brandEcosystem.schema.ts         ✅ Çalışıyor
│   │   Koleksiyon: brand_ecosystems
│   │   Alanlar: id, name, slug, description, status (ACTIVE/INACTIVE),
│   │            ownerId (Vendor ID), internalCommRate (Decimal128, default 4.0),
│   │            isBlindPool (Boolean, default true), logoUrl, createdAt, updatedAt
│   │   Alias'lar: internal_comm_rate, is_blind_pool, owner_id, logo_url, created_at, updated_at
│   │   Export: createModelProxy → BrandEcosystem
│   │
│   └── ecosystemAuditLog.schema.ts      ✅ Çalışıyor
│       Koleksiyon: ecosystem_audit_logs
│       Alanlar: id, ecosystemId, vendorId, action (string), severity (INFO/WARN/HIGH/CRITICAL),
│                details (Mixed), createdAt
│       Index'ler: ecosystemId, vendorId, action, severity
│       Export: createModelProxy → EcosystemAuditLog
│
├── 🏗️  DOMAIN
│   ├── entities/brand-ecosystem.entity.ts    ✅ Çalışıyor
│   │   AggregateRoot<BrandEcosystemProps>
│   │   Props: name, slug, description, status, ownerId, internalCommRate, isBlindPool, logoUrl
│   │   Factory: BrandEcosystem.create() → status='ACTIVE', internalCommRate=4.0, isBlindPool=true
│   │   Metod: setCommissionRate(rate)
│   │   Event: EcosystemCreatedEvent emit eder
│   │   ⚠️ Entity create() kullanılıyor ama handler'da doğrudan repository.create() çağrılıyor — entity bypass
│   │
│   └── events/ecosystem-created.event.ts     ✅ Tanımlı
│       DomainEvent — ecosystemId, name, ownerId
│       ⚠️ Event handler (listener) yok — event fire ediliyor ama consume edilmiyor
│
├── ⚙️  APPLICATION — Commands
│   ├── create-ecosystem.command.ts           ✅ userId, body: { name, description }
│   ├── create-ecosystem.handler.ts           ✅ Çalışıyor
│   │   • APEX tier kontrolü (vendor.tier !== 'APEX' → ForbiddenException)
│   │   • Tekil ekosistem kontrolü (findByOwnerId)
│   │   • Slug otomatik üretim (name + random)
│   │   • AuditLog: ECOSYSTEM_CREATED, severity: HIGH
│   │   ⚠️ Entity.create() KULLANMIYOR — doğrudan ecosystemRepo.create() çağırıyor
│   │
│   ├── add-ecosystem-member.command.ts       ✅ userId, memberVendorId
│   ├── add-ecosystem-member.handler.ts       ✅ Çalışıyor
│   │   • Sadece ecosystem owner üye ekleyebilir (findByOwnerId)
│   │   • Member vendor APPROVED olmalı
│   │   • Tek ekosisteme üyelik kontrolü (vendor.ecosystemId boş olmalı)
│   │   • vendorRepo.update(id, { ecosystemId }) ile ilişkilendirir
│   │   • AuditLog: MEMBER_ADDED, severity: HIGH
│   │
│   ├── remove-ecosystem-member.command.ts    ✅ userId, memberVendorId
│   ├── remove-ecosystem-member.handler.ts    ✅ Çalışıyor
│   │   • Sadece ecosystem owner çıkarabilir
│   │   • vendorRepo.update(id, { ecosystemId: undefined })
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
│   │   • Kurucu (findByOwnerId) veya üye (findById(vendor.ecosystemId)) olarak arar
│   │   • isApexPlus kontrolü
│   │   • Döner: { isOwner, ecosystem, isApexPlus }
│   │
│   ├── get-ecosystem-dashboard.query.ts      ✅ actorUserId, ecosystemId
│   ├── get-ecosystem-dashboard.handler.ts    ✅ Çalışıyor (Master Plan v4.3 §4)
│   │   • Marka Yönetim Paneli — bayi TrustScore + stok hareketleri
│   │   • Owner veya üye erişimi kontrolü
│   │   • Her üye için: vendorId, vendorName, tier, trustScore, trustLevel,
│   │     violationCount, isFrozen, activeListings, recentTradeCount, lastActivityAt
│   │   • Summary: avgTrustScore, frozenCount, totalActiveItems, totalTradesLast30
│   │   • IListingRepository, ITrustScoreRepository, ISwapSessionRepository inject
│   │
│   ├── get-ecosystem-audit-logs.query.ts     ✅ userId
│   └── get-ecosystem-audit-logs.handler.ts   ✅ Çalışıyor
│       • Kurucunun ekosistemi üzerinden audit logları çeker (son 20)
│       • Doğrudan BrandEcosystem + EcosystemAuditLog model proxy kullanıyor
│
├── ⚙️  APPLICATION — DTOs
│   ├── create-ecosystem.dto.ts               ✅ name (2-100 karakter), description? (max 500)
│   └── update-ecosystem-settings.dto.ts      ✅ isBlindPool?, internalCommRate? (1-20 arası)
│
├── 🗄️  INFRASTRUCTURE — Repositories
│   ├── mongo-brand-ecosystem.repository.ts   ✅ Çalışıyor
│   │   Injectable, createModelProxy kullanır
│   │   Metodlar: findById, findByOwnerId, findAll, create, update
│   │   ⚠️ Interface yok — doğrudan concrete class inject ediliyor (DDD ihlali)
│   │
│   └── mongo-ecosystem-audit-log.repository.ts ✅ Çalışıyor
│       Injectable, createModelProxy kullanır
│       Metodlar: create, findByEcosystemId
│       ⚠️ Interface yok — doğrudan concrete class inject ediliyor
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
│   └── ecosystem-admin.controller.ts         ✅ Çalışıyor (Admin API)
│       Route: /api/v1/admin/ecosystems
│       Guard: JwtAuthGuard + RolesGuard
│       Roller: ADMIN, SUPER_ADMIN
│       Inject: IVendorRepository, ITrustScoreRepository, Vendor/Company/Listing/EcosystemAuditLog Model
│       Endpoint'ler:
│       ├── GET  /admin/ecosystems            ✅ Tüm ekosistemler (owner, members, stats, listings, auditLog sayısı)
│       ├── GET  /admin/ecosystems/logs       ✅ Tüm audit logları (batch vendor+company+ecosystem populate)
│       ├── POST /admin/ecosystems/trust-score ✅ Bayi TrustScore override (oldScore/newScore + audit log)
│       └── DELETE /admin/ecosystems/members/:vendorId ✅ Admin tarafından üye çıkarma
│
├── 📦 MODULE REGISTRATION (vendor.module.ts)
│   ✅ Tüm handler'lar kayıtlı:
│     CreateEcosystemHandler, AddEcosystemMemberHandler,
│     RemoveEcosystemMemberHandler, UpdateEcosystemSettingsHandler
│     GetMyEcosystemHandler, GetEcosystemAuditLogsHandler, GetEcosystemDashboardHandler
│   ✅ Schema'lar kayıtlı:
│     BrandEcosystem (BrandEcosystemSchema), EcosystemAuditLog (EcosystemAuditLogSchema)
│   ✅ Repository'ler provider olarak kayıtlı:
│     MongoBrandEcosystemRepository, MongoEcosystemAuditLogRepository
│   ✅ Controller'lar kayıtlı:
│     EcosystemController, EcosystemAdminController
│
├── 🛡️  MIDDLEWARE
│   ├── 01.ecosystem-guard.global.ts          ✅ Global middleware
│   │   • /barterborsa ve /ticaritakas rotaları için auth kontrolü
│   │   • /barterborsa: APEX tier kontrolü (vendor.tier === 'APEX')
│   │   • Admin bypass yok (kasıtlı)
│   │
│   └── ecosystemGuard.ts                     ✅ Route-level middleware
│       • /surplus rotaları için vendor kontrolü
│       • Dış erişim engelleme (sadece uygulama içi navigasyona izin)
│
├── 📜 MIGRATION SCRIPTS
│   └── 2026-05-19-listing-ecosystem-fields.ts ✅ Backfill
│       • Mevcut listing'lere ekosistem alanları ekler
│       • visibleTo = 'NONE', allowOnlineResale = false, selectedDealerIds = []
│       • maxOrderQtyPerDealer: ecosystemId olan kayıtlar için admin manual set
│
└── 🖥️  FRONTEND
    ├── pages/
    │   └── admin/ecosystems.vue              ✅ Çalışıyor (65 satır)
    │       Watchtower admin paneli — ekosistem listesi, sidebar, üye yönetimi
    │       Bileşenler: EcoStats, EcoList, EcoSidebar, EcoAuditLogs, TrustOverrideModal
    │
    ├── composables/
    │   ├── useAdminEcosystems.ts              ✅ Çalışıyor (79 satır)
    │   │   Admin paneli state yönetimi
    │   │   API: /api/v1/admin/ecosystems + /api/v1/admin/ecosystems/logs
    │   │   Fonksiyonlar: fetchData, removeMember, overrideTrustScore
    │   │   ⚠️ Tüm tipler any — strict typing eksik
    │   │
    │   └── useVendorEcosystem.ts              ✅ Çalışıyor (105 satır)
    │       Vendor tarafı ekosistem yönetimi
    │       API: /api/v1/ecosystem/my + /api/v1/ecosystem/audit + /api/v1/vendors/me
    │       Fonksiyonlar: fetchData, createEcosystem, updateSettings, addMember, removeMember
    │       isApexPlus computed (APEX tier kontrolü)
    │
    ├── components/admin/ecosystems/
    │   ├── EcoList.vue                       ✅ Ekosistem listesi (kart görünümü)
    │   ├── EcoSidebar.vue                    ✅ Seçili ekosistem detayı + üye listesi + aksiyonlar
    │   ├── EcoStats.vue                      ✅ İstatistik kartları (aktif, stok, değer, ihlal)
    │   ├── EcoAuditLogs.vue                  ✅ Audit log listesi (severity badge, vendor ismi)
    │   └── TrustOverrideModal.vue            ✅ TrustScore override modalı (skor + sebep)
    │
    ├── components/vendor/ecosystem/
    │   ├── EcosystemInviteModal.vue           ✅ Bayi arama + ekle modalı (61 satır)
    │   ├── EcosystemMembersTable.vue          ✅ Üye bayiler tablosu (68 satır)
    │   ├── EcosystemStatsSidebar.vue          ✅ Performans istatistikleri (66 satır)
    │   └── EcosystemWatchtower.vue            ✅ Güvenlik günlüğü / canlı izleme (50 satır)
    │
    └── components/product/form/
        └── ProductFormEcosystem.vue            ✅ Ürün formu ekosistem alanları (209 satır)
            Master Plan v4.3 §4.2 + §4.3
            Alanlar: visibility, minMarketPrice, maxPurchasePerMember,
                     ecosystemId, visibleTo (ALL_DEALERS/SELECTED_DEALERS/NONE),
                     selectedDealerIds, availableFrom/To, allowOnlineResale

---
🔴 AÇIK SORUNLAR VE EKSİKLER (Güncellendi 2026-05-24 — Sprint 2-3-4 sonrası)

┌─────┬───────────────────────────────────────┬──────────────────────────────────────────────────────┬──────────────────────────────────────────┐
│  #  │               Dosya                   │                        Sorun                         │                  Etki                    │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 1   │ create-ecosystem.handler.ts           │ Entity.create() kullanılmıyor, doğrudan repo.create()│ Domain event (EcosystemCreatedEvent)     │
│     │                                       │ çağrılıyor — entity bypass                           │ hiç fire edilmiyor                       │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 2   │ ecosystem-created.event.ts            │ Event tanımlı, EcosystemCreatedHandler var ✅    │ Consumer mevcut — loglama yapıyor         │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 3   │ Repository'ler                        │ Interface yok — doğrudan concrete class inject        │ DDD prensip ihlali, test zorluğu         │
│     │                                       │ (MongoBrandEcosystemRepository)                      │                                          │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 4   │ Komisyon Engine                       │ internalCommRate Sipariş'te uygulanıyor ✅             │ CheckoutService'de platformCommission     │
│     │                                       │                                                      │ Rate/Amount hesaplanıyor                  │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 5   │ Blind Pool mantığı                    │ GetEcosystemDashboardHandler'da maskeleme yapılıyor ✅ │ Anonim ID (anon-XXXXXXXX), hidden score  │
│     │                                       │                                                      │ (Sprint 3)                               │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 6   │ Ekosistem içi takas yasağı            │ offers.controller.ts'de kontrol var ✅               │ IEcosystemMembershipRepository kullanılıyor│
│     │                                       │                                                      │ (Sprint 2 Görev C1)                      │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 7   │ useAdminEcosystems.ts                │ Tüm tipler strict yazıldı ✅ (Sprint 4 Görev D)      │ Artık `any` yok                          │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 8   │ Vendor panel (frontend)               │ pages/vendor/ecosystem.vue eklendi ✅                │ Mevcut component'lar entegre edildi      │
│     │                                       │ (Sprint 4)                                          │ BazarXPublishTable + GarageSaleCard       │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 9   │ Smart Cap (%25 havuz payı)           │ WatchoverService.checkSmartCap() uygulanıyor ✅       │ Checkout'te session ile atomic kontrol    │
│     │                                       │                                                      │ (Sprint 2 Görev A2)                      │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 10  │ EcosystemOrder kaydı                 │ Sipariş sonrası EcosystemOrder oluşturuluyor ✅       │ CheckoutService + IEcosystemOrderRepo    │
│     │                                       │                                                      │ (Sprint 2)                               │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 11  │ Garaj Günü (flash sale)              │ GarageSaleService + GarageSaleScheduler ✅            │ Atomic stock, kota, cron activation       │
│     │                                       │                                                      │ (Sprint 2 Görev B2-B4)                   │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 12  │ BazarX Publish / MAP Enforce          │ BazarXPublishService + MAP kontrolü ✅               │ ListingPriceChangedEvent, minMarketPrice  │
│     │                                       │                                                      │ (Sprint 3)                               │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 13  │ Üye çıkarılınca BazarX unpublish      │ EcosystemMemberRemovedEvent + Handler ✅              │ Otomatik unpublish (Sprint 3)            │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 14  │ Listing ecosystem alanları            │ bazarxPublished + internetSalesEnabled ✅             │ MAP kuralları, publish toggle UI         │
│     │                                       │                                                      │ (Sprint 3-4)                             │
├─────┼───────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ 15  │ Order ecosystem alanları              │ isEcosystemOrder, platformCommissionRate/Amount ✅    │ Order entity + mapper + schema           │
│     │                                       │                                                      │ (Sprint 3)                               │
└─────┴───────────────────────────────────────┴──────────────────────────────────────────────────────┴──────────────────────────────────────────┘

---
✅ ÇALIŞAN ÖZELLİKLER (Sprint 2-3-4 sonrası güncellendi)

Özellik                                      Durum    Not
──────────────────────────────────────── ──────── ──────────────────────────────────────────────────────
Ekosistem oluşturma (APEX zorunlu)           ✅      CreateEcosystemHandler — tier kontrolü çalışıyor
Ekosistem oluşturma domain event             ✅      BrandEcosystem.create() → EventBus.publishAll() (Sprint 3)
EcosystemCreatedEvent handler                ✅      EcosystemCreatedHandler — loglama (Sprint 3)
Tekil ekosistem limiti                        ✅      Bir vendor yalnızca bir ekosistem kurabilir
Üye ekleme (APPROVED kontrolü)                ✅      AddEcosystemMemberHandler — status + tekil üyelik kontrolü
Üye çıkarma (owner + admin)                  ✅      RemoveEcosystemMemberHandler + EcosystemAdminController
Üye çıkarılınca BazarX unpublish              ✅      EcosystemMemberRemovedEvent → Handler (Sprint 3)
Ayar güncelleme (blindPool, commRate)        ✅      UpdateEcosystemSettingsHandler
Audit logging                                 ✅      Tüm CRUD eylemlerinde HIGH severity ile log
Admin paneli (Watchtower)                     ✅      Ekosistem listesi, üye detayı, TrustScore override
Admin commissionStats                         ✅      GET /admin/ecosystems → stats.commissionStats (Sprint 3)
Dashboard sorgusu                             ✅      TrustScore + stok + trade istatistikleri (30 gün)
Blind Pool kimlik maskeleme                   ✅      Dashboard'da anon-ID + hidden score (Sprint 3)
Ürün formu ekosistem alanları               ✅      visibleTo, allowOnlineResale, maxPurchasePerMember
Route guard (APEX tier)                      ✅      /barterborsa rotaları APEX tier gerektirir
Ekosistem içi takas yasağı                   ✅      offers.controller → IEcosystemMembershipRepo (Sprint 2)
Smart Cap (%25)                              ✅      WatchoverService.checkSmartCap() — checkout'ta atomic (S2)
Dealer kota (maxOrderQtyPerDealer)           ✅      WatchoverService.checkDealerQuota() — session ile (S2)
EcosystemOrder kaydı                          ✅      Checkout'ta oluşturuluyor — quota aggregate (Sprint 2)
Garaj Günü flash sale                        ✅      GarageSaleService + Scheduler — atomic stock (Sprint 2)
BazarX publish / unpublish                   ✅      BazarXPublishService + toggle UI (Sprint 3-4)
BazarX MAP uyarı UI                          ✅      BazarXPublishTable — ihlal gösterimi, disabled (Sprint 4)
ListingPriceChanged event + handler          ✅      MAP kontrolü (Sprint 3)
Order ecosystem alanları                     ✅      isEcosystemOrder, platformCommissionRate/Amount (Sprint 3)
Admin strict typing                          ✅      Tüm `any` kaldırıldı (Sprint 4 Görev D)
Vendor ekosistem sayfası                       ✅      pages/vendor/ecosystem.vue + GarageSaleCard (Sprint 4)
Ekosistem kota progress bar                   ✅      membershipCount/limit bar (Sprint 4)
EcosystemUpgradeBanner                        ✅      Kota dolunca yükseltme CTA (Sprint 4)
EcoSidebar MAP sekmesi                        ✅      3 sekme: Üyeler / MAP İhlaller / Audit (Sprint 4)
Listing ecosystem migration                   ✅      2026-05-24-listing-bazarx-fields.ts (Sprint 3)
Order ecosystem migration                      ✅      2026-05-24-order-ecosystem-fields.ts (Sprint 3)

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

Admin API (/api/v1/admin/ecosystems):
  GET    /                            → Tüm ekosistemler (detaylı — owner, members, stats)
  GET    /logs                        → Tüm audit logları (populate: vendor + company + ecosystem)
  POST   /trust-score                 → TrustScore override (body: { vendorId, newScore, reason })
  DELETE /members/:vendorId           → Admin üye çıkarma

---
🏗️  MİMARİ NOTLAR

• Ekosistem modülü vendor modülü içinde yaşıyor (ayrı modül değil)
• Repository'ler interface kullanmıyor — doğrudan MongoBrandEcosystemRepository inject
• Entity.create() handler'da kullanılmıyor — domain event'ler fire edilmiyor
• Vendor.ecosystemId alanı ile 1:N ilişki kuruluyor (bir vendor bir ekosisteme üye olabilir)
• Listing'lerde ecosystemId + visibleTo + allowOnlineResale + selectedDealerIds alanları mevcut
  (migration script ile backfill yapılmış)
• Admin panelinde batch sorgular optimize (N+1 yok — Promise.all + Map yapısı)



Barerborsa sayfası ecosistemin ana sayfasıdır ve bu kimlerin ecosistem de vafr olduğu ve reklamlarının döndügü genel bilgilendirmelerin oldugu bir  sayfa o yüzden ecosistem özelliğini satrın alan fabrika apex üyeliği yaptırmak zorunda bu üyelik sonrası kendi bayilerini yarattığı ecosisteme kayıt etmeli. şimdi ecosistemde ürünler yüklendiğinde 1-ürünler sadece o fabrikaya ait ecosistemde listelenebiliyor ve bayiler buradan sepete atarak sipariş geçebiliyorlar 2-fabrikanın uyguladığı depo günlerinde ürünlere kota uygulaması koyabilir örnegin en fazla 5 adet indirimli bu üründen alabilir wachower var fabrikanın 3-bayilerin her türlü hareketini fabrikalar kendi ürünlerinde takibini yapabilecek 4-bayilerin internet satış yetkisi var ise tek tıkla bazarx te yayınlamaya başlıyabilecek fakat fabrikanın fiyat politikasının altında kalmadığını görebiliyor olması lazım  
