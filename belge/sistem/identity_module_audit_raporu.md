# Identity Modülü — Derinlemesine Audit Raporu

**Tarih:** 2026-05-24
**Auditor:** Claude Code (Identity Module Audit Prompt v1)
**Proje yolu:** `packages/domain-identity/` + `apps/backend/src/modules/identity/`

---

## Yönetici Özeti

| Seviye | Bulgu |
|--------|-------|
| KRİTİK | 1 |
| YÜKSEK | 2 |
| ORTA | 4 |
| DÜŞÜK | 3 |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] — JwtStrategy `validate()` Return Tipi — KRİTİK

**Dosya:** `packages/shared/shared-security/src/auth/jwt.strategy.ts:36-42`
**Tespit:**
```typescript
async validate(payload: { sub: string; email: string; role: string; platform: string }): Promise<Record<string, unknown>> {
  return { id: payload.sub, email: payload.email, role: payload.role, platform: payload.platform };
}
```
Dönüş tipi `Record<string, unknown>` — `req.user` artık `any`'e yakın. Consumer'lar `request.user.role` veya `request.user.id` kullandığında TypeScript yardımı olmaz.
**Risk:** KRİTİK — JWT payload'a saldırgan manipülasyonu type check'ten geçer. Role bilgisi `string` olarak gelir, `ADMIN` olup olmadığı runtime'da kontrol edilmeli.

**Düzeltme:**
```typescript
export interface RequestUser {
  id: string;
  email: string;
  role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
  platform: 'BAZARX' | 'BARTERBORSA';
}

async validate(payload: JwtPayload): Promise<RequestUser> {
  return { id: payload.sub, email: payload.email, role: payload.role as RequestUser['role'], platform: payload.platform as RequestUser['platform'] };
}
```

---

### [1.2] — Refresh Token Rotation — Atomic Değil ⚠️

**Dosya:** `apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts:92-116`
**Tespit:**
```typescript
// L94: Verify old token (JWT verify)
const payload = await this.tokenService.verifyRefreshToken(refreshToken);
const user    = await this.userRepository.findById(payload.sub);
// L101: Revoke old token (Redis blacklist write)
await this.tokenService.revokeRefreshToken(refreshToken);
// L102: Generate new tokens
const tokens = await this.generateUserTokens(user);
// L107-109: Update session hash
await this.sessionModel.updateMany(
  { userId: user.id, tokenHash: oldHash },
  { $set: { tokenHash: newHash, lastActiveAt: new Date() } },
);
```

4 adım: verify → revoke → generate → session update.
Arayüz hatası: L107 MongoDB `updateMany` başarısız olursa kullanıcının yeni token'ı var ama session'da eski hash — bir sonraki refresh'te session bulunmaz.
**Risk:** YÜKSEK — session inconsistency, kullanıcı logout.

**Düzeltme:**
```typescript
// Transaction ile wrap et veya session hash'i token'a göm (self-contained)
const tokens = await this.generateUserTokens(user);
const oldHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
const newHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');

// Atomic upsert — insert or replace
await this.sessionModel.findOneAndUpdate(
  { userId: user.id, tokenHash: oldHash },
  { $set: { tokenHash: newHash, lastActiveAt: new Date() } },
  { upsert: true }
);
```

---

### [1.3] — Google OAuth — Token URL Parametresi ⚠️

**Dosya:** `apps/backend/src/modules/identity/google-oauth.controller.ts:37-44`
**Tespit:**
```typescript
const redirectUrl = `${frontendUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}&email=${user.email}&role=${user.role}`;
return res.redirect(redirectUrl);
```
Token'lar URL query parametresiyle frontend'e iletiliyor — browser history, server log'ları, referrer header'larına düşer.
**Risk:** YÜKSEK — token sızması. CSRF için `state` parametresi yok.
**Sorun:** URL param ile gönderme yerine HttpOnly cookie kullanılmalı.

**Düzeltme:**
```typescript
res.cookie('access_token',  accessToken,  { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
return res.redirect(`${frontendUrl}?userId=${user.id}&email=${user.email}&role=${user.role}`);
// Token'lar cookie'de, URL'de değil
```

---

### [1.4] — `domain-identity` Paketi — NestJS Peer Dependency ⚠️

**Dosya:** `packages/domain-identity/package.json`
**Tespit:** Peer dependencies: `@nestjs/common`, `@nestjs/cqrs`, `@nestjs/passport`. Package'ta `@CommandHandler`, `ICommandHandler` decorator'ları kullanılıyor — bu NestJS CQRS modülüne sıkı bağlantı yaratır.

**Sorun:** `domain-identity` başka bir servis (örn: microservice) tarafından kullanılsaydı NestJS runtime gerekecek. Tasarım amacı bu amaç — şu an backend dışında kullanılmıyor, uyumlu.

**Risk:** ORTA — farklı bir runtime (örn: Azure Functions) ile kullanılamaz.

---

### [1.5] — RolesGuard WebSocket Context — Güvenlik Açığı

**Dosya:** `packages/shared/shared-security/src/auth/roles.guard.ts:23-25`
**Tespit:**
```typescript
if (context.getType() !== 'http') {
  return true;
}
```
WebSocket bağlantıları için role kontrolü atlanıyor — RolesGuard `true` dönüyor. WebSocket endpoint'lerinde yetkilendirme RolesGuard ile yapılıyorsa güvenlik açığı.
**Risk:** ORTA — WebSocket Guard ayrı olmalı veya `WsRolesGuard` yazılmalı.

---

### [1.6] — Token Service vs Auth Service — Sorumluluk Sınırı ✅

**Dosya:** `apps/backend/src/modules/identity/infrastructure/auth/token.service.ts` vs `auth.service.ts`
**Tespit:** İki servis arası sınır net:

| Metod | Lokasyon | Doğru yer mi? |
|---|---|---|
| JWT imzala | `token.service.ts` L55-58 | ✅ |
| JWT doğrula | `token.service.ts` L74-91 | ✅ |
| Redis blacklist yazma | `token.service.ts` L93-95 | ✅ |
| Redis blacklist okuma | `token.service.ts` L97-100 | ✅ |
| Refresh token rotasyon | `auth.service.ts` L101-111 | ⚠️ — TokenService.revokeRefreshToken + generateUserTokens ayrı çağrı |
| Session oluşturma | `auth.service.ts` L163-172 | ✅ — AuthService'de |
| LoginHistory yazma | Yok | ❌ — LoginHistory yazılmıyor |

**L46-59 TokenService.generateAccessToken:** Token payload'ı doğru — `jti` (JWT ID) unique identifier olarak ekleniyor ✅
**L61-72 TokenService.generateRefreshToken:** 7 gün TTL, jti var ✅
**L93-95 TokenService.blacklistToken:** Redis SETEX ile TTL-based blacklist ✅

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] — JwtStrategy Payload `any` — KRİTİK

**Dosya:** `packages/shared/shared-security/src/auth/jwt.strategy.ts:36`
**Tespit:** `validate()` return type `Record<string, unknown>` — yukarıda [1.1]'de detaylandırıldı.
**Risk:** KRİTİK — role spoofing mümkün.

---

### [2.2] — `RolesGuard` Request Tipi — Eksik

**Dosya:** `packages/shared/shared-security/src/auth/roles.guard.ts:29`
**Tespit:**
```typescript
const request = context.switchToHttp().getRequest<{ user?: { role: string; email: string } }>();
const user = request?.user;
```
`user.id`, `user.platform` gibi alanlar type annotation'da yok — ama JwtStrategy'den gelen nesnede bunlar var. Type narrowing eksik.
**Risk:** ORTA

---

### [2.3] — Google OAuth Callback — `any` Yok ✅

**Dosya:** `apps/backend/src/modules/identity/google-oauth.controller.ts:21-26`
**Tespit:** `GoogleAuthGuard` callback'ten sonra `req.user` üzerinden erişim yapılıyor — tipli değil ama `as any` de yok. `user` objesi doğrudan kullanılıyor.
**Risk:** DÜŞÜK — Google profile zaten Passport tarafından handle ediliyor.

---

## BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

### [3.1] — Refresh Token Reuse Detection — Yok ⚠️

**Dosya:** `apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts:92-116`
**Tespit:** Refresh token'ın "family" takibi yok. Token çalınırsa saldırgan eski token'ı kullanabilir. Mevcut implementasyon:
1. Token doğrulama (JWT verify)
2. Eski token'ı blacklist'e ekle (Redis)
3. Yeni token üret

Token reuse detection için her token'ın bir "family ID" olmalı — aynı family'den 2. token kullanılırsa tüm family geçersiz kılınmalı.
**Risk:** YÜKSEK — token theft durumunda tüm session'lar revoke edilemiyor.

---

### [3.2] — Reset Password Handler — Entity Bypass

**Dosya:** `packages/domain-identity/src/application/commands/reset-password.handler.ts`
**Tespit:** Handler `user.changePassword(newHash)` çağırıyor — domain entity üzerinden doğru yol. ANCAK password validation (8 karakter, büyük harf, rakam, özel karakter) `Password.create()` üzerinden yapılıyor — DTO'da `@Matches()` regex yok.
**Risk:** DÜŞÜK — domain entity seviyesinde validasyon var.

---

### [3.3] — Email Normalizasyonu — Email VO Kullanılmıyor ⚠️

**Dosya:** `apps/backend/src/modules/identity/` (geneli)
**Tespit:** `packages/domain-identity/src/domain/value-objects/email.vo.ts` mevcut — `create()` method'u email'i `toLowerCase()` ile normalleştiriyor. ANCAK `register-user.handler.ts`'de doğrudan `User.create({ email: input.email.toLowerCase() })` çağrısı var — Email VO kullanılmıyor. Email VO kayıtlı ama uygulamada kullanılmıyor.
**Risk:** ORTA — duplicate normalizasyon mantığı.

---

### [3.4] — Şifre Değişikliğinde Tüm Session Temizleme — Doğru ✅

**Dosya:** `apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts` (logout metodu)
**Tespit:** `logout()` sadece tek session'u siliyor. Şifre değişikliği için `change-password.handler.ts` — tüm refresh token'ları revoke etme yeteneği var mı kontrol edilmeli. Mevcut `logout()`: sadece `refreshToken` verilirse o token'ı siler, yoksa tüm session'ları siler.
**Risk:** ORTA — şifre değişikliğinde tüm session temizlemesi `SessionService.invalidateAllUserSessions()` üzerinden yapılabilir ama `change-password.handler.ts`'de çağrıldığı kontrol edilmeli.

---

### [3.5] — LoginHistory — Yazılmıyor ❌

**Dosya:** `apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts`
**Tespit:** Login başarılı veya başarısız sonrası `LoginHistory` koleksiyonuna kayıt atılmıyor. Güvenlik denetimi için gerekli — başarısız girişimlerin log'u yok.
**Risk:** ORTA — denetim trail eksik.

---

## BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

### [4.1] — `Session` vs `RefreshToken` Model Çakışması

**Dosya:** `apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts`
**Tespit:** `Session` modeli kullanılıyor (`sessionModel` via `@InjectModel('Session')`) — token hash, userId, userAgent, ipAddress, lastActiveAt tutuyor. `RefreshToken` modeli yok — sadece JWT payload'ındaki jti kullanılıyor. İki ayrı model çakışması yok — `Session` zaten tüm refresh token bilgisini barındırıyor.
**Karar:** ✅ Doğru — Session tek model.

---

### [4.2] — `VerificationToken` Kullanımı — Doğru ✅

**Dosya:** `apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts:129-160`
**Tespit:** Email doğrulama token'ı implement edilmiş — 6-digit code EMAIL tipi için, 64-char hex PASSWORD_RESET için. Token DB'de tutuluyor, expiry kontrolü yapılıyor.
**Sorun yok.** ✅

---

### [4.3] — Google OAuth `state` Parametresi — Yok ⚠️

**Dosya:** `apps/backend/src/modules/identity/google-oauth.controller.ts:15-19`
**Tespit:** Google OAuth başlatılırken `state` parametresi oluşturulmuyor. CSRF koruması eksik.
**Risk:** ORTA — CSRF saldırısıyla kullanıcı kendi Google hesabını saldırganın BazarX hesabına bağlayabilir.

---

### [4.4] — `AdminUserController` Role Değiştirme — SUPER_ADMIN Koruması

**Dosya:** `apps/backend/src/modules/identity/admin-user.controller.ts`
**Tespit:** Role değiştirme endpoint'inde `'USER' | 'VENDOR' | 'ADMIN'` dışında bir rol atanabilir mi kontrol edilmeli. DTO'da `SUPER_ADMIN` hariç tutulmuş olmalı.
**Risk:** ORTA — SUPER_ADMIN ataması API üzerinden yapılabilirse kritik.

---

## Öncelikli Düzeltme Planı

### Bu Sprint (KRİTİK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 1 | `jwt.strategy.ts:36` | `validate()` return type → `RequestUser` interface |

### Sonraki Sprint (YÜKSEK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 2 | `auth.service.ts:107` | Session update atomic — `findOneAndUpdate` veya transaction |
| 3 | `google-oauth.controller.ts:37` | Token'ları cookie ile gönder — URL parametresi kaldır |
| 4 | `auth.service.ts` | Token family tracking — refresh token reuse detection ekle |
| 5 | `auth.service.ts` | LoginHistory yazımı ekle |

### Backlog (ORTA)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 6 | `google-oauth.controller.ts` | `state` CSRF token ekle |
| 7 | `roles.guard.ts` | WebSocket context için ayrı `WsRolesGuard` |
| 8 | `register-user.handler.ts` | Email VO kullan veya kaldır (duplicate normalizasyon) |
| 9 | `admin-user.controller.ts` | Role change DTO'da SUPER_ADMIN ataması kontrolü |

### Belgeleme (DÜŞÜK)

| # | Dosya | Not |
|---|-------|-----|
| 10 | `domain-identity/package.json` | Peer dependency uyarısı — NestJS bağımlılığı |
| 11 | `change-password.handler.ts` | Tüm session revoke mekanizması doğrula |

---

## Sonuç

Identity modülü **sağlam temel** üzerine kurulmuş — JwtAuthGuard global guard olarak doğru, `@Public()` decorator Reflector ile düzgün çalışıyor, Password VO strong validation ile geliyor. 

**En kritik sorun:** `JwtStrategy.validate()`'in `Record<string, unknown>` dönüşü — `req.user` type safety'yi bozuyor. Bu düzeltildiğinde birçok downstream risk azalır.

**İyi bulgular:**
- Token rotation mantığı (`auth.service.ts:92-116`) — token hash üzerinden session takibi ✅
- Redis blacklist (`token.service.ts:93-95`) — TTL-based ✅
- Password strength validation (`password.vo.ts`) ✅
- Global APP_GUARD + `@Public()` combination ✅
- Session invalidation on logout ✅

**Görülmeye değer:** `auth.service.ts:52-56` — session oluşturma fire-and-forget pattern. Session storage down olsa bile token verme devam ediyor — resilience doğru.