// apps/frontend/server/api/auth/csrf.get.ts
// Cookie tabanlı auth (httpOnly + sameSite=lax) CSRF'e karşı temel koruma sağlar.
// Ek çift-gönderim (double-submit) koruması için her istekte kriptografik token üretilir.
import { randomBytes } from 'crypto'

export default defineEventHandler((event) => {
  const token = randomBytes(32).toString('hex')

  // Token'ı HttpOnly olmayan cookie'ye yaz — frontend JS okuyabilir, double-submit pattern
  setCookie(event, 'csrf_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 saat
  })

  return { csrfToken: token }
})
