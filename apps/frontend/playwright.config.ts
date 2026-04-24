// apps/frontend/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // SSR-off SPA — sıralı çalıştır
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // API mock için backend URL
    extraHTTPHeaders: {
      'x-test-mode': 'true',
    },
  },

  projects: [
    // Setup: auth state'i kaydet
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    // Ana testler — setup'a bağımlı
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    // Admin testleri
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /admin\//,
    },
  ],

  // Nuxt dev server'ı başlat
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
