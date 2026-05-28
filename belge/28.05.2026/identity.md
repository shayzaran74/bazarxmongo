# BazarX Identity & Auth — Mimari Denetim & Düzeltme Raporu

> **Hazırlayan:** Senior Developer Review
> **İlk Yayın:** 2026-05-28 · **Güncelleme:** 2026-05-28 (v5 — Sprint 2 P1 görevleri uygulandı)
> **Kapsam:** Backend Identity Module, Shared-Security, Domain-Identity, Frontend Auth, Persistence Layer
> **Branch:** main (audit commit `f4129309`)

---

## 0. Bu Güncellemede Ne Var? (Changelog)

**v5 (Sprint 2 — P1 görevleri: CSRF, LocalStrategy, Fail-fast secrets):**
- ✅ `CsrfMiddleware` — NestJS global middleware, double-submit cookie pattern (cookie == header)
- ✅ `GET /auth/csrf` endpoint — backend `csrf_token` cookie set eder, frontend `csrfToken` store'a alır
- ✅ `AppModule.configure()` — `CsrfMiddleware` tüm route'lara uygulandı
- ✅ Frontend `auth.ts` — `fetchCsrf()` action eklendi, `init()` sıralaması: fetchCsrf → fetchUser
- ✅ `LocalStrategy.validate()` — placeholder kaldırıldı, `LoginUserCommand` üzerinden domain validasyon
- ✅ `GoogleOAuthStrategy` — dummy credential'larda startup error; GOOGLE_CLIENT_ID eksikse warn + devre dışı
- ✅ `EncryptionService` — `validateKey()` ile TokenService pattern'i uygulandı (default key yasak)

**v4 (Sprint 2 — Bölüm 11: Vendor coupling refactor):**
- ✅ `MongoUserRepository.findById/findByEmail` saflaştırıldı — Vendor/Company join'leri kaldırıldı
- ✅ `UserProjectionService` — tek `$lookup` aggregation pipeline ile 4 sorgu → 1 (users→profiles→vendors→companies)
- ✅ `IUserProjectionService` arayüzü domain-identity paketinde tanımlandı, uygulama katmanında implement edildi
- ✅ `UserFullDto` — tam profil DTO'su (profile + vendor + company nested)
- ✅ `GetUserHandler` rewrite — `IUserProjectionService` üzerinden projeksiyon servisi kullanıyor
- ✅ `AuthService.login/googleLogin` — `getFullProfile()` ile tam profil döndürüyor
- ✅ `IdentityModule` — `UserProjectionService` + `IUserProjectionService` token kayıtlı
- ✅ Frontend `auth.ts` — login sonrası `fetchUser(true)` (defense in depth)
- ✅ `packages/domain-identity/src/index.ts` — `UserFullDto` + `IUserProjectionService` export edildi

**v3 (Sprint 2 — Bölüm 12 + Online Stats feature):**
- ✅ `IdentityPublicService` oluşturuldu — diğer modüller için resmi public API
- ✅ Cross-module `@InjectModel('User')` temizlendi: 5 tüketici migrate/remove/eslint-disable
- ✅ Vendor modülünden duplicate `MongoUserRepository` silindi
- ✅ `apps/backend/.eslintrc.json`'a `no-restricted-syntax` guard eklendi
- ✅ `GetOnlineStatsHandler` — 4 paralel sorgu + 60s Redis cache (`admin:online-stats`)
- ✅ `GET /admin/stats/online` endpoint'i (`AdminStatsController`)
- ✅ `SessionActivityInterceptor` — global APP_INTERCEPTOR, 30s Redis debounce ile `lastActiveAt` günceller
- ✅ Frontend `OnlineStatsWidget` + `useOnlineStats` composable (30s auto-refresh)
- ✅ Admin dashboard'a Online Stats bölümü eklendi

**v2 (Sprint 1 uygulandı):**
- ✅ Register → Auto-Login akışı düzeltildi (Bulgu 5.4)
- ✅ Brute-force lockout aktifleştirildi (Bulgu 5.1)
- ✅ `reset-password.handler.ts` içindeki `as any` kaldırıldı (Bulgu 5.2)
- ✅ Token reuse durumunda tüm session'lar invalidate ediliyor (Bulgu 5.8)
- ✅ Frontend `authStore.register()` sonrası `fetchUser()` çağırıyor
- 🆕 Bölüm 11 (Vendor coupling) ve Bölüm 12 (Cross-module Mongoose erişimi) yapısal bulgular olarak eklendi
- 🆕 Bölüm 13'te Sprint 2 / Sprint 3 plan tablosu detaylandırıldı

---

## 1. Yönetici Özeti

BazarX'in kimlik (Identity) ve kimlik doğrulama (Auth) sistemi **DDD + CQRS** üzerine kurulu, **JWT + httpOnly Cookie** tabanlı, **çift token (access/refresh)** akışı kullanan ve Mongoose ile MongoDB üzerine oturan bir yapıdır. Modül üç katmanlı paket dağılımında çalışır:

| Katman | Paket / Yol | Sorumluluk |
|---|---|---|
| **HTTP / Presentation** | `apps/backend/src/modules/identity` | NestJS Controller, AuthService, TokenService, Guard adaptörleri |
| **Domain + Application** | `packages/domain-identity` | Entity (User), VOs, CQRS Command/Query Handlers, Repository interfaces, Local strategy, Session, Event publisher |
| **Shared Security** | `packages/shared/shared-security` | JwtStrategy, JwtAuthGuard, RolesGuard, GoogleOAuthStrategy, HashingService (bcrypt), EncryptionService (AES-256-GCM), RedisService |
| **Persistence Schemas** | `packages/shared/shared-persistence/src/schemas/backend` | User, UserProfile, UserAddress, Session, VerificationToken, LoginHistory, Referral şemaları |
| **DTO Sözleşmeleri** | `packages/shared/shared-types/src/dtos/auth` & `dtos/identity` | LoginUserInput, RegisterUserInput, UserDTO, AddressDTO |
| **Frontend (Nuxt 3)** | `apps/frontend` | Pinia store, middleware, useApi composable, auth pages, CSRF endpoint |

**Genel Sağlık:** Mimari karar kalitesi yüksek (AggregateRoot/VO/CQRS, httpOnly cookie + rotation + Redis blacklist + session-binding). Sprint 1 ile **production-blocker** olan dört bulgu kapatıldı. Geriye kalan iki **sessiz tehlike** sistemde mevcut: (a) `MongoUserRepository`'nin Vendor + Company domeninden haberi olması, (b) Identity dışındaki modüllerin domain repository'yi atlayıp doğrudan `@InjectModel('User')` ile Mongoose'a erişmesi. Bunlar şu an patlamamış bombadır — Sprint 2'de ele alınmalı.

---

## 2. Dosya Envanteri ve Sorumluluklar

### 2.1 Backend Identity Module
`apps/backend/src/modules/identity/`

| Dosya | Tip | Sorumluluk |
|---|---|---|
| `identity.module.ts` | Module | Tüm provider'ların kompozisyonu, Mongoose feature register, IEventBus factory (RabbitMQ) |
| `auth.controller.ts` | Controller | `/auth/register` (auto-login dahil), `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/resend-verification`. Throttle: register 5/60s, login 5/60s, forgot 3/60s |
| `google-oauth.controller.ts` | Controller | `GET /auth/google` ve `GET /auth/google/callback`. Cookie üzerinden token bırakır, URL'e koymaz |
| `profile.controller.ts` | Controller | `GET/PUT/PATCH /user/profile`, `GET /user/profile/stats`, `POST /user/profile/change-password`. `JwtAuthGuard` ile korumalı |
| `address.controller.ts` | Controller | `GET/POST /addresses`, `PUT/DELETE /addresses/:id`. CQRS üzerinden |
| `user.controller.ts` | Controller | `GET /users/me`, `GET /users/me/referral-stats`, `POST /users/me/referral-code`, `POST /users/transaction-pin`, admin list/get |
| `presentation/admin-user.controller.ts` | Controller | `/admin/users` — listeleme, status/role değiştirme, soft-delete, loyalty XP/tier yönetimi. `RolesGuard` + `@Roles('ADMIN','SUPER_ADMIN')` |
| `infrastructure/auth/auth.service.ts` | Service | Login flow orchestration: LoginHistory yazımı, Session cleanup (30 gün TTL), Google login (auto-provisioning), refresh (atomic session swap + reuse defense), email verify/resend |
| `infrastructure/auth/token.service.ts` | Service | JWT sign (access 15m, refresh 7d), secret validasyonu (≥32 char + zayıf değer reddi), Redis blacklist (`blacklist:{jti}`) |
| `infrastructure/auth/google-auth.guard.ts` | Guard | Passport-Google + Fastify polyfill (`res.setHeader`/`res.end` shim) |
| `infrastructure/persistence/mongo-referral.repository.ts` | Repository | Referral persistance |
| `application/commands/update-user-status.handler.ts` | Handler | Status değişimi + `AuditLogService` log |
| `application/commands/update-user-role.handler.ts` | Handler | Rol değişimi + güvenlik kontrolleri (SUPER_ADMIN sadece SUPER_ADMIN tarafından atanır; kendi rolünü değiştirme yasak) |
| `application/commands/delete-admin-user.handler.ts` | Handler | Soft-delete + audit |
| `application/commands/grant-referral-reward.handler.ts` | Handler | Referans ödülü transaction'ı (Mongoose session), 3. referansta gift voucher tetikler |
| `application/services/referral.service.ts` | Service | Referral kodu üretimi, referral süreci, ters referans engelleme |
| `application/queries/list-admin-users.handler.ts` | Handler | Admin listeleme |

### 2.2 domain-identity Paketi
`packages/domain-identity/src/`

| Yol | İçerik |
|---|---|
| `domain/entities/user.entity.ts` | `User` AggregateRoot, `User.create()` factory, `changePassword`, **`recordFailedLogin`/`clearFailedLogins`/`isLocked` (v2)**, `UserRegisteredEvent` emit |
| `domain/entities/user-profile.entity.ts` | `UserProfile` entity |
| `domain/entities/user-address.entity.ts` | `UserAddress` entity |
| `domain/value-objects/email.vo.ts` | `Email` VO (normalize lowercase) |
| `domain/value-objects/password.vo.ts` | `Password` VO (≥8 char + strong regex) |
| `domain/value-objects/phone-number.vo.ts` | `PhoneNumber` VO |
| `domain/value-objects/user-role.vo.ts` | `UserRole` VO |
| `domain/enums/*.enum.ts` | `UserRole`, `UserStatus`, `Platform` |
| `domain/events/*.event.ts` | `UserRegistered`, `UserUpdated`, `UserDeleted` |
| `domain/repositories/*.interface.ts` | `IUserRepository`, `IUserProfileRepository`, `IUserAddressRepository`, `IVerificationTokenRepository` |
| `application/commands/register-user.handler.ts` | Register handler: exists check → bcrypt hash → User.create → save → 1h verification token → RabbitMQ `user.registered` |
| `application/commands/login-user.handler.ts` | Login handler: findByEmail → **lockout check (v2)** → compare → fail'de **recordFailedLogin (v2)** → success'de **clearFailedLogins (v2)** → status ACTIVE check |
| `application/commands/change-password.handler.ts` | Mevcut şifre doğrulama + rehash |
| `application/commands/forgot-password.handler.ts` | Token üret (1h) + RabbitMQ `auth.password_reset_requested` (email enumeration koruması) |
| `application/commands/reset-password.handler.ts` | **(v2)** Token verify + `user.changePassword(hash)` (entity encapsulation) + token sil |
| `application/commands/set-transaction-pin.handler.ts` | Finansal işlemler için PIN hash |
| `application/commands/update-profile.handler.ts` | Profil güncelleme |
| `application/commands/add/update/delete-address.handler.ts` | Adres CRUD |
| `application/queries/get-user/profile/list-users/addresses/login-history.handler.ts` | Read-side handler'lar |
| `application/event-handlers/user-registered/updated.handler.ts` | RabbitMQ integration publisher |
| `application/use-cases/login-user.use-case.ts` | **Ölü kod adayı** — CQRS handler'la mükerrer |
| `application/use-cases/register-user.use-case.ts` | **Ölü kod adayı** — CQRS handler'la mükerrer |
| `application/dtos/*.dto.ts` | Register, ChangePassword, ResetPassword, ForgotPassword, UpdateProfile, Address, UserResponse, ProfileResponse |
| `infrastructure/auth/local.strategy.ts` | Passport-Local strategy — **placeholder** |
| `infrastructure/auth/session.service.ts` | Basit Session CRUD (gerçek session yönetimi `apps/backend` katmanında) |
| `infrastructure/persistence/mongo-user.repository.ts` | User + UserProfile + Vendor + Company join'i (N+1) |
| `infrastructure/persistence/mongo-user-profile.repository.ts` | Profile repo |
| `infrastructure/persistence/mongo-user-address.repository.ts` | Address repo |
| `infrastructure/persistence/mongo-verification-token.repository.ts` | Token repo |
| `infrastructure/persistence/mappers/*.mapper.ts` | Mongoose ↔ Domain Entity dönüşüm (**v2: `failedLoginCount` map ediliyor**) |
| `infrastructure/event-publishers/identity-event.publisher.ts` | IEventBus injector + 3 helper |

### 2.3 shared-security Paketi
`packages/shared/shared-security/src/`

| Yol | İçerik |
|---|---|
| `shared-security.module.ts` | `@Global()` Module: PassportModule (jwt default), JwtModule (15m expiresIn), Strategies, Guards export |
| `auth/jwt.strategy.ts` | `JwtStrategy` — Token: `Authorization: Bearer` ya da `req.cookies.access_token`. `validate()` → `RequestUser{id,email,role,platform}` |
| `auth/jwt-auth.guard.ts` | Global guard, `@Public()` decorator'unu reflector ile pas geçer; WS/RPC için `true` döner |
| `auth/roles.guard.ts` | `Roles` metadata'sına göre kontrol; HTTP+WS destekli |
| `auth/roles.decorator.ts` | `Roles(...roles)` metadata setter |
| `auth/public.decorator.ts` | `Public()` metadata setter |
| `auth/google-oauth.strategy.ts` | Passport-Google strategy |
| `encryption/hashing.service.ts` | bcrypt (saltRounds=10), `hash()` / `compare()` |
| `encryption/encryption.service.ts` | AES-256-GCM symmetric encrypt/decrypt |
| `redis/redis.service.ts` | ioredis client, set/get/del (TTL'li) — token blacklist için |

### 2.4 Persistence Schemas
`packages/shared/shared-persistence/src/schemas/backend/`

| Şema | Koleksiyon | Önemli Alanlar | İndeks |
|---|---|---|---|
| `user.schema.ts` | `users` | `id`, `email`, `phoneNumber`, `password`, `transactionPin`, `role`, `status`, `isEmailVerified`, `googleId`, `lockoutUntil`, **`failedLoginCount` (v2)**, `referralCode`, `deletedAt`, `fcmToken` | `email`, `phoneNumber`, `role`, `status`, `role+status`, `referralCode` (unique sparse) |
| `userProfile.schema.ts` | `user_profiles` | `userId`, `firstName`, `lastName`, `avatar`, `bio`, `birthday`, `gender`, `city`, `district`, `phone` | `firstName`, `lastName` |
| `userAddress.schema.ts` | `user_addresses` | `userId`, `title`, `firstName`, `lastName`, `phone`, `addressLine1/2`, `city`, `district`, `isDefault`, `deletedAt` | `userId` |
| `session.schema.ts` | `sessions` | `userId`, `userAgent`, `ipAddress`, `lastActiveAt`, `tokenHash` | `userId+tokenHash`; TTL 30 gün (`expireAfterSeconds: 2592000`) |
| `verificationToken.schema.ts` | `verification_tokens` | `userId`, `token`, `type` (EMAIL/PHONE/PASSWORD_RESET), `expiresAt` | `userId` |
| `loginHistory.schema.ts` | `login_history` | `userId`, `ipAddress`, `userAgent`, `status` (SUCCESS/FAILURE), `reason` | `userId` |

### 2.5 Frontend Auth
`apps/frontend/`

| Yol | İçerik |
|---|---|
| `stores/auth.ts` | Pinia store: state (user, token, csrfToken, isAuthenticated, loading, error, isInitialized), getters (`isLoggedIn`, `isAdmin`, `isSuperAdmin`, `isVendor`, `isPremium`, `fullName`, `balance`...), actions (`init`, `login`, **`register` v2: post-success `fetchUser`**, `logout`, `fetchUser`, `tryRefresh`, `forgotPassword`, `resetPassword`) |
| `middleware/auth.ts` | Global route middleware. Public liste tanımlı; özel sayfalar için `authStore.init()` ardından `isLoggedIn` kontrolü, fail ise `/auth/login?redirect=...` |
| `plugins/auth.client.ts` | Client plugin: `authStore.init()` + `cartStore.initialize()` |
| `composables/useApi.ts` | `customFetch`: `api/` → `api/v1/` rewrite, Bearer header, `credentials: include`, 15s timeout, **single-flight refresh** (`AUTH_CRITICAL_PATHS` listesindeki 401'lerde refresh denenmiyor) |
| `server/api/auth/csrf.get.ts` | Nuxt server route: 32-byte hex CSRF token, double-submit pattern (**backend doğrulaması eksik — bkz. 5.7**) |
| `pages/auth/login.vue` | Login UI + Google login (`window.location = /api/v1/auth/google`) |
| `pages/auth/register.vue` | Register UI: KVKK/Terms checkbox, strong password regex client-side, `firstName/lastName` split |
| `pages/auth/forgot-password.vue` | Forgot password form |
| `pages/auth/reset-password.vue` | Reset password (query'den `token`+`email`) |
| `pages/auth/verify-email.vue` | Email verification durumları |
| `pages/auth/callback.vue` | OAuth callback fallback handler (URL token destekli — legacy) |

---

## 3. Bağımlılık Grafiği

```
┌──────────────────────────────────────────────────────────────────┐
│                     apps/frontend (Nuxt 3)                       │
│  pages/auth/* ─▶ stores/auth.ts ─▶ composables/useApi.ts         │
│                                                                  │
│  register() → backend → cookie set → fetchUser() ──┐  (v2)       │
└────────────────────────────────────────────────────│─────────────┘
                          HTTP (api/v1/*)            │
                                │                    │
┌──────────────────────────────────────────────────────────────────┐
│                  apps/backend (NestJS + Fastify)                 │
│                                                                  │
│  AppModule (APP_GUARD = JwtAuthGuard, global)                    │
│   └─ IdentityModule                                              │
│       ├─ AuthController                                          │
│       │     POST /register → CommandBus(RegisterUserCommand)     │
│       │                   → authService.login() [v2: auto]       │
│       │                   → res.cookie(access/refresh)           │
│       │     POST /login    → authService.login()                 │
│       │     POST /refresh  → authService.refresh() [v2: reuse defense]
│       │     POST /logout   → authService.logout()                │
│       │                                                          │
│       ├─ AuthService ─▶ TokenService ─▶ Redis (blacklist)        │
│       │              ─▶ Mongoose: Session, LoginHistory          │
│       │                                                          │
│       ├─ CommandBus / QueryBus → Handlers (domain-identity)      │
│       │     LoginUserHandler  [v2: lockout check + record/clear] │
│       │     RegisterUserHandler                                  │
│       │     ResetPasswordHandler [v2: changePassword()]          │
│       │                                                          │
│       ├─ JwtAuthGuard (global) + RolesGuard (selective)          │
│       └─ Mongo: User, UserProfile, VerificationToken, Vendor*    │
│                                                                  │
│  Diğer modüller (Commerce, Auction, Catalog, Barter ...)         │
│       └── @InjectModel('User') ←—— DDD ihlali (bkz. Bölüm 12)   │
└──────────────────────────────────────────────────────────────────┘
```

### Paket Bağımlılıkları (Identity zinciri)

```
apps/backend/modules/identity
   └── @barterborsa/domain-identity        (handler'lar, entity, DTO, repo arayüzleri)
   └── @barterborsa/shared-security        (Guard, Strategy, Hashing, Redis)
   └── @barterborsa/shared-persistence     (Mongoose şemaları)
   └── @barterborsa/shared-types           (LoginUserInput, RegisterUserInput, UserDTO)
   └── @barterborsa/shared-nest            (CurrentUser decorator)
   └── @barterborsa/shared-messaging       (RabbitMQ Service)
   └── @barterborsa/shared-core            (Result/Ok/Err, AggregateRoot, ValueObject)
   └── @barterborsa/shared-observability   (StructuredLogger)
```

---

## 4. Kimlik Doğrulama Akışları (Sequence)

### 4.1 Register Akışı — v2 (Auto-Login Dahil)
```
Frontend (stores/auth.ts)        Backend (auth.controller.ts)             MongoDB        RabbitMQ
   │                                  │                                       │              │
   │ POST /auth/register              │                                       │              │
   ├─────────────────────────────────▶│                                       │              │
   │                                  │ CommandBus.execute(RegisterUserCommand)              │
   │                                  │   ├─ exists(email)? ─────────────────▶│              │
   │                                  │   ├─ hash(password)                   │              │
   │                                  │   ├─ User.create()                    │              │
   │                                  │   ├─ userRepo.save() ────────────────▶│ (UserProfile auto)
   │                                  │   ├─ verificationToken.create() ─────▶│ (1h)         │
   │                                  │   └─ eventBus.publish('user.registered') ───────────▶│
   │                                  │                                       │              │
   │                                  │ authService.login({email, password})  │              │
   │                                  │   ├─ writeLoginHistory(SUCCESS)       │              │
   │                                  │   ├─ generateUserTokens (access 15m, refresh 7d)     │
   │                                  │   └─ createSession (fire-and-forget) ─▶│              │
   │                                  │                                       │              │
   │                                  │ res.cookie('access_token', JWT, httpOnly 15m)        │
   │                                  │ res.cookie('refresh_token', JWT, httpOnly 7d)        │
   │                                  │                                       │              │
   │ 201 {success, user}              │                                       │              │
   │◀─────────────────────────────────│                                       │              │
   │                                  │                                       │              │
   │ this.user = res.data.user        │                                       │              │
   │ this.isAuthenticated = true      │                                       │              │
   │ await this.fetchUser()  [v2]     │                                       │              │
   ├─────────────────────────────────▶│ GET /auth/me                          │              │
   │                                  │ JwtAuthGuard → JwtStrategy.validate   │              │
   │                                  │ → QueryBus(GetUserQuery)              │              │
   │                                  │ → MongoUserRepository.findById (UserProfile+Vendor join)
   │ 200 {success, data: fullUser}    │                                       │              │
   │◀─────────────────────────────────│                                       │              │
   │ this.user = fullUser (firstName/lastName/profile/vendor dolu)            │              │
```

### 4.2 Login Akışı — v2 (Lockout Aktif)
```
POST /auth/login → AuthController.login()
  ├─ AuthService.login(input, userAgent, ip)
  │   ├─ CommandBus.execute(LoginUserCommand)
  │   │   └─ LoginUserHandler:
  │   │       - findByEmail
  │   │       - user.isLocked()?  [v2] → 'X dakika sonra deneyin'
  │   │       - hashing.compare
  │   │           - fail: user.recordFailedLogin() + repo.update()  [v2]
  │   │                   5'inci hatada lockoutUntil = now + 15m
  │   │           - success: user.clearFailedLogins() + repo.update() [v2]
  │   │       - status === 'ACTIVE'?
  │   ├─ writeLoginHistory(SUCCESS/FAILURE)
  │   ├─ deleteMany Sessions older than 30 days
  │   ├─ TokenService.generateAccessToken (15m, jti=randomUUID)
  │   ├─ TokenService.generateRefreshToken (7d, jti=randomUUID)
  │   └─ createSession(userId, hash(refreshToken)) [fire-and-forget]
  └─ Set httpOnly cookies
```

### 4.3 Refresh Akışı — v2 (Reuse Defense Aktif)
```
POST /auth/refresh
  ├─ AuthService.refresh(refreshToken)
  │   ├─ verifyRefreshToken (jwt.verify + Redis blacklist check)
  │   ├─ userRepository.findById → status === 'ACTIVE'?
  │   ├─ revokeRefreshToken (eski jti → Redis blacklist)
  │   ├─ generateUserTokens (yeni access + refresh)
  │   ├─ Session.findOneAndUpdate({userId, oldHash} → {newHash, lastActiveAt})
  │   └─ Updated session YOK ise:  [v2]
  │       ├─ logger.error('Token reuse algılandı')
  │       ├─ Session.deleteMany({userId})  ← TÜM session'ları sil
  │       └─ throw UnauthorizedException('Tüm oturumlar kapatıldı')
  └─ Set new httpOnly cookies
```

### 4.4 Google OAuth Akışı
```
GET /auth/google → GoogleAuthGuard → 302 redirect

GET /auth/google/callback?code=...
  └─ GoogleOAuthStrategy.validate(profile) → req.user = {email, googleId, ...}
  └─ GoogleOAuthController.googleAuthRedirect()
      ├─ authService.googleLogin(profile)
      │   ├─ Mevcut user → load; yoksa User.create() + save
      │   └─ generateUserTokens + createSession
      ├─ res.cookie httpOnly (sameSite=strict — local'den daha sıkı)
      └─ res.redirect(FRONTEND_URL/auth/success?userId&email&role)
```

### 4.5 Frontend HTTP (useApi)
```
$api('/api/auth/me')
  ├─ /api/ → /api/v1/ rewrite
  ├─ Authorization: Bearer + httpOnly cookie (credentials:include)
  ├─ X-CSRF-Token (mutating methods)
  ├─ AbortController 15s timeout
  └─ catch:
      ├─ 401 + AUTH_CRITICAL_PATHS → authStore.reset()
      ├─ 401 + isLoggedIn → tryRefresh (single-flight) → retry once
      └─ diğer hatalar → toast.error
```

---

## 5. Bulgular ve Durum

> Sprint 1'de kapatılan bulgular **✅ FIX** olarak işaretlendi.
> Geri kalanlar Sprint 2/3'te planlanmıştır — bkz. Bölüm 13.

### 5.1 ✅ FIX — Login Lockout Mantığı Eksik [YÜKSEK]
**Eski durum:** `lockoutUntil` field şemada vardı ama hiçbir yerde kontrol edilmiyordu.
**Çözüm:**
- `User` entity'ye `recordFailedLogin()`, `clearFailedLogins()`, `isLocked()` metodları eklendi (5 hata → 15dk lockout).
- `failedLoginCount` schema + mapper + entity'ye eklendi.
- `LoginUserHandler` artık şifre kontrolünden önce `isLocked()` çağırıyor; fail'de `recordFailedLogin`+`update`, success'de `clearFailedLogins`+`update`.
- Brute-force artık IP rotation ile dahi aşılamıyor — saldırgan hesabı 15 dk kilitliyor.

### 5.2 ✅ FIX — `reset-password.handler.ts` `as any` Kullanımı [YÜKSEK]
**Eski durum:** `(user as any).props.passwordHash = hashedPassword` — encapsulation kırılıyordu.
**Çözüm:** `user.changePassword(hashedPassword)` çağrısıyla değiştirildi. `changePassword` ayrıca `lockoutUntil`'ı sıfırlıyor ve `failedLoginCount`'u 0'a çekiyor — şifre değiştiren kullanıcı zaten yetkilendirilmiş demektir.

### 5.4 ✅ FIX — Register Sonrası Oturum Açılmıyor [YÜKSEK]
**Eski durum:** `auth.controller.ts:register()` `user.accessToken` okuyordu fakat `UserResponseDto`'da bu alan yoktu — cookie'ler `undefined` değeriyle set ediliyordu. Sonuç: register sonrası `/auth/me` 401 → kullanıcı login'e atılıyor → "isimsiz kullanıcı".
**Çözüm:**
- `auth.controller.ts:register()` artık `RegisterUserCommand` başarılı dönerse hemen `authService.login()` çağırıyor (gerçek token + session aktif).
- Frontend `stores/auth.ts:register()` cookie set edildikten sonra `fetchUser()` çağırarak tam profili (firstName/lastName/profile/vendor join'leri dahil) yükler.

### 5.8 ✅ FIX — Token Reuse Detection Aksiyon Almıyor [DÜŞÜK→YÜKSEK]
**Eski durum:** `AuthService.refresh` session bulunamadığında sadece `logger.warn` atıyordu — saldırgan aynı refresh token'la oturum açmaya devam edebiliyordu.
**Çözüm:** Reuse algılandığında `Session.deleteMany({userId})` tüm oturumları kapatıyor ve `UnauthorizedException` fırlatıyor. Hem gerçek kullanıcı hem saldırgan yeniden login olmaya zorlanır.

---

### 5.3 [ORTA] `mongo-user.repository.ts` N+1 Query
`findById` ve `findByEmail` her çağrıda 3-4 ardışık query (User → UserProfile → Vendor → Company). `/auth/me` ve `GetUserHandler` her istekte 4 round-trip yapıyor.
- **Sprint 2 planı:** Mongoose `$lookup` aggregation ile tek query'ye düşür.

### 5.5 ✅ FIX — `local.strategy.ts` Placeholder [ORTA]
**Eski durum:** `validate()` sadece `{email}` döndürüyordu — şifre kontrolü yoktu.
**Çözüm:** `validate(email, password)` artık `LoginUserCommand({email, password})` çalıştırıyor; başarısız → `UnauthorizedException`. Tarama sonucu: aktif `AuthGuard('local')` kullanımı yok — strateji gelecek kullanım için hazır halde bırakıldı.

### 5.6 ✅ FIX — `google-oauth.strategy.ts` Default Dummy Credentials [ORTA]
**Eski durum:** `'dummy-client-id'` fallback'i vardı; env yanlış set edilse bile uygulama başlıyordu.
**Çözüm:** `validateCredentials()` — dummy değerler startup'ta `Error` fırlatır. Env eksikse (Google OAuth opsiyonel) sadece `logger.warn` + devre dışı mod.

### 5.7 ✅ FIX — CSRF Frontend-only [DÜŞÜK]
**Eski durum:** `useApi` `X-CSRF-Token` gönderiyor fakat `authStore.csrfToken` her zaman `null`'dı; backend hiç doğrulamıyordu.
**Çözüm:**
- `GET /auth/csrf` endpoint'i (public) — `csrf_token` cookie set eder + token döner.
- `CsrfMiddleware` — tüm state-changing route'larda `req.cookies.csrf_token === X-CSRF-Token` kontrolü.
- Frontend `auth.ts:init()` → `fetchCsrf()` çağrısı eklendi; token `authStore.csrfToken`'a yazılıyor.
- Muaflar: GET/HEAD/OPTIONS + unauthenticated auth endpoint'leri. Cookie yoksa (API client) bypass.

### 5.9 [DÜŞÜK] `JwtStrategy.validate` Status Kontrolü Yapmıyor
Admin bir kullanıcıyı suspend ettiğinde, kullanıcı 15dk daha sistemde gezebilir.
- **Sprint 3 planı:** Redis cache backed user-status revalidation (`user-status:{userId}`, 60s TTL). Status değiştiğinde Redis key invalidate edilir.

### 5.10 ✅ FIX — `encryption.service.ts` Default Key [DÜŞÜK]
**Eski durum:** `ENCRYPTION_KEY || 'default-secret-key-...'` fallback — default key ile şifrelenmiş veri herkesçe çözülebilir.
**Çözüm:** `validateKey()` — eksik/varsayılan/kısa key'de startup `Error`. TokenService pattern'iyle birebir tutarlı.

### 5.11 [DÜŞÜK] `CurrentUser` Decorator İçinde `any`
- **Sprint 3 planı:** Generic + tipli versiyonla değiştir.

---

## 6. Cross-Module Bağımlılıklar

### 6.1 Identity → Diğer Modüller (Use)

| Tüketen | Kullandığı | Amaç |
|---|---|---|
| `auction`, `commerce`, `barter`, `catalog`, `loyalty`, `marketing` | `JwtAuthGuard`, `RolesGuard`, `@Roles`, `@Public` | Route koruması |
| `IdentityModule` | `CommunicationModule` | Email gönderimi (MailService) |
| `IdentityModule` | `AuditMongooseModule` | `AuditLogService` |
| `IdentityModule` | `RabbitMQModule` | `user.registered`, `user.updated`, `auth.password_reset_requested` |
| `GrantReferralRewardHandler` | `marketing` modülü | `IssueGiftVoucherCommand` |
| `AdminUserController` | `loyalty` modülü | `EarnXpCommand` |

### 6.2 Identity ← Diğer Modüller (Provide)

- `req.user: RequestUser` — tüm protected controller'ların ortak bağımlılığı.
- `IUserRepository` provider'ı IdentityModule içinde bağlı; cross-module **export edilmiyor** → bkz. Bölüm 12 (yapısal bulgu).

---

## 7. Style ve Standart Uyum Skoru

| Kural | Durum | Not |
|---|---|---|
| ZERO TOLERANCE for `any` | ❌ İhlal | Hâlâ var: `mongo-user.repository.ts:20,40,67`, `current-user.decorator.ts`, `auth.service.ts` (partial). 5.2'deki `as any` v2'de kaldırıldı. |
| `@ts-ignore`/`@ts-expect-error` | ✅ Temiz | Tespit edilmedi |
| File header path comment | ⚠️ Kısmi | Bazı dosyalarda var |
| StructuredLogger kullanımı | ⚠️ Kısmi | Çoğu yerde NestJS `Logger` (style guide `@barterborsa/shared-observability` istiyor) |
| Turkish code comments | ✅ Çoğunlukla | |
| CamelCase identifiers | ✅ | |
| AuditLogService | ✅ | Role/status/delete handler'larında uygun |
| JWT payload minimal | ✅ | `sub, email, role, platform, jti` |

---

## 8. Sprint 1 Uygulama Özeti (Bu PR)

| # | Dosya | Değişiklik | Bulgu |
|---|---|---|---|
| B1 | `apps/backend/src/modules/identity/auth.controller.ts` | `register()` sonunda `authService.login()` çağrısı; cookie'lere gerçek token | 5.4 |
| B2 | `packages/domain-identity/src/domain/entities/user.entity.ts` | `failedLoginCount`, `recordFailedLogin/clearFailedLogins/isLocked`, getter'lar; `changePassword` artık sayaç sıfırlıyor | 5.1 |
| B3 | `packages/shared/shared-persistence/src/schemas/backend/user.schema.ts` | `failedLoginCount: Number` field | 5.1 |
| B3 | `packages/domain-identity/src/infrastructure/persistence/mappers/mongo-user.mapper.ts` | `failedLoginCount` toDomain/toPersistence | 5.1 |
| B4 | `packages/domain-identity/src/application/commands/login-user.handler.ts` | `isLocked` check; fail'de `recordFailedLogin`+update; success'te `clearFailedLogins`+update | 5.1 |
| B5 | `packages/domain-identity/src/application/commands/reset-password.handler.ts` | `(as any).props` → `user.changePassword(hash)` | 5.2 |
| B6 | `apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts` | Token reuse'da `Session.deleteMany({userId})` + throw | 5.8 |
| F1 | `apps/frontend/stores/auth.ts` | `register()` success sonrası `await fetchUser(true)` | 5.4 |

### Doğrulama Adımları (Manuel)
1. **Register flow:** `/auth/register` → cookie'lerde dolu `access_token`+`refresh_token` (eski sürümde boş set ediliyordu).
2. **Lockout:** 5 hatalı şifreyle login dene → 6. denemede "Çok fazla hatalı deneme. Hesabınız 15 dakika içinde tekrar denenebilir."
3. **Lockout reset:** Doğru şifreyle login → `failedLoginCount=0`, `lockoutUntil=null`.
4. **Reset password:** Forgot → mail token ile reset → entity yolu üzerinden `changePassword`, sayaç + lockout sıfır.
5. **Token reuse:** Refresh token'ı manuel olarak iki kez ardışık kullan → ikinci denemede tüm session'lar silinip 401.

### Migration Notu
`users` koleksiyonunda mevcut kayıtlar `failedLoginCount` field'ına sahip değil — Mongoose `default: 0` ile yeni okumalar 0 dönecek; sadece bir kullanıcı login flow'una girince persist edilecek. Ek bir backfill migration **gerekli değil**.

---

## 9. Test Kapsamı Önerileri (Sprint 2)

Şu an görünür spec: `change-password.spec.ts`. Sprint 2 önce yazılması gerekenler (öncelik sırasına göre):

| Spec | Kapsam |
|---|---|
| `login-user.handler.spec` | Geçersiz email/password, lockout state, 5'inci hatada lockout setlenmesi, success'te sayaç sıfırlama |
| `register-user.handler.spec` | Duplicate email, weak password (VO validation), verification token oluşumu, RabbitMQ publish çağrısı |
| `auth.controller.register.e2e` | Auto-login akışı: register sonrası cookie dolu + `/auth/me` 200 |
| `token.service.spec` | Secret validation (zayıf/kısa secret), blacklist, expiresIn |
| `auth.service.refresh.spec` | Token reuse → `deleteMany` + throw; atomic session swap; expired token |
| `reset-password.handler.spec` | Expired token, wrong type, success path (entity yolu üzerinden) |
| `jwt-auth.guard.e2e` | `@Public()` bypass, WS bypass, expired token 401 |
| `roles.guard.spec` | Missing user, role mismatch, role hierarchy |

---

## 10. Sonuç ve Sonraki Adımlar

Sprint 1 ile **production-blocker** dört bulgu kapatıldı:
- Kayıt sonrası oturum açılma sorunu (kullanıcının raporladığı "isimsiz kullanıcı" zinciri)
- Brute-force koruması (lockout)
- Encapsulation ihlali (`as any`)
- Token reuse savunması

Geriye Sprint 2/3 borçları kalıyor — bunların büyük kısmı **güvenlik derinliği** ve **mimari sınır** konuları. Aşağıdaki Bölüm 11 ve 12 yeni eklendi: bunlar şu an sistemde patlamamış iki tehdit. Sprint 2'nin **birincil hedefi** Bölüm 12 olmalı — diğer modüllerin Identity domain'ini atlayarak `users` koleksiyonuna ulaşması, ileride şema değişikliklerini kabusa çevirecek.

---

## 11. ✅ FIX — Vendor Coupling `MongoUserRepository`'de

### Sorunun Tanımı

`packages/domain-identity/src/infrastructure/persistence/mongo-user.repository.ts:24-80`:

```ts
async findById(id: string): Promise<UserEntity | null> {
  const doc = await this.model.findOne({ id, deletedAt: null }).exec();
  if (!doc) return null;

  const profile = await UserProfile.findOne({ userId: id }).exec();
  const vendor = await Vendor.findOne({ userId: id }).exec();            // ← Vendor domain
  let company = null;
  if (vendor?.companyId) {
    company = await Company.findOne({ id: vendor.companyId }).exec();    // ← Company domain
  }
  // ...
}
```

### Neden Tehlikeli

- **DDD sınır ihlali:** Identity bounded context'i Vendor bounded context'inden haberdar olmamalı. Vendor'un `status`/`slug`/`company` alanları User entity'sine `vendor` propertysi olarak iliştiriliyor.
- **N+1 query yükü:** Her `/auth/me` isteği 4 ardışık query.
- **Tehdit modeli:** Vendor şeması değiştiğinde (örn. `Company` → `LegalEntity` rename) Identity repository'si patlar. Identity geliştiricisi Vendor değişikliğini bilemez.
- **Tersine bağımlılık:** Identity → Vendor olması gereken yön Identity ← Vendor. Identity, sistemin temelidir; Vendor onun üstüne kurulur.

### Sprint 2 Çözüm Planı

**Adım 1 — Repository'yi saflaştır:**
```ts
// mongo-user.repository.ts (hedef)
async findById(id: string): Promise<UserEntity | null> {
  const doc = await this.model.findOne({ id, deletedAt: null }).exec();
  return doc ? MongoUserMapper.toDomain(doc) : null;
}
```
`Vendor` ve `Company` import'ları kaldırılır; `User.entity.ts`'deki `vendor?: {...}` field'ı `UserProps`'dan silinir.

**Adım 2 — Composition'ı outward'a taşı:**
Vendor + Company join'i gereken yerlerde (`/auth/me`, `GetUserHandler`):
```ts
// apps/backend/src/modules/identity/application/projections/user-projection.service.ts (YENİ)
@Injectable()
export class UserProjectionService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Vendor') private vendorModel: Model<IVendor>,
    @InjectModel('Company') private companyModel: Model<ICompany>,
    @InjectModel('UserProfile') private profileModel: Model<IUserProfile>,
  ) {}

  async getFullProfile(userId: string): Promise<UserFullProjectionDto> {
    // Tek aggregation pipeline ile $lookup'la birleştir
    const [result] = await this.userModel.aggregate([
      { $match: { id: userId, deletedAt: null } },
      { $lookup: { from: 'user_profiles', localField: 'id', foreignField: 'userId', as: 'profile' } },
      { $lookup: { from: 'vendors', localField: 'id', foreignField: 'userId', as: 'vendor' } },
      // ... + Company nested lookup
    ]);
    return UserFullProjectionDto.from(result);
  }
}
```

**Adım 3 — Controller'lar projection servisini çağırır:** `MongoUserRepository.findById` artık sadece User döndürür; `GetProfileQuery` projection servisini kullanır.

### Etki Tahmini
- ~6 controller test dosyası etkilenir (mock'lar değişir).
- Frontend `userDTO.vendor` alanı aynı kalır — sözleşme değişmez, sadece backend kompozisyonu farklılaşır.
- Query sayısı 4 → 1 (yaklaşık %60-70 latency düşüşü `/auth/me` için).

---

## 12. 🆕 Yapısal Bulgu — Cross-Module `@InjectModel('User')` Erişimi

### Sorunun Tanımı

`IdentityModule.exports`:
```ts
exports: [AuthService, TokenService],   // ← IUserRepository EXPORT EDİLMİYOR
```

Sonuç olarak diğer modüller `User` koleksiyonuna ulaşmak için domain repository'yi atlayıp doğrudan Mongoose Model'ini inject ediyor:

```bash
$ grep -r "InjectModel('User')" apps/backend/src/modules --include="*.ts"
```

Tespit edilen lokasyonlar (örnek alt küme):
- `commerce/presentation/order-admin.controller.ts`
- `auction/auction-admin.controller.ts`
- `barter/*` (vendor onayı handler'ları)
- `loyalty/*` (XP, tier işlemleri)
- `marketing/*` (kampanya targeting)
- `audit/*` (actor metadata)

### Neden Tehlikeli

Bu **raporun en sessiz ama en yıkıcı bulgusu**. Sebep:

1. **Domain invariant bypass:** `User.create()`, `User.changePassword()`, `recordFailedLogin()` gibi metodları kullanmadan doğrudan `userModel.updateOne({id}, {$set: {...}})` yapan kod her yerde olabilir. Lockout sayacı bir handler'da artırılırken başka bir admin handler'ı aynı user'ı silebilir.
2. **Şema rename'i regresyon kâbusu:** `users.password` field'ını `users.passwordHash` yapmak istediğinizde, IdentityModule'ün dışındaki kaç dosyada nokta yazımıyla kullanıldığını bulmak zorundasınız. Test coverage zayıfsa silent break kaçınılmaz.
3. **Audit izleme zorluğu:** `IUserRepository.update(user)` bir yerden çağrılırsa AOP interceptor'la kolay loglanır. Doğrudan `userModel.updateOne` çağrıları **yakalanamaz**.

### Sprint 2 Çözüm Planı

**Adım 1 — Public Identity API'sini tanımla:**

Yeni dosya: `packages/domain-identity/src/application/services/identity-public.service.ts`
```ts
@Injectable()
export class IdentityPublicService {
  constructor(@Inject('IUserRepository') private repo: IUserRepository) {}

  // Cross-module read API
  async getUserById(id: string): Promise<UserReadModel | null> { ... }
  async getUsersByIds(ids: string[]): Promise<UserReadModel[]> { ... }
  async getUserMinimal(id: string): Promise<{id, email, role, status} | null> { ... }

  // Write API — domain invariant'ları korur
  async suspendUser(id: string, reason: string, adminId: string): Promise<void> { ... }
  async activateUser(id: string, adminId: string): Promise<void> { ... }
}
```

**Adım 2 — `IdentityModule.exports`'a ekle:**
```ts
exports: [AuthService, TokenService, IdentityPublicService],
```

**Adım 3 — Migrasyon scripti:**
Bir kerelik codemod ile tüm `@InjectModel('User')` kullanımlarını taranıp:
- **Read** ise → `IdentityPublicService.getUserById()` ile değiştir
- **Write** ise → uygun command'a çevir (örn. user soft-delete → `DeleteAdminUserCommand`)

**Adım 4 — ESLint kuralı (regresyon koruması):**
```js
// .eslintrc — IdentityModule dışında @InjectModel('User') yasaklı
{
  "no-restricted-syntax": [{
    "selector": "Decorator[expression.callee.name='InjectModel'][expression.arguments.0.value='User']",
    "message": "User modeline doğrudan erişim yasak. IdentityPublicService kullanın."
  }]
}
```
Identity modülü kendi infrastructure'ında bu kuralı pas geçer (override).

### Risk Tahmini
- **Migration:** Yaklaşık 15-25 dosya etkilenir, çoğu tek satırlık değişiklik.
- **Test:** Etkilenen modüllerin her birinin smoke testi.
- **Süre:** 2-3 gün, eğer paralelleştirilirse.

---

## 13. Sprint 2 ve Sprint 3 Plan Tablosu

### Sprint 2 (2 hafta) — Yapısal Borç + Defense in Depth

| Öncelik | İş | Dosya/Modül | Effort | Bulgu |
|---|---|---|---|---|
| P0 ✅ | **Cross-module @InjectModel('User') temizliği** | IdentityPublicService oluştur + 5 tüketici migrate/temizle + ESLint kuralı | 3 gün | Bölüm 12 |
| P0 ✅ | **Online Kullanıcı Feature** | GetOnlineStatsHandler + SessionActivityInterceptor + AdminStatsController + Frontend widget | 1 gün | Yeni Feature |
| P0 ✅ | **Vendor coupling refactor** | MongoUserRepository'den Vendor/Company kaldır + UserProjectionService oluştur ($lookup aggregation) | 2 gün | Bölüm 11, 5.3 |
| P1 ✅ | **Backend CSRF middleware** | CsrfMiddleware + GET /auth/csrf endpoint + frontend fetchCsrf() | 1 gün | 5.7 |
| P1 ✅ | **local.strategy temizliği** | validate() → LoginUserCommand (placeholder kaldırıldı) | 0.5 gün | 5.5 |
| P1 ✅ | **google-oauth + encryption secret fail-fast** | validateCredentials() + validateKey() — dummy değerlerde startup error | 0.5 gün | 5.6, 5.10 |
| P2 | Ölü kod temizliği | `application/use-cases/{login,register}-user.use-case.ts` sil veya devre dışı bırak | 0.5 gün | — |
| P2 | Test yazımı (Bölüm 9) | 8 spec dosyası | 3-4 gün | — |

### Sprint 3 (1 hafta) — Polish

| Öncelik | İş | Dosya/Modül | Effort | Bulgu |
|---|---|---|---|---|
| P1 | JwtStrategy status revalidation | Redis cache (`user-status:{userId}`, 60s TTL) | 1 gün | 5.9 |
| P2 | StructuredLogger migrasyonu | NestJS Logger → @barterborsa/shared-observability (tüm Identity dosyaları) | 1.5 gün | Style |
| P2 | `any` tipleri temizliği | mongo-user.repository, current-user.decorator, auth.service kalanları | 1 gün | Style |
| P3 | CurrentUser decorator generic'leştirme | shared-nest | 0.5 gün | 5.11 |

---

## 14. Mimari Değerlendirme (Yönetici İçin)

**Korunması gereken kararlar:**
1. DDD + CQRS katmanlama — sistemin omurgası, sürdürülmeli.
2. JWT + httpOnly cookie + refresh rotation + Redis blacklist + session-binding kombinasyonu — modern best practice.
3. Strong password VO + email VO + bcrypt + secret hardening — temel güvenlik sağlam.

**Patlamamış bombalar:**
1. ~~**Bölüm 12** (cross-module Mongoose erişimi)~~ ✅ **Sprint 2'de kapatıldı** — `IdentityPublicService` + ESLint guard + 5 tüketici migrate/temizle.
2. ~~**Bölüm 11** (Vendor coupling)~~ ✅ **Sprint 2'de kapatıldı** — `UserProjectionService` ($lookup aggregation) + `MongoUserRepository` saflaştırıldı.

**Tamamlanmamış implementasyon işaretleri (Sprint 1'de tamir edildi):**
- Register'da token mismatch (5.4) ✅
- Lockout yarım bırakılmış (5.1) ✅
- Reset password encapsulation (5.2) ✅
- Token reuse sadece log (5.8) ✅

> **Toplam Tahmini Düzeltme Eforu (Sprint 1 hariç):** Sprint 2 (~10 gün) + Sprint 3 (~4 gün). Bu yapıldığında BazarX Identity modülü production-grade ve audit-ready olacaktır.
