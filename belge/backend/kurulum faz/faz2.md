# Gemini Prompt — FAZ 2: Identity & Auth Modülü

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT (her fazda tekrar ver)

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun backend'ini yazıyorsun.

MİMARİ KARARLAR (ASLA sorgulamayacaksın):

- Framework: NestJS 10+ / Fastify adapter
- Monorepo: Turborepo + pnpm workspaces
- TypeScript strict mode
- PostgreSQL 16 — Prisma ORM
- Auth: Google OAuth2 + JWT (access 15dk / refresh 7gün) + Redis session
- DDD: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern
- CQRS: NestJS CQRS modülü ile Command/Query ayrımı
- Package prefix: @barterborsa/*

FAZ 1'DE OLUŞTURULAN SHARED PAKETLER (bunları kullanacaksın):

@barterborsa/shared-core:
  - Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent
  - IRepository<T>, IReadRepository<T>, IWriteRepository<T>
  - IUseCase<TInput, TOutput>, Command, Query
  - PaginationInput, PaginatedResult<T>
  - DomainException, NotFoundException, ConflictException
  - Result<T, E>, Ok(), Err(), isOk(), isErr()

@barterborsa/shared-persistence:
  - PrismaModule, PrismaService
  - BasePrismaRepository<T>, PrismaUnitOfWork

@barterborsa/shared-messaging:
  - RabbitMQModule, RabbitMQService
  - IntegrationEvent, IEventBus
  - IDENTITY_EXCHANGE, routing keys: user.registered, user.updated, user.deleted

@barterborsa/shared-security:
  - JwtModule, JwtStrategy, GoogleOAuthStrategy
  - AuthGuard, RolesGuard, RateLimitGuard
  - EncryptionService, HashingService

@barterborsa/shared-nest:
  - @CurrentUser(), @Roles(), @Public(), @Idempotent()
  - ResponseTransformInterceptor, TimeoutInterceptor
  - GlobalExceptionFilter, DomainExceptionFilter, ValidationFilter
  - ValidationPipe, ParsePaginationPipe
  - RequestContextMiddleware

@barterborsa/shared-observability:
  - LoggerModule, StructuredLogger
  - HealthModule, HealthController
  - CorrelationIdMiddleware

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. Kendi mimari önerini ekleme
4. TypeScript strict mode
5. Import'larda @barterborsa/* workspace alias kullan
6. Kod yorumlarını Türkçe yaz
7. Her dosya ÇALIŞIR, DERLENEBILIR, eksiksiz olacak
8. Entity'ler shared-core'daki AggregateRoot/Entity/ValueObject'ten türeyecek
9. Repository'ler shared-persistence'taki BasePrismaRepository'den türeyecek
10. Controller'larda @Public() veya @Roles() decorator kullan
```

### GÖREV

```
FAZ 2: Identity & Auth modülünü yaz.

Bu modül tüm sistemin temelini oluşturur. Kullanıcı kaydı, Google OAuth2 ile giriş, 
JWT token yönetimi, profil yönetimi, adres yönetimi ve session takibi içerir.

Modül yapısı:

apps/backend/src/modules/identity/
├── application/
│   ├── commands/
│   │   ├── register-user.command.ts
│   │   ├── register-user.handler.ts
│   │   ├── update-profile.command.ts
│   │   ├── update-profile.handler.ts
│   │   ├── change-password.command.ts
│   │   ├── change-password.handler.ts
│   │   ├── add-address.command.ts
│   │   ├── add-address.handler.ts
│   │   ├── update-address.command.ts
│   │   ├── update-address.handler.ts
│   │   ├── delete-address.command.ts
│   │   ├── delete-address.handler.ts
│   │   ├── set-transaction-pin.command.ts
│   │   └── set-transaction-pin.handler.ts
│   ├── queries/
│   │   ├── get-user.query.ts
│   │   ├── get-user.handler.ts
│   │   ├── get-profile.query.ts
│   │   ├── get-profile.handler.ts
│   │   ├── list-users.query.ts
│   │   ├── list-users.handler.ts
│   │   ├── get-addresses.query.ts
│   │   ├── get-addresses.handler.ts
│   │   ├── get-login-history.query.ts
│   │   └── get-login-history.handler.ts
│   ├── event-handlers/
│   │   ├── user-registered.handler.ts
│   │   └── user-updated.handler.ts
│   └── dtos/
│       ├── register-user.dto.ts
│       ├── update-profile.dto.ts
│       ├── change-password.dto.ts
│       ├── add-address.dto.ts
│       ├── update-address.dto.ts
│       ├── user-response.dto.ts
│       ├── profile-response.dto.ts
│       └── address-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── user-profile.entity.ts
│   │   └── user-address.entity.ts
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   ├── phone-number.vo.ts
│   │   ├── password.vo.ts
│   │   └── user-role.vo.ts
│   ├── events/
│   │   ├── user-registered.event.ts
│   │   ├── user-updated.event.ts
│   │   └── user-deleted.event.ts
│   ├── repositories/
│   │   ├── user.repository.interface.ts
│   │   ├── user-profile.repository.interface.ts
│   │   └── user-address.repository.interface.ts
│   └── enums/
│       ├── user-role.enum.ts
│       ├── user-status.enum.ts
│       └── platform.enum.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-user.repository.ts
│   │   ├── prisma-user-profile.repository.ts
│   │   ├── prisma-user-address.repository.ts
│   │   └── mappers/
│   │       ├── user.mapper.ts
│   │       ├── user-profile.mapper.ts
│   │       └── user-address.mapper.ts
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── google-oauth.controller.ts
│   │   ├── token.service.ts
│   │   ├── session.service.ts
│   │   └── strategies/
│   │       └── local.strategy.ts
│   └── event-publishers/
│       └── identity-event.publisher.ts
├── presentation/
│   ├── user.controller.ts
│   ├── profile.controller.ts
│   └── address.controller.ts
└── identity.module.ts
```

### PRISMA ŞEMASI

Mevcut User şeması aşağıdadır. Bu şemayı AYNEN koru ama şu değişiklikleri yap:

1. `password` alanını `String?` (nullable) yap — Google OAuth kullanıcılarının şifresi olmaz
2. User modelindeki DİĞER MODÜLLERE AİT relation'ları kaldır. Sadece şunları bırak:
   - profile (UserProfile)
   - addresses (UserAddress[])
   - refreshTokens (RefreshToken[])
   - sessions (Session[])
   - loginHistory (LoginHistory[])
   - verificationTokens (VerificationToken[])
   - referredBy / referrals (self-relation)
3. Kaldırılan relation'lar (orders, wallets, escrows, auctions, vendors vs.) kendi modüllerinde userId ile referans verilecek — User modelinde olmaları gerekmiyor.
4. Tüm diğer tablolar (UserProfile, UserAddress, RefreshToken, Session, LoginHistory, VerificationToken, SSOToken) AYNEN korunacak.

Mevcut şema:

model User {
  id                        String                     @id @default(cuid())
  email                     String                     @unique
  phoneNumber               String?                    @unique @map("phone_number")
  password                  String?                    // ← nullable yapıldı
  transactionPin            String?                    @map("transaction_pin")
  role                      UserRole                   @default(USER)
  status                    UserStatus                 @default(ACTIVE)
  platform                  Platform                   @default(BAZARX)
  isEmailVerified           Boolean                    @default(false) @map("is_email_verified")
  googleId                  String?                    @unique @map("google_id")
  lockoutUntil              DateTime?                  @map("lockout_until")
  createdAt                 DateTime                   @default(now()) @map("created_at")
  updatedAt                 DateTime                   @updatedAt @map("updated_at")
  deletedAt                 DateTime?                  @map("deleted_at")
  lastLoginAt               DateTime?                  @map("last_login_at")
  lastSeenAt                DateTime?                  @map("last_seen_at")
  referredById              String?                    @map("referred_by_id")
  
  // Identity modülüne ait relation'lar (SADECE bunlar kalacak)
  profile                   UserProfile?
  addresses                 UserAddress[]
  refreshTokens             RefreshToken[]
  sessions                  Session[]
  loginHistory              LoginHistory[]
  verificationTokens        VerificationToken[]
  referredBy                User?                      @relation("Referrals", fields: [referredById], references: [id])
  referrals                 User[]                     @relation("Referrals")

  @@index([email])
  @@index([phoneNumber])
  @@index([role])
  @@index([status])
  @@map("users")
}

enum UserRole {
  USER
  VENDOR
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  BANNED
  PENDING_VERIFICATION
}

enum Platform {
  BAZARX
  BARTERBORSA
}

// UserProfile, UserAddress, RefreshToken, Session, LoginHistory, 
// VerificationToken, SSOToken tabloları AYNEN korunacak (mevcut şemadan al)
```

### DOSYA LİSTESİ — HER BİRİNİN TAM İÇERİĞİNİ YAZ

```
=== PRISMA ŞEMASI ===

DOSYA #1: apps/backend/prisma/schema.prisma
- datasource: postgresql
- generator: client
- Yukarıdaki User modeli (temizlenmiş hali)
- UserProfile, UserAddress, RefreshToken, Session, LoginHistory, VerificationToken, SSOToken modelleri
- Tüm enum'lar: UserRole, UserStatus, Platform

=== DOMAIN KATMANI (framework-agnostic, saf TypeScript) ===

DOSYA #2: apps/backend/src/modules/identity/domain/enums/user-role.enum.ts
- UserRole enum: USER, VENDOR, ADMIN, SUPER_ADMIN

DOSYA #3: apps/backend/src/modules/identity/domain/enums/user-status.enum.ts
- UserStatus enum: ACTIVE, INACTIVE, SUSPENDED, BANNED, PENDING_VERIFICATION

DOSYA #4: apps/backend/src/modules/identity/domain/enums/platform.enum.ts
- Platform enum: BAZARX, BARTERBORSA

DOSYA #5: apps/backend/src/modules/identity/domain/value-objects/email.vo.ts
- Email extends ValueObject
- Validation: regex ile email formatı kontrol
- normalize(): lowercase dönüşüm
- static create(email: string): Result<Email, DomainException>

DOSYA #6: apps/backend/src/modules/identity/domain/value-objects/phone-number.vo.ts
- PhoneNumber extends ValueObject
- Validation: Türkiye telefon numarası formatı (05XX veya +905XX)
- static create(phone: string): Result<PhoneNumber, DomainException>

DOSYA #7: apps/backend/src/modules/identity/domain/value-objects/password.vo.ts
- Password extends ValueObject
- Validation: min 8 karakter, en az 1 büyük harf, 1 rakam, 1 özel karakter
- static create(raw: string): Result<Password, DomainException>
- static createHashed(hash: string): Password (DB'den okurken)
- NOT: hash işlemi burada YAPILMAZ, sadece validasyon. Hash işi auth.service'te HashingService ile yapılır.

DOSYA #8: apps/backend/src/modules/identity/domain/value-objects/user-role.vo.ts
- UserRoleVO extends ValueObject
- isAdmin(), isVendor(), isUser() helper metodları

DOSYA #9: apps/backend/src/modules/identity/domain/events/user-registered.event.ts
- UserRegisteredEvent extends DomainEvent
- Props: userId, email, role, platform

DOSYA #10: apps/backend/src/modules/identity/domain/events/user-updated.event.ts
- UserUpdatedEvent extends DomainEvent
- Props: userId, changedFields (string[])

DOSYA #11: apps/backend/src/modules/identity/domain/events/user-deleted.event.ts
- UserDeletedEvent extends DomainEvent
- Props: userId, email

DOSYA #12: apps/backend/src/modules/identity/domain/entities/user.entity.ts
- User extends AggregateRoot
- Props: email (Email VO), phoneNumber (PhoneNumber VO nullable), password (Password VO nullable), 
  role (UserRole), status (UserStatus), platform (Platform), googleId (string nullable),
  isEmailVerified (boolean), transactionPin (string nullable), lockoutUntil (Date nullable),
  lastLoginAt (Date nullable), lastSeenAt (Date nullable), referredById (string nullable),
  deletedAt (Date nullable)
- static create(): User oluştur + UserRegisteredEvent ekle
- static createFromGoogle(): Google OAuth ile oluştur (password null)
- changePassword(): şifre değiştir
- updateProfile(): profil güncelle + UserUpdatedEvent ekle
- suspend(): hesap askıya al
- ban(): hesap yasakla
- activate(): hesap aktifleştir
- verifyEmail(): email doğrula
- updateLastLogin(): son giriş zamanını güncelle
- isLocked(): lockout kontrolü
- softDelete(): deletedAt set et + UserDeletedEvent ekle
- setTransactionPin(): işlem PIN'i set et

DOSYA #13: apps/backend/src/modules/identity/domain/entities/user-profile.entity.ts
- UserProfile extends Entity
- Props: userId, firstName, lastName, phone, avatar, bio, birthday, gender, city, cityId, district, districtId
- static create(): profil oluştur
- update(): profil güncelle
- getFullName(): firstName + lastName

DOSYA #14: apps/backend/src/modules/identity/domain/entities/user-address.entity.ts
- UserAddress extends Entity
- Props: userId, title, firstName, lastName, email, phone, addressLine1, addressLine2,
  city, district, neighborhood, postalCode, isDefault
- static create(): adres oluştur
- update(): adres güncelle
- setAsDefault(): varsayılan adres yap
- getFullAddress(): tam adres string'i

DOSYA #15: apps/backend/src/modules/identity/domain/repositories/user.repository.interface.ts
- IUserRepository extends IRepository<User>
- Ek metodlar: findByEmail, findByGoogleId, findByPhoneNumber, existsByEmail

DOSYA #16: apps/backend/src/modules/identity/domain/repositories/user-profile.repository.interface.ts
- IUserProfileRepository
- Metodlar: findByUserId, save, update

DOSYA #17: apps/backend/src/modules/identity/domain/repositories/user-address.repository.interface.ts
- IUserAddressRepository
- Metodlar: findByUserId, findById, save, update, delete, setDefault

=== APPLICATION KATMANI (use case'ler, CQRS) ===

DOSYA #18: apps/backend/src/modules/identity/application/dtos/register-user.dto.ts
- RegisterUserDto: email, password, phoneNumber?, platform?, referralCode?
- class-validator decoratörleri ile validasyon

DOSYA #19: apps/backend/src/modules/identity/application/dtos/update-profile.dto.ts
- UpdateProfileDto: firstName?, lastName?, phone?, avatar?, bio?, birthday?, gender?, city?, district?

DOSYA #20: apps/backend/src/modules/identity/application/dtos/change-password.dto.ts
- ChangePasswordDto: currentPassword, newPassword

DOSYA #21: apps/backend/src/modules/identity/application/dtos/add-address.dto.ts
- AddAddressDto: title, firstName, lastName, phone, addressLine1, addressLine2?, city, district, neighborhood?, postalCode?, isDefault?

DOSYA #22: apps/backend/src/modules/identity/application/dtos/update-address.dto.ts
- UpdateAddressDto: PartialType(AddAddressDto)

DOSYA #23: apps/backend/src/modules/identity/application/dtos/user-response.dto.ts
- UserResponseDto: id, email, phoneNumber, role, status, platform, isEmailVerified, lastLoginAt, createdAt
- static fromEntity(user: User): UserResponseDto

DOSYA #24: apps/backend/src/modules/identity/application/dtos/profile-response.dto.ts
- ProfileResponseDto: id, userId, firstName, lastName, fullName, avatar, bio, city, district
- static fromEntity(profile: UserProfile): ProfileResponseDto

DOSYA #25: apps/backend/src/modules/identity/application/dtos/address-response.dto.ts
- AddressResponseDto: id, title, firstName, lastName, phone, fullAddress, isDefault
- static fromEntity(address: UserAddress): AddressResponseDto

DOSYA #26: apps/backend/src/modules/identity/application/commands/register-user.command.ts
- RegisterUserCommand extends Command
- Props: dto: RegisterUserDto

DOSYA #27: apps/backend/src/modules/identity/application/commands/register-user.handler.ts
- RegisterUserHandler implements ICommandHandler<RegisterUserCommand>
- Inject: IUserRepository, HashingService, IEventBus
- Logic:
  1. Email duplicate kontrolü
  2. Password hash
  3. User.create() ile entity oluştur
  4. Repository'ye kaydet
  5. UserRegisteredEvent publish et (RabbitMQ — financial-service cüzdan oluştursun diye)
  6. Result<UserResponseDto> döndür

DOSYA #28: apps/backend/src/modules/identity/application/commands/update-profile.command.ts
DOSYA #29: apps/backend/src/modules/identity/application/commands/update-profile.handler.ts
- UserId + UpdateProfileDto al
- Profil yoksa oluştur, varsa güncelle

DOSYA #30: apps/backend/src/modules/identity/application/commands/change-password.command.ts
DOSYA #31: apps/backend/src/modules/identity/application/commands/change-password.handler.ts
- Mevcut şifreyi doğrula (HashingService.compare)
- Yeni şifreyi hashle ve kaydet
- Google OAuth kullanıcısı password set ediyorsa da çalışmalı

DOSYA #32: apps/backend/src/modules/identity/application/commands/add-address.command.ts
DOSYA #33: apps/backend/src/modules/identity/application/commands/add-address.handler.ts
- UserAddress.create() ile entity oluştur
- isDefault=true ise diğer adreslerin isDefault'unu false yap

DOSYA #34: apps/backend/src/modules/identity/application/commands/update-address.command.ts
DOSYA #35: apps/backend/src/modules/identity/application/commands/update-address.handler.ts

DOSYA #36: apps/backend/src/modules/identity/application/commands/delete-address.command.ts
DOSYA #37: apps/backend/src/modules/identity/application/commands/delete-address.handler.ts
- Soft delete (deletedAt set et)

DOSYA #38: apps/backend/src/modules/identity/application/commands/set-transaction-pin.command.ts
DOSYA #39: apps/backend/src/modules/identity/application/commands/set-transaction-pin.handler.ts
- PIN'i hashle ve kaydet (EncryptionService kullan)

DOSYA #40: apps/backend/src/modules/identity/application/queries/get-user.query.ts
DOSYA #41: apps/backend/src/modules/identity/application/queries/get-user.handler.ts
- userId ile User bul, UserResponseDto döndür

DOSYA #42: apps/backend/src/modules/identity/application/queries/get-profile.query.ts
DOSYA #43: apps/backend/src/modules/identity/application/queries/get-profile.handler.ts

DOSYA #44: apps/backend/src/modules/identity/application/queries/list-users.query.ts
DOSYA #45: apps/backend/src/modules/identity/application/queries/list-users.handler.ts
- PaginationInput al, PaginatedResult<UserResponseDto> döndür
- Filtreleme: role, status, search (email/phone)

DOSYA #46: apps/backend/src/modules/identity/application/queries/get-addresses.query.ts
DOSYA #47: apps/backend/src/modules/identity/application/queries/get-addresses.handler.ts

DOSYA #48: apps/backend/src/modules/identity/application/queries/get-login-history.query.ts
DOSYA #49: apps/backend/src/modules/identity/application/queries/get-login-history.handler.ts

DOSYA #50: apps/backend/src/modules/identity/application/event-handlers/user-registered.handler.ts
- UserRegisteredEvent dinle
- IntegrationEvent olarak RabbitMQ'ya publish et (identity.events exchange, user.registered routing key)
- Log kaydet

DOSYA #51: apps/backend/src/modules/identity/application/event-handlers/user-updated.handler.ts
- UserUpdatedEvent dinle → RabbitMQ'ya publish et

=== INFRASTRUCTURE KATMANI ===

DOSYA #52: apps/backend/src/modules/identity/infrastructure/persistence/mappers/user.mapper.ts
- Prisma User model ↔ Domain User entity dönüşümü
- toDomain(prismaUser): User
- toPersistence(domainUser): Prisma.UserCreateInput / Prisma.UserUpdateInput

DOSYA #53: apps/backend/src/modules/identity/infrastructure/persistence/mappers/user-profile.mapper.ts
- Prisma UserProfile ↔ Domain UserProfile dönüşümü

DOSYA #54: apps/backend/src/modules/identity/infrastructure/persistence/mappers/user-address.mapper.ts
- Prisma UserAddress ↔ Domain UserAddress dönüşümü

DOSYA #55: apps/backend/src/modules/identity/infrastructure/persistence/prisma-user.repository.ts
- PrismaUserRepository implements IUserRepository
- Extends BasePrismaRepository<User>
- UserMapper kullanarak domain ↔ persistence dönüşümü
- findByEmail, findByGoogleId, findByPhoneNumber, existsByEmail implementasyonları
- Soft delete desteği: tüm sorgularda deletedAt === null filtresi

DOSYA #56: apps/backend/src/modules/identity/infrastructure/persistence/prisma-user-profile.repository.ts
- PrismaUserProfileRepository implements IUserProfileRepository

DOSYA #57: apps/backend/src/modules/identity/infrastructure/persistence/prisma-user-address.repository.ts
- PrismaUserAddressRepository implements IUserAddressRepository

DOSYA #58: apps/backend/src/modules/identity/infrastructure/auth/token.service.ts
- TokenService
- Inject: JwtService, Redis (ioredis)
- generateAccessToken(user): 15dk ömürlü JWT
- generateRefreshToken(user): 7gün ömürlü JWT + DB'ye hash'ini kaydet
- verifyAccessToken(token): doğrula + Redis blacklist kontrolü
- verifyRefreshToken(token): doğrula + DB'de hash kontrolü + revoke kontrolü
- revokeRefreshToken(tokenId): revokedAt set et
- revokeAllUserTokens(userId): tüm refresh token'ları revoke et
- blacklistAccessToken(token, ttl): Redis'e ekle (logout'ta)
- Token payload: { sub: userId, email, role, platform }

DOSYA #59: apps/backend/src/modules/identity/infrastructure/auth/session.service.ts
- SessionService
- Inject: PrismaService, Redis
- createSession(userId, userAgent, ipAddress): Session oluştur
- getActiveSessions(userId): aktif session listesi
- revokeSession(sessionId): session sil
- revokeAllSessions(userId): tüm session'ları sil
- updateLastActive(sessionId): lastActiveAt güncelle
- Redis'te aktif session sayısı cache'le

DOSYA #60: apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts
- AuthService
- Inject: IUserRepository, TokenService, SessionService, HashingService, IEventBus
- register(dto: RegisterUserDto): kullanıcı kaydet, token üret, session oluştur
- loginWithEmail(email, password): email/password ile giriş
  1. User bul
  2. Lockout kontrolü
  3. Password karşılaştır (HashingService.compare)
  4. Başarısız → loginHistory'ye FAILED kaydet, 5 başarısız girişte lockout (30dk)
  5. Başarılı → token üret, session oluştur, lastLoginAt güncelle, loginHistory'ye SUCCESS kaydet
- loginWithGoogle(googleProfile): Google OAuth ile giriş
  1. googleId ile User bul
  2. Yoksa → User.createFromGoogle() ile yeni kullanıcı oluştur
  3. Token üret, session oluştur
- refreshTokens(refreshToken): access token yenile
  1. Refresh token doğrula
  2. Yeni access + refresh token üret (rotation)
  3. Eski refresh token'ı revoke et
- logout(accessToken, refreshToken): çıkış
  1. Access token'ı blacklist'e ekle (Redis)
  2. Refresh token'ı revoke et
  3. Session'ı sil
- logoutAll(userId): tüm cihazlardan çıkış
- Return type: { accessToken, refreshToken, user: UserResponseDto }

DOSYA #61: apps/backend/src/modules/identity/infrastructure/auth/auth.controller.ts
- AuthController — prefix: /auth
- POST /auth/register — @Public(), RegisterUserDto
- POST /auth/login — @Public(), { email, password }
- POST /auth/refresh — @Public(), { refreshToken }
- POST /auth/logout — authenticated, Authorization header + body { refreshToken }
- POST /auth/logout-all — authenticated
- GET /auth/sessions — authenticated, aktif session listesi
- DELETE /auth/sessions/:id — authenticated, belirli session'ı kapat
- Response format: { accessToken, refreshToken, user }
- Cookie ayarları: httpOnly, secure, sameSite: 'lax', path: '/'

DOSYA #62: apps/backend/src/modules/identity/infrastructure/auth/google-oauth.controller.ts
- GoogleOAuthController — prefix: /auth/google
- GET /auth/google — @Public(), Google OAuth başlat (redirect)
- GET /auth/google/callback — @Public(), Google callback
  1. GoogleOAuthStrategy ile profile al
  2. authService.loginWithGoogle(profile)
  3. Token'ları cookie'ye yaz
  4. Frontend'e redirect (success URL)

DOSYA #63: apps/backend/src/modules/identity/infrastructure/auth/strategies/local.strategy.ts
- LocalStrategy extends PassportStrategy
- validate(email, password): authService.loginWithEmail çağır

DOSYA #64: apps/backend/src/modules/identity/infrastructure/event-publishers/identity-event.publisher.ts
- IdentityEventPublisher
- Inject: RabbitMQService
- publishUserRegistered(event): IDENTITY_EXCHANGE, routing key: user.registered
- publishUserUpdated(event): IDENTITY_EXCHANGE, routing key: user.updated
- publishUserDeleted(event): IDENTITY_EXCHANGE, routing key: user.deleted
- Outbox pattern ile güvenilir publish

=== PRESENTATION KATMANI ===

DOSYA #65: apps/backend/src/modules/identity/presentation/user.controller.ts
- UserController — prefix: /users
- GET /users — @Roles('ADMIN', 'SUPER_ADMIN'), paginated list, filtreleme
- GET /users/me — authenticated, kendi bilgileri
- GET /users/:id — @Roles('ADMIN'), belirli kullanıcı
- PATCH /users/:id/status — @Roles('ADMIN'), kullanıcı durumu değiştir (suspend, ban, activate)
- DELETE /users/:id — @Roles('SUPER_ADMIN'), soft delete
- CommandBus ve QueryBus inject edip CQRS pattern uygula

DOSYA #66: apps/backend/src/modules/identity/presentation/profile.controller.ts
- ProfileController — prefix: /users/me/profile
- GET /users/me/profile — kendi profilini getir
- PUT /users/me/profile — profilini güncelle
- PATCH /users/me/password — şifre değiştir
- PATCH /users/me/transaction-pin — işlem PIN'i set et

DOSYA #67: apps/backend/src/modules/identity/presentation/address.controller.ts
- AddressController — prefix: /users/me/addresses
- GET /users/me/addresses — adres listesi
- POST /users/me/addresses — yeni adres ekle
- PUT /users/me/addresses/:id — adres güncelle
- DELETE /users/me/addresses/:id — adres sil (soft delete)
- PATCH /users/me/addresses/:id/default — varsayılan adres yap

=== MODULE REGISTRATION ===

DOSYA #68: apps/backend/src/modules/identity/identity.module.ts
- NestJS Module
- imports: PrismaModule, CqrsModule, SharedSecurityModule
- providers:
  - Repository'ler (IUserRepository → PrismaUserRepository, vb.)
  - Command handlers (tümü)
  - Query handlers (tümü)
  - Event handlers (tümü)
  - AuthService, TokenService, SessionService
  - IdentityEventPublisher
- controllers: AuthController, GoogleOAuthController, UserController, ProfileController, AddressController
- exports: AuthService, TokenService (diğer modüller kullanabilsin)

DOSYA #69: apps/backend/src/app.module.ts (GÜNCELLE)
- IdentityModule'ü import'lara ekle

DOSYA #70: apps/backend/src/app-components.ts (GÜNCELLE)
- CORE grubuna IdentityModule ekle
```

### KONTROL

Tüm dosyaları yazdıktan sonra şunları kontrol et:
1. Her dosyanın başında tam path yorum olarak var mı?
2. Import path'leri @barterborsa/* workspace alias kullanıyor mu?
3. Domain entity'ler shared-core'daki AggregateRoot/Entity/ValueObject'ten türüyor mu?
4. Repository implementasyonları shared-persistence'taki BasePrismaRepository'den türüyor mu?
5. CQRS: Command handler'lar @CommandHandler() decorator kullanıyor mu?
6. CQRS: Query handler'lar @QueryHandler() decorator kullanıyor mu?
7. Controller'larda @Public() ve @Roles() doğru kullanılıyor mu?
8. Token payload'ında sub, email, role, platform var mı?
9. Soft delete: tüm sorgularda deletedAt === null filtresi var mı?
10. TypeScript strict mode'da derlenir mi?
11. Prisma schema'da enum'lar tanımlı mı?

Sorun varsa düzelt ve açıkla.

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (Gemini'ye yapıştırma, senin için)

- Bu prompt 70 dosya içeriyor. Gemini kesererse "devam et, kaldığın dosya numarasından devam et" de.
- Parçalı vermek istersen:
  - İlk mesaj: Dosya #1 — #17 (Prisma + Domain)
  - İkinci mesaj: Dosya #18 — #51 (Application: DTOs + Commands + Queries + Events)
  - Üçüncü mesaj: Dosya #52 — #70 (Infrastructure + Presentation + Module)
- Gemini bitirince çıktıyı Claude'a gönder, review edeyim.
- Mevcut projeden KOD VERME. Sadece bu prompt'u ver.
