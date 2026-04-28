// apps/frontend/e2e/global.setup.ts
// Playwright'ın auth dependency'si için gerekli.
// Kullanıcı ve admin auth state'lerini .auth/ klasörüne kaydeder.
// Testler bu state'i yükleyerek her testte login yapmak zorunda kalmaz.

import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const AUTH_DIR = path.join(__dirname, '.auth')

// Auth dizinini oluştur
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true })
}

const USER_AUTH_FILE  = path.join(AUTH_DIR, 'user.json')
const ADMIN_AUTH_FILE = path.join(AUTH_DIR, 'admin.json')

// ─── Kullanıcı auth ──────────────────────────────────────────────────
setup('authenticate as user', async ({ page, request }) => {
  // API üzerinden login — UI yerine direkt API daha hızlı
  const loginRes = await request.post('/api/auth/login', {
    data: {
      email: process.env.TEST_USER_EMAIL || 'test@bazarx.com',
      password: process.env.TEST_USER_PASSWORD || 'Test1234!',
    },
  })

  if (loginRes.ok()) {
    const { data } = await loginRes.json()
    // Token'ı localStorage'a set et
    await page.goto('/')
    await page.evaluate((token: string) => {
      localStorage.setItem('access_token', token)
    }, data.accessToken)
    await page.context().storageState({ path: USER_AUTH_FILE })
  } else {
    // Login başarısız — boş state kaydet (testler skip edilir)
    console.warn('[setup] User login failed — writing empty auth state')
    fs.writeFileSync(USER_AUTH_FILE, JSON.stringify({
      cookies: [],
      origins: [{
        origin: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
        localStorage: [],
      }],
    }))
  }
})

// ─── Admin auth ──────────────────────────────────────────────────────
setup('authenticate as admin', async ({ page, request }) => {
  const loginRes = await request.post('/api/auth/login', {
    data: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@bazarx.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234!',
    },
  })

  if (loginRes.ok()) {
    const { data } = await loginRes.json()
    await page.goto('/')
    await page.evaluate((token: string) => {
      localStorage.setItem('access_token', token)
    }, data.accessToken)
    await page.context().storageState({ path: ADMIN_AUTH_FILE })
  } else {
    console.warn('[setup] Admin login failed — writing empty auth state')
    fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify({
      cookies: [],
      origins: [{
        origin: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
        localStorage: [],
      }],
    }))
  }
})
