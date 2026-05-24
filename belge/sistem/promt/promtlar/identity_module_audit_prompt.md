# Identity Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Identity modülünü kasıtlı olarak iki katmana ayırdın: domain logic `packages/domain-identity/` shared package'ında yaşıyor, backend'deki `apps/backend/src/modules/identity/` yalnızca controller katmanı. Bu kararı bilinçli aldın — aynı domain logic'in farklı servisler (backend, potansiyel olarak delivery-service) tarafından kullanılabilmesi için. Şimdi geri dönüp bu tasarımı ve implementasyonu eleştirel gözle değerlendiriyorsun.

Önemli ek bağlam: `JwtAuthGuard` `APP_GUARD` olarak global tanımlı — bu modüldeki bir güvenlik açığı tüm sistemi etkiler. Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**İki konumu birlikte incele:**

```
packages/domain-identity/          ← Domain logic (shared package)
  src/
    domain/
      entities/user.entity.ts
      value-objects/email.vo.ts (muhtemelen)
      value-objects/password.vo.ts (muhtemelen)
    application/
      commands/
        register-user.{command,handler}.ts
        login-user.{command,handler}.ts
        logout-user.{command,handler}.ts
        change-password.{command,handler}.ts
        refresh-token.{command,handler}.ts
        update-profile.{command,handler}.ts
        manage-address.{command,handler}.ts
      queries/
        get-user.{query,handler}.ts
        get-profile.{query,handler}.ts
    infrastructure/
      (repository implementations)

apps/backend/src/modules/identity/  ← Sadece controller katmanı
  presentation/
    auth.controller.ts              POST /auth/register, /auth/login, /auth/refresh, /auth/logout
    google-oauth.controller.ts      GET /auth/google, /auth/google/callback
    profile.controller.ts           GET/POST /identity/profile, POST /identity/profile/change-password
    address.controller.ts           CRUD /addresses
    user.controller.ts              GET /users/me
    admin-user.controller.ts        Admin: kullanıcı listele/sil/rol değiştir
  infrastructure/auth/
    auth.service.ts                 Token üretimi, refresh rotation, session yönetimi
    token.service.ts                JWT üret/doğrula, Redis blacklist

packages/shared/
  shared-security/                  JwtAuthGuard, RolesGuard, SharedSecurityModule
  shared-nest/                      @CurrentUser, @Roles dekoratörleri
```

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · Redis  
**Auth:** JWT (access + refresh) + Google OAuth  
**Global guard:** `JwtAuthGuard` tüm uygulamaya `APP_GUARD` olarak uygulanmış

**Mongoose modelleri:**  
`User`, `UserProfile`, `UserAddress`, `RefreshToken`, `VerificationToken`, `LoginHistory`, `Session`, `SSOToken`

**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Log: `Logger` (`console.*` yasak)
- Tip: strict TypeScript (`any` yasak)
- Business logic: domain entity veya value object'te

---

## Identity İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Kayıt (Register)

```
- E-posta benzersiz olmalı (case-insensitive: "User@Example.com" = "user@example.com")
- Şifre minimum 8 karakter, en az 1 büyük harf, 1 rakam (domain rule)
- Kayıt sonrası e-posta doğrulama (VerificationToken) — zorunlu mu değil mi?
- İlk kayıtta: User.role = 'USER' (ADMIN veya VENDOR olamaz)
- İlk işlem kuralı: XP kazanımı ve kullanımı ilk girişte kapalı
```

### Login & Token Yaşam Döngüsü

```
Access token:
  - Kısa ömürlü (örn: 15 dakika)
  - Redis'te blacklist YOK (kısa ömür yeterli)
  - JWT'de: userId, email, role, tier (varsa)

Refresh token:
  - Uzun ömürlü (örn: 7 gün)
  - MongoDB'de kayıtlı (RefreshToken koleksiyonu)
  - Redis'te blacklist VAR (logout'ta ve rotation'da)
  - Rotation: her kullanımda yeni refresh token verilir, eskisi geçersiz kılınır
  - Tek cihaz mı, çok cihaz mı? (bir kullanıcının birden fazla aktif refresh token'ı olabilir mi?)

Logout:
  - Refresh token MongoDB'den silinir
  - Eski refresh token Redis blacklist'e eklenir (kalan TTL süresince)
  - Access token invalidate edilemez (kısa ömür kabul edilir)

Login throttle:
  - auth.controller.ts'de @Throttle(5, 60) — 60 saniyede 5 istek
  - Başarısız login loglanıyor mu? (LoginHistory)
  - IP bazlı mı, kullanıcı bazlı mı?
```

### Google OAuth Akışı

```
GET /auth/google → Google'a redirect
GET /auth/google/callback:
  1. Google profile al (email, sub, name, avatar)
  2. SSOToken veya email ile mevcut User var mı?
     → Varsa: login et, access + refresh token üret
     → Yoksa: yeni User oluştur (email = Google email, role = 'USER')
  3. SSOToken kaydı: User ↔ Google sub bağlantısı
  4. Frontend'e redirect (token query param veya cookie ile)

Güvenlik:
  - state parametresi CSRF koruması için kullanılıyor mu?
  - Google callback URL whitelist'te mi?
  - Token query param'da iletiliyorsa URL history riski var
```

### Şifre Değişikliği

```
Mevcut şifre doğrulaması → yeni şifre domain rule kontrolü → hash → kaydet
Şifre değişikliğinde: tüm aktif refresh token'lar geçersiz kılınmalı
(kullanıcı başka cihazlardan otomatik logout olmalı)
```

### Rol Yönetimi (Admin)

```
Roller: USER | VENDOR | ADMIN | SUPER_ADMIN
- VENDOR: vendor kaydı onaylandığında atanır (vendor modülü tarafından)
- ADMIN: sadece SUPER_ADMIN veya kod deploy ile atanabilir
- SUPER_ADMIN: tek kişi, production'da seed ile oluşturulur
- Admin kullanıcı listele/sil/rol değiştir → admin-user.controller.ts
```

### `@CurrentUser` Decorator Güvencesi

```
shared-nest/@CurrentUser → JWT'den userId'yi alır
→ Tüm controller'larda bu decorator güvenli mi?
→ JwtAuthGuard geçmeden @CurrentUser undefined döner mi?
→ @Public() decorator'lı endpoint'lerde @CurrentUser kullanılırsa ne olur?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Domain package sınırı doğruluğu:**

- `packages/domain-identity/` gerçekten sadece domain logic mi içeriyor? Controller, HTTP, Express/NestJS decorator'ları var mı?
- Handler'lar NestJS `@Injectable()` mi, yoksa saf TypeScript class mı? (NestJS bağımlılığı shared package'ı kirletir)
- `CommandBus` ve `QueryBus` `domain-identity` paketinde mi, yoksa backend `identity.module.ts`'te mi register ediliyor?
- `domain-identity` paketi `delivery-service` veya `financial-service` tarafından import ediliyor mu? (Tasarım amacıyla örtüşüyor mu?)

**1.2 `auth.service.ts` sorumluluk analizi:**

`auth.service.ts` "token üretimi, refresh rotation, session yönetimi" yapıyor. Bu tek sınıfın yaptıklarını listele:

- JWT imzalama
- Refresh token oluşturma ve DB'ye kaydetme
- Redis blacklist yazma/okuma
- Session kayıt
- LoginHistory yazma

Bu sorumluluklar fazla mı? Hangileri ayrı servise çıkarılmalı? (`TokenService` zaten var — aralarındaki sınır nerede?)

**1.3 `token.service.ts` vs `auth.service.ts` sınır analizi:**

İki servis var. Her birinin gerçekte ne yaptığını koddan çıkar:

| Metod | Hangi serviste? | Doğru yer mi? |
|---|---|---|
| JWT imzala | ? | ? |
| JWT doğrula | ? | ? |
| Redis blacklist'e ekle | ? | ? |
| Redis blacklist kontrol et | ? | ? |
| Refresh token DB'ye kaydet | ? | ? |
| Refresh token rotasyonu | ? | ? |
| Session oluştur | ? | ? |
| LoginHistory yaz | ? | ? |

Tabloyu doldur. Yanlış yerde olan metodları tespit et, doğru taşıma kodunu yaz.

**1.4 Global guard mekanizması:**

- `JwtAuthGuard` `APP_GUARD` olarak nerede register ediliyor? (`app.module.ts`? `identity.module.ts`?)
- `@Public()` decorator'ı nasıl çalışıyor? `Reflector` ile `IS_PUBLIC_KEY` metadata mı?
- `@Public()` olmayan endpoint'e JWT'siz istek giderse ne oluyor? 401 mü, 403 mü, başka bir hata mı?
- Guard execution order nedir? `JwtAuthGuard` → `RolesGuard` sırası doğru mu?
- `RolesGuard` `@Roles()` decorator'ı olmayan endpoint'e nasıl davranıyor?

**1.5 Google OAuth güvenlik denetimi:**

- `state` parametresi CSRF koruması olarak kullanılıyor mu? (Passport.js Google strategy bunu otomatik yapmıyor)
- Callback'ten sonra token frontend'e nasıl iletiliyor? Query param mı, cookie mi, başka bir yol mu?
  - Query param: URL history'e düşer → güvenlik riski
  - Cookie: HttpOnly, Secure, SameSite ayarları doğru mu?
- `SSOToken` koleksiyonu: Google `sub` (subject ID) kaydediliyor mu? E-posta değişirse ne olur?

**1.6 Modül bağımlılık grafiği:**

- `identity.module.ts` import listesi — kaç modüle bağımlı?
- Diğer modüller identity'ye nasıl bağlanıyor? `User` koleksiyonuna doğrudan mı erişiyor?
- `shared-security` modülü global mı, her modülde import mu?
- `@CurrentUser` decorator'ını kullanan tüm controller'lar `JwtAuthGuard` koruması altında mı?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Her iki konumu tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  packages/domain-identity/src/ \
  apps/backend/src/modules/identity/ \
  packages/shared/shared-security/src/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Lokasyon | Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|---|
| domain-identity | register-user.handler.ts | ? | `payload: any` | KRİTİK | `RegisterUserDto` |
| shared-security | jwt.strategy.ts | ? | `user: any` | YÜKSEK | `JwtPayload` |

Risk seviyeleri:
- `KRİTİK`: `user.role` veya `user.id` `any`'den geliyor — yetkilendirme bypass riski
- `YÜKSEK`: JWT payload `any` — sahte claim'ler type check'ten geçebilir
- `ORTA`: Handler request/response `any` — validation atlıyor
- `DÜŞÜK`: İzole scope, güvenlik etkisi yok

**Adım 3:** JWT payload tipi — en kritik `any` noktası:

`JwtAuthGuard` → `JwtStrategy.validate()` → `req.user` zincirinde her adım tipli olmalı:

```typescript
// shared-security'deki doğru tipler:
interface JwtPayload {
  sub: string;              // userId
  email: string;
  role: UserRole;           // 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN'
  tier?: string;            // loyalty tier (opsiyonel)
  iat: number;
  exp: number;
}

interface RequestUser {
  userId: string;           // payload.sub
  email: string;
  role: UserRole;
  tier?: string;
}

// @CurrentUser decorator'ın döndürdüğü tip:
// shared-nest/@CurrentUser → RequestUser
```

Bu tipler tanımlı mı? `any` ile mi kullanılıyor?

**Adım 4:** Google OAuth callback handler'ında tip güvensizliği:

Google profile objesi genellikle `any` veya `Profile` (Passport.js tipi) olarak gelir:

```typescript
// Kötü:
async googleCallback(req: any) {
  const user = req.user; // any
}

// Doğru:
interface GoogleProfile {
  id: string;          // Google sub
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
}

async validate(
  accessToken: string,
  refreshToken: string,
  profile: GoogleProfile,
): Promise<RequestUser>
```

**Adım 5:** `admin-user.controller.ts`'de rol değiştirme endpoint'inde:

```typescript
// Rol değiştirme DTO tipli mi?
interface ChangeUserRoleDto {
  role: 'USER' | 'VENDOR' | 'ADMIN'; // SUPER_ADMIN verilemez
}
// 'SUPER_ADMIN' ataması API üzerinden mümkün mü? Olmamalı.
```

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Rol bazlı dallanma:**
```typescript
// Kötü — controller veya handler'da:
if (user.role === 'ADMIN') { ... }
else if (user.role === 'VENDOR') { ... }
else if (user.role === 'USER') { ... }
// → @Roles() + RolesGuard kombinasyonu nasıl kullanılır? Kodu yaz
```

**Pattern B — Google vs. normal login dallanması:**
```typescript
// auth.service.ts'de:
if (provider === 'google') { ... }
else if (provider === 'local') { ... }
// → Strategy pattern ile nasıl ayrıştırılır?
```

**Pattern C — E-posta normalizasyonu:**
```typescript
// Kayıt ve login'de:
if (email) email = email.toLowerCase().trim();
// Bu normalizasyon kaç yerde yapılıyor? Tek bir value object'te mi?
// Email VO olmalı:
class Email {
  private constructor(private readonly value: string) {}
  static create(raw: string): Email {
    const normalized = raw.toLowerCase().trim();
    if (!isValidEmail(normalized)) throw new InvalidEmailError();
    return new Email(normalized);
  }
  toString(): string { return this.value; }
}
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti — güvenlik kritik:**

**Antipattern A — Refresh token rotasyonunda sessiz hata:**
```typescript
// Kötü:
async rotateRefreshToken(oldToken: string) {
  try {
    await this.redis.setex(`blacklist:${oldToken}`, ttl, '1');
  } catch {
    // Redis yazılamadı — eski token hâlâ geçerli
    // → Token çalınmışsa yeniden kullanılabilir
  }
  // Devam et — güvenlik açığı
}
// Doğru: Redis yazımı başarısız olursa rotation iptal et ve error fırlat
```

**Antipattern B — JWT doğrulamada generic catch:**
```typescript
// Kötü:
try {
  const payload = jwt.verify(token, secret);
  return payload;
} catch (e) {
  throw new UnauthorizedException(); // hangi hata olduğu bilinmiyor
}

// Doğru — JWT hata tipleri farklı:
} catch (e) {
  if (e instanceof jwt.TokenExpiredError) {
    throw new UnauthorizedException({ code: 'TOKEN_EXPIRED' });
  }
  if (e instanceof jwt.JsonWebTokenError) {
    throw new UnauthorizedException({ code: 'TOKEN_INVALID' });
  }
  throw new UnauthorizedException({ code: 'TOKEN_VERIFICATION_FAILED' });
}
```

**Antipattern C — LoginHistory yazımında hata yutma:**
```typescript
// Login başarılı ama history yazılamadı → sessizce devam
try {
  await this.loginHistoryRepo.create({ userId, ip, userAgent, success: true });
} catch { /* yut */ }
// → Audit trail eksik ama sessiz
// Doğru: yut ama Logger.error ile kaydet, retry queue'ya ekle
```

**Antipattern D — Google OAuth callback'te unhandled state:**
```typescript
// google-oauth.controller.ts'de:
// Google hata dönerse (kullanıcı izin vermedi) callback ne yapıyor?
// → Passport.js hata handler'ı var mı?
// → Frontend'e hata nasıl iletiliyor?
```

**3.3 Refresh token rotation güvenlik analizi:**

```
Şunları kontrol et:

1. Rotation atomic mi?
   Yeni token oluştur → eski token blacklist → DB güncelle
   Bu üç adım aynı transaction'da mı? (MongoDB transaction + Redis atomic)
   Değilse: yeni token verildi ama eski blacklist'e eklenmedi → eski token reuse edilebilir

2. Aynı refresh token iki kez kullanılırsa?
   → Token reuse detection var mı?
   → Güvenlik best practice: reuse tespit edilirse TÜM kullanıcı session'larını geçersiz kıl
   → Mevcut implementasyon bunu yapıyor mu?

3. Refresh token TTL'si Redis blacklist TTL'siyle tutarlı mı?
   → RefreshToken.expiresAt ve Redis setex TTL aynı değerde mi?
   → Tutarsızlık: token expire olmadan önce blacklist'ten düşer → reuse mümkün
```

**3.4 Şifre değişikliğinde session temizleme:**

```
change-password.handler.ts'de:
  □ Mevcut şifre verify ediliyor mu? (hash compare)
  □ Yeni şifre domain rule validate ediliyor mu? (8 karakter, büyük harf, rakam)
  □ Şifre değişikliğinden sonra TÜM refresh token'lar geçersiz kılınıyor mu?
    (sadece mevcut session değil, tüm cihazlar)
  □ Access token'lar kısa ömürlü olduğu için expire olmayı bekliyor — bu kabul edilebilir mi?
```

**3.5 Business rule sızıntısı:**

- E-posta format validasyonu nerede? DTO'da `@IsEmail()` mi, domain entity'de mi, her ikisinde mi?
- Şifre strength rule'u nerede? DTO'da `@Matches()` mi, `Password` value object'te mi?
- "İlk işlem kuralı" (XP ilk girişte kapalı) identity handler'da mı, loyalty modülünde mi uygulanıyor?
- Rol atama kuralı (kayıtta sadece USER) nerede enforce ediliyor?

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead code tespiti:**

```bash
grep -rn "^export" \
  packages/domain-identity/src/ \
  apps/backend/src/modules/identity/ \
  --include="*.ts" \
  | grep -oP '(?<=class |function |const |interface |enum )\w+' \
  | while read name; do
      refs=$(grep -rn "\b$name\b" \
        packages/domain-identity/ \
        apps/backend/ \
        --include="*.ts" | wc -l)
      [ "$refs" -le 1 ] && echo "POSSIBLE DEAD: $name"
    done
```

Özellikle şunlara bak:
- `Session` Mongoose modeli: nerede yazılıyor, nerede okunuyor? `RefreshToken` ile overlap var mı?
- `VerificationToken` modeli: e-posta doğrulama akışı implement edilmiş mi? Yoksa model var, logic yok mu?
- `LoginHistory` modeli: yazılıyor mu gerçekten? Admin panelinde gösteriliyor mu?
- `SSOToken` modeli: Google OAuth'ta kullanılıyor mu? `User.googleId` field'ı varsa SSOToken gereksiz mi?

**4.2 `Session` vs `RefreshToken` çakışması:**

İki model var: `Session` ve `RefreshToken`. Bunların farkı ne?

```
Session:     sessionId, userId, createdAt, lastActivityAt, userAgent, ip
RefreshToken: tokenHash, userId, expiresAt, createdAt, userAgent, ip

Çakışan alanlar: userId, userAgent, ip, createdAt
→ Bu iki model aynı şey mi farklı isimle? Biri kaldırılmalı mı?
→ Hangisi logout'ta temizleniyor?
→ Hangisi blacklist'le koordineli?
```

**4.3 `domain-identity` paket boyutu:**

- Paketin `package.json`'unda hangi `peerDependencies` var?
- NestJS importu var mı? (`@nestjs/common`, `@nestjs/cqrs`) — varsa bu shared package'ı NestJS bağımlı yapıyor
- `@nestjs/cqrs` importu varsa: `CommandHandler`, `QueryHandler` decorator'ları package'ın içinde mi kullanılıyor? Bu NestJS'e sıkı bağlantı yaratıyor.
- Alternatif: Handler'ları backend'e taşı, domain-identity'de sadece entity ve VO bırak

**4.4 Duplicate e-posta normalizasyonu tespiti:**

```bash
grep -rn "toLowerCase\|toLowerCase()\|email.*trim\|trim.*email" \
  packages/domain-identity/src/ \
  apps/backend/src/modules/identity/ \
  --include="*.ts"
```

Kaç yerde e-posta normalize ediliyor? Birden fazlaysa Email value object'i yaz (Bölüm 3.1 Pattern C'deki gibi).

**4.5 `admin-user.controller.ts` şişkinlik analizi:**

Admin kullanıcı yönetimi için kaç endpoint var? Her birinin handler'ı `domain-identity` paketinde mi, backend'de mi?

```
GET  /admin/users          ← kullanıcı listele
GET  /admin/users/:id      ← kullanıcı detay
PATCH /admin/users/:id/role ← rol değiştir
DELETE /admin/users/:id    ← kullanıcı sil / ban
```

Rol değiştirme ve ban/suspend işlemlerinde audit log yazılıyor mu?

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `packages/domain-identity/src/.../file.ts:satır`
          veya `apps/backend/src/modules/identity/.../file.ts:satır`
**Tespit:** [Ne buldun]
**Risk:** KRİTİK / YÜKSEK / ORTA / DÜŞÜK
**Sorun:** [Neden sorun — tek cümle]

**Düzeltme:**
```typescript
// Tam, çalışır, copy-paste edilebilir kod
```

**Cascade etkisi:** [Bu değişiklik başka neyi etkiler]
```

---

## Önceliklendirme

1. **KRİTİK** — JWT payload `any` (yetkilendirme bypass riski), refresh token rotation atomic değilse (token reuse saldırısı), `SUPER_ADMIN` rolünün API üzerinden atanabilmesi, Google OAuth `state` parametresi eksikliği
2. **YÜKSEK** — Refresh token reuse detection eksikliği, şifre değişikliğinde session temizleme eksikliği, `token.service.ts` / `auth.service.ts` sorumluluk karmaşası
3. **ORTA** — `Session` vs `RefreshToken` model çakışması, `VerificationToken` dead implementation, e-posta normalizasyonu duplicate, domain-identity NestJS sıkı bağlantısı
4. **DÜŞÜK** — Dead code, `LoginHistory` yazımı doğrulama, admin audit log eksikliği

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **JWT algoritması** — HS256 veya RS256 seçimi iş/ops kararı
- **Access token TTL** — kısa ömür kararı kasıtlı, değiştirme
- **`@Throttle(5, 60)` login limiti** — değerleri iş kararı, mekanizmayı incelemeye devam et
- **Google OAuth flow'un Passport.js ile kullanımı** — kütüphane seçimi değiştirme
- **Rol hiyerarşisi (USER < VENDOR < ADMIN < SUPER_ADMIN)** — iş kararı
- **domain-identity'yi ayrı package olarak tutma kararı** — mimari karar, sadece iyileştirme öner
- **`RefreshToken` koleksiyonundaki mevcut data** — migration gerektiren değişiklikler için önce plan yaz, implement etme

---

## Son Not

Identity modülü tüm sistemin güvenlik temeli. Buradaki bir açık başka modüldeki on hatadan daha tehlikelidir:

JWT payload'ında `any` → saldırgan token'ı manipüle edip kendine `ADMIN` role atayabilir — tüm sistem açık.

Refresh token rotation atomic değilse → token çalınırsa saldırgan eski token'ı rotation'dan önce tekrar kullanabilir — kullanıcı hesabı ele geçirilir.

Google OAuth `state` parametresi yoksa → CSRF saldırısıyla saldırgan kurbanın hesabına kendi Google hesabını bağlayabilir.

Şifre değişikliğinde tüm session'lar temizlenmiyorsa → saldırgan ele geçirdiği refresh token'ı şifre değişikliğinden sonra da kullanabilir.

Bu dördü önce, geri kalanı sonra.
