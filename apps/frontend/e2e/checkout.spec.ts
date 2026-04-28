// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'
import { CheckoutPage } from './pages/CheckoutPage'
import {
  mockCart,
  mockAddresses,
  mockWallet,
  mockCheckoutResult,
} from './fixtures/api.fixtures'

test.describe('Checkout Flow', () => {
  let checkoutPage: CheckoutPage

  test.beforeEach(async ({ page }) => {
    checkoutPage = new CheckoutPage(page)

    // Global catch-all FIRST
    await page.route('**/api/**', async (route) => {
      await route.fulfill({ json: { success: true, data: {} } })
    })

    // Auth mock
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ json: { success: true, data: { id: 'user-001', role: 'USER' } } })
    })

    // Cart mock
    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: mockCart })
      } else {
        await route.continue()
      }
    })

    // Addresses mock
    await page.route('**/api/addresses', async (route) => {
      await route.fulfill({ json: mockAddresses })
    })

    // Wallet mock
    await page.route('**/api/wallet', async (route) => {
      await route.fulfill({ json: mockWallet })
    })

    // Checkout result mock
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({ json: mockCheckoutResult })
    })

    // Coupons mock
    await page.route('**/api/coupons/validate', async (route) => {
      await route.fulfill({ json: { success: true, data: { code: 'TEST10', discountAmount: 25 } } })
    })
  })

  test('sepet sayfası ürünleri yükler', async ({ page }) => {
    await checkoutPage.gotoCart()

    // Sepet yüklenmiş olmalı
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({ timeout: 10_000 })
    
    const productName = page.locator('[data-testid="cart-product-name"]')
    await expect(productName).toContainText(/laptop/i)
    await expect(page.getByTestId('product-price').first()).toContainText(/250/)
  })

  test('boş sepette ödemeye geç butonu görünmez', async ({ page }) => {
    // Boş sepet mock'u
    await page.route('**/api/cart', async (route) => {
      await route.fulfill({
        json: { success: true, data: { items: [] } }
      })
    })

    await checkoutPage.gotoCart()
    await expect(
      page.getByRole('button', { name: /ödemeye geç/i })
    ).not.toBeVisible()
    await expect(page.getByText(/sepetiniz boş/i)).toBeVisible()
  })

  test('checkout sayfasında adres ve ödeme seçimi görünür', async ({ page }) => {
    await checkoutPage.gotoCheckout()

    // Adres listesi yüklenmiş olmalı
    await expect(page.locator('[data-testid="address-title"]').getByText('Ev', { exact: true })).toBeVisible()
    await expect(page.getByText(/kadıköy/i).first()).toBeVisible()

    // Ödeme seçenekleri mevcut olmalı
    await expect(page.getByText(/cüzdan/i)).toBeVisible()
  })

  test('wallet bakiyesi checkout\'ta gösterilir', async ({ page }) => {
    await checkoutPage.gotoCheckout()

    // Wallet bakiyesi 5000 TL gösterilmeli
    await expect(page.getByTestId('wallet-balance')).toContainText(/5\.000|5,000/)
  })

  test('başarılı checkout → payment-success sayfasına yönlendirir', async ({ page }) => {
    await checkoutPage.gotoCheckout()

    // Adres seç
    await checkoutPage.selectAddress(0)

    // Wallet ile öde
    await checkoutPage.selectWalletPayment()

    // Sözleşmeyi onayla
    await checkoutPage.acceptTerms()

    // Siparişi tamamla
    await checkoutPage.placeOrder()

    // Başarı sayfasına yönlenmeli
    await expect(page).toHaveURL(/payment-success/, { timeout: 10_000 })
  })

  test('kupon kodu uygulanır ve indirim görünür', async ({ page }) => {
    // Kupon API mock'u
    await page.route('**/api/coupons/validate', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            code: 'TEST10',
            discountAmount: 25,
            discountType: 'FIXED',
          },
        }
      })
    })

    await checkoutPage.gotoCheckout()
    await checkoutPage.applyCoupon('TEST10')

    // İndirim tutarı görünmeli
    await expect(page.getByText(/25.*TL|indirim/i)).toBeVisible({ timeout: 5_000 })
  })

  test('geçersiz kupon kodu hata gösterir', async ({ page }) => {
    await page.route('**/api/coupons/validate', async (route) => {
      await route.fulfill({
        status: 400,
        json: { success: false, message: 'Kupon geçersiz veya süresi dolmuş' }
      })
    })

    await checkoutPage.gotoCheckout()
    await checkoutPage.applyCoupon('GECERSIZ')

    // Hata mesajı görünmeli (form error veya toast)
    await expect(page.getByTestId('form-error').getByText(/geçersiz|süresi dolmuş/i)).toBeVisible({ timeout: 5_000 })
  })

  test('adres seçilmeden siparişi tamamla butonu devre dışı veya hata verir', async ({ page }) => {
    // Adresi boş döndür
    await page.route('**/api/identity/addresses', async (route) => {
      await route.fulfill({ json: { success: true, data: [] } })
    })

    await checkoutPage.gotoCheckout()
    
    // Siparişi tamamla butonu devre dışı olmalı (adres seçilmediği için)
    await expect(page.getByTestId('place-order-button')).toBeDisabled()

    // Veya adres seç uyarısı görünmeli
    await expect(
      page.getByText(/adres seç|teslimat adresi/i)
    ).toBeVisible({ timeout: 5_000 })
  })
})
