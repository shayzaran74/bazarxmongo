// e2e/vendor-registration.spec.ts
import { test, expect } from '@playwright/test'
import { VendorRegistrationPage } from './pages/VendorRegistrationPage'
import { mockVendorApply } from './fixtures/api.fixtures'

// Bu testler normal kullanıcı auth state'i ile çalışır
test.describe('Vendor Registration Flow', () => {
  let vendorPage: VendorRegistrationPage

  test.beforeEach(async ({ page }) => {
    vendorPage = new VendorRegistrationPage(page)

    // Vendor apply endpoint mock'u
    await page.route('**/api/vendors/apply-atomic', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ json: mockVendorApply })
      } else {
        await route.continue()
      }
    })

    // Zaten vendor değil
    await page.route('**/api/vendors/profile/me', async (route) => {
      await route.fulfill({
        status: 404,
        json: { success: false, message: 'Vendor bulunamadı' }
      })
    })

    // Kategoriler
    await page.route('**/api/listings/categories', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: [
            { id: 'cat-001', name: 'Elektronik', slug: 'elektronik' },
            { id: 'cat-002', name: 'Giyim', slug: 'giyim' },
            { id: 'cat-003', name: 'Ev & Yaşam', slug: 'ev-yasam' },
          ],
        }
      })
    })
  })

  test('become-vendor sayfası yüklenir ve stepper görünür', async ({ page }) => {
    await vendorPage.goto()

    // Başvuru formunun yüklendiğini doğrula
    await expect(page.getByText(/satıcı paneline katılın/i)).toBeVisible()
  })

  test('3 adımlı form başarıyla tamamlanır', async ({ page }) => {
    await vendorPage.goto()

    // Step 1: İşletme bilgileri
    console.log('Filling Step 1...')
    await vendorPage.fillStep1({
      businessName: 'Test Firma A.Ş.',
      businessType: 'COMPANY',
      taxId: '1234567890',
    })

    // Step 2'ye geçildi
    console.log('Checking for Step 2...')
    await expect(vendorPage.phoneInput).toBeVisible({ timeout: 10_000 })

    // Step 2: İletişim & Adres
    console.log('Filling Step 2...')
    await vendorPage.fillStep2({
      phone: '5551234567',
      city: 'İstanbul',
      address: 'Test Mahallesi, Test Sokak No:1',
    })

    // Step 3'ye geçildi
    console.log('Checking for Step 3...')
    await expect(vendorPage.ibanInput).toBeVisible({ timeout: 10_000 })

    // Step 3: Banka & Kategoriler
    console.log('Filling Step 3...')
    await vendorPage.fillStep3({
      iban: 'TR330006100519786457841326',
      bankName: 'Ziraat Bankası',
      categoryIndex: 0,
    })

    // Başarı mesajı
    console.log('Waiting for success...')
    await vendorPage.waitForSuccess()
    console.log('Registration complete!')
  })

  test('zorunlu alanlar boş bırakılınca ilerlemiyor', async ({ page }) => {
    await vendorPage.goto()

    // İşletme adı doldurmadan devam et
    await page.getByRole('button', { name: /devam|ileri/i }).click()

    // Hala step 1'de olmalı — hata mesajı görünmeli
    await expect(
      page.getByText(/zorunlu|gerekli|doldur/i)
    ).toBeVisible({ timeout: 5_000 })

    // Step 2 görünmemeli
    await expect(vendorPage.phoneInput).not.toBeVisible()
  })

  test('geçersiz vergi numarası hata verir', async ({ page }) => {
    await vendorPage.goto()

    await vendorPage.businessNameInput.fill('Test Firma')
    await vendorPage.taxIdInput.fill('123') // Çok kısa
    await page.getByRole('button', { name: /devam|ileri/i }).click()

    await expect(
      page.getByText(/geçersiz|hatalı|vergi/i)
    ).toBeVisible({ timeout: 5_000 })
  })

  test('zaten satıcı olan kullanıcı başvuru yerine durum sayfası görür', async ({ page }) => {
    // Mevcut vendor mock'u
    await page.route('**/api/vendors/profile/me', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: { id: 'v-001', status: 'PENDING' },
        }
      })
    })

    await vendorPage.goto()

    // Pending durum gösterilmeli
    await expect(
      page.getByText(/incelemede|beklemede|pending/i)
    ).toBeVisible({ timeout: 5_000 })
  })

  test('backend hatası kullanıcıya bildirilir', async ({ page }) => {
    await page.route('**/api/vendors/apply-atomic', async (route) => {
      await route.fulfill({
        status: 422,
        json: {
          success: false,
          message: 'Bu vergi numarası ile kayıtlı bir hesap mevcut',
        }
      })
    })

    await vendorPage.goto()

    await vendorPage.fillStep1({
      businessName: 'Hata Test A.Ş.',
      taxId: '9999999999',
    })
    await vendorPage.fillStep2({
      phone: '5559999999',
      city: 'Ankara',
      address: 'Hata Caddesi No:0',
    })
    await vendorPage.fillStep3({
      iban: 'TR330006100519786457841326',
      bankName: 'Test Bank',
    })

    await expect(
      page.getByText(/kayıtlı|mevcut|hata/i)
    ).toBeVisible({ timeout: 8_000 })
  })
})
