// e2e/global.setup.ts
import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const authDir = path.join(__dirname, '.auth')

setup.beforeAll(() => {
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })
})

// Kullanıcı login
setup('authenticate as user', async ({ page }) => {
  // Debug logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))

  // CSRF mock
  await page.route('**/api/v1/auth/csrf', async (route) => {
    await route.fulfill({
      json: { csrfToken: 'mock-csrf-token' }
    })
  })

  // Login API mock
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          accessToken: 'mock-user-token',
          user: { id: 'user-001', email: 'testuser@bazarx.com.tr', role: 'USER' }
        }
      }
    })
  })

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: { id: 'user-001', email: 'testuser@bazarx.com.tr', role: 'USER', profile: { firstName: 'Test', lastName: 'User' } }
      }
    })
  })

  await page.goto('/auth/login')

  await page.goto('/auth/login')

  // Direct ID selectors are more robust than labels in different languages
  await page.locator('input#email').fill(process.env.TEST_USER_EMAIL || 'testuser@bazarx.com.tr')
  await page.locator('input#password').fill(process.env.TEST_USER_PASSWORD || 'Test123!')
  
  // Koşulları kabul et
  await page.locator('#acceptTerms').check()

  await page.getByRole('button', { name: /giriş/i }).click()

  // Redirect bekliyoruz
  await expect(page).not.toHaveURL(/login/, { timeout: 20_000 })

  await page.context().storageState({ path: path.join(authDir, 'user.json') })
})

// Admin login
setup('authenticate as admin', async ({ page }) => {
  await page.route('**/api/v1/auth/csrf', async (route) => {
    await route.fulfill({
      json: { csrfToken: 'mock-csrf-token' }
    })
  })

  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          accessToken: 'mock-admin-token',
          user: { id: 'admin-001', email: 'admin@bazarx.com.tr', role: 'ADMIN' }
        }
      }
    })
  })

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: { id: 'admin-001', email: 'admin@bazarx.com.tr', role: 'ADMIN', profile: { firstName: 'Admin', lastName: 'User' } }
      }
    })
  })

  await page.goto('/auth/login')

  await page.locator('input#email').fill(process.env.TEST_ADMIN_EMAIL || 'admin@bazarx.com.tr')
  await page.locator('input#password').fill(process.env.TEST_ADMIN_PASSWORD || 'Admin123!')
  
  await page.locator('#acceptTerms').check()

  await page.getByRole('button', { name: /giriş/i }).click()

  await expect(page).not.toHaveURL(/login/, { timeout: 20_000 })

  await page.context().storageState({ path: path.join(authDir, 'admin.json') })
})

// Vendor login
setup('authenticate as vendor', async ({ page }) => {
  await page.route('**/api/v1/auth/csrf', async (route) => {
    await route.fulfill({
      json: { csrfToken: 'mock-csrf-token' }
    })
  })

  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          accessToken: 'mock-vendor-token',
          user: { id: 'vendor-001', email: 'vendor@bazarx.com.tr', role: 'VENDOR' }
        }
      }
    })
  })

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: { id: 'vendor-001', email: 'vendor@bazarx.com.tr', role: 'VENDOR', profile: { firstName: 'Vendor', lastName: 'User' } }
      }
    })
  })

  await page.goto('/auth/login')

  await page.locator('input#email').fill(process.env.TEST_VENDOR_EMAIL || 'vendor@bazarx.com.tr')
  await page.locator('input#password').fill(process.env.TEST_VENDOR_PASSWORD || 'Vendor123!')
  
  await page.locator('#acceptTerms').check()

  await page.getByRole('button', { name: /giriş/i }).click()

  await expect(page).not.toHaveURL(/login/, { timeout: 20_000 })

  await page.context().storageState({ path: path.join(authDir, 'vendor.json') })
})
