
FAZ 5 — Auth Akışı (Login, Register, Google OAuth, Forgot/Reset)

Hedef: Auth sayfalarının backend ile uçtan uca çalışması.

# GÖREV: Auth Akışı — Backend Entegrasyon Tamamlama

## Backend Auth Endpoint'leri (gerçek)

POST /api/v1/auth/login        → { success, data: { user, accessToken, refreshToken } }
POST /api/v1/auth/register     → { success, data: { user, ... } }
POST /api/v1/auth/logout       → { success, message }
POST /api/v1/auth/refresh      → { success, data: { accessToken, refreshToken } }
POST /api/v1/auth/forgot-password → { success, message }
POST /api/v1/auth/reset-password  → { success, message }
GET  /api/v1/users/me          → (via BFF rewrite from /api/auth/me)
GET  /api/v1/auth/google       → Google OAuth başlatır
GET  /api/v1/auth/google/callback → callback, frontend'e redirect eder

## YAPILACAKLAR

### 1. pages/login.vue — Backend response uyumu
Backend login response'u şu yapıda:
```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "data": {
    "user": { "id": "...", "email": "...", ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

`stores/auth.ts` `login()` action'ı bu response'u doğru parse etmeli:
- `data.accessToken` → `this.token`
- `data.user` → `this.user`
- Token cookie'ye yaz (15 dk maxAge)

### 2. pages/register.vue — Validation + submit
Backend register DTO:
```typescript
{ email: string, password: string, firstName?: string, lastName?: string }
```
VeeValidate ile form validasyonu: email format, password min 8, confirmed password.

### 3. pages/auth/callback.vue — Google OAuth handler
Google callback URL: `GET /api/v1/auth/google/callback`
Backend bu URL'den `/auth/success?accessToken=...&refreshToken=...&userId=...` şeklinde redirect yapar.

`pages/auth/callback.vue` veya `app.vue` `onMounted`:
- URL query'den `accessToken` oku
- `authStore.token = accessToken`
- Token cookie'ye yaz
- `authStore.fetchUser()` çağır
- `/` redirect

**NOT:** Mevcut `app.vue` zaten `?token` parametresini handle ediyor.
Google OAuth controller `?accessToken` kullanıyor. Bu mismatch'i düzelt:
`app.vue`'da hem `route.query.token` hem `route.query.accessToken` kontrol et.

### 4. pages/forgot-password.vue + pages/reset-password.vue
- Form validasyonu var mı? Email field `required|email` kuralları
- Backend'e doğru endpoint çağırılıyor mu?
- Başarı/hata toast mesajları var mı?

### 5. services/api/AuthService.ts — Response mapping
`getMe()` şu an `/api/auth/me` çağırıyor → BFF `/api/v1/users/me`'ye rewrite eder.
Backend `users/me` response:
```json
{ "success": true, "data": { "id": "...", "email": "...", "profile": {...}, ... } }
```
`AuthApiResponse<UserDTO>` interface'i bu yapıya uygun mu? Kontrol et.

## Doğrulama
1. `curl -X POST http://localhost:3002/api/auth/login -d '{"email":"test@test.com","password":"Pass123!"}' -H "Content-Type: application/json"`
2. `curl http://localhost:3002/api/auth/csrf` → `{"csrfToken":"..."}` (mock)
3. Login sonrası `/profile` sayfasına gidilebiliyor mu?

## Kısıtlamalar
- `any` yasak
- Backend response shape değiştirilemez
- Mevcut UI değiştirilmez