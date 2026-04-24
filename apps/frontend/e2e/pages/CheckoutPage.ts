// e2e/pages/CheckoutPage.ts
import { type Page, type Locator, expect } from '@playwright/test'

export class CheckoutPage {
  readonly page: Page

  // Cart
  readonly cartItems: Locator
  readonly checkoutButton: Locator

  // Checkout
  readonly addressSection: Locator
  readonly paymentSection: Locator
  readonly walletOption: Locator
  readonly iyzicoOption: Locator
  readonly placeOrderButton: Locator
  readonly orderSummary: Locator
  readonly couponInput: Locator
  readonly applyCouponButton: Locator

  constructor(page: Page) {
    this.page = page

    this.cartItems = page.locator('[data-testid="cart-item"]')
    this.checkoutButton = page.getByRole('button', { name: /ödemeye geç|checkout/i })

    this.addressSection = page.locator('[data-testid="checkout-address"]')
    this.paymentSection = page.locator('[data-testid="checkout-payment"]')
    this.walletOption = page.locator('[data-testid="payment-wallet"]')
    this.iyzicoOption = page.locator('[data-testid="payment-iyzico"]')
    this.placeOrderButton = page.locator('[data-testid="place-order-button"]')
    this.orderSummary = page.locator('[data-testid="order-summary"]')
    this.couponInput = page.getByPlaceholder(/kupon kodu/i)
    this.applyCouponButton = page.getByRole('button', { name: /uygula/i })
  }

  async acceptTerms() {
    await this.page.locator('#accept-terms').check()
  }

  async gotoCart() {
    await this.page.goto('/cart')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoCheckout() {
    await this.page.goto('/checkout')
    await this.page.waitForLoadState('networkidle')
  }

  async addProductToCart(slug: string) {
    await this.page.goto(`/products/${slug}`)
    await this.page.waitForLoadState('networkidle')
    const addToCartBtn = this.page.getByRole('button', { name: /sepete ekle/i })
    await addToCartBtn.click()
    await expect(this.page.getByText(/sepete eklendi/i)).toBeVisible({ timeout: 5_000 })
  }

  async selectAddress(index = 0) {
    const addresses = this.page.locator('[data-testid="address-card"]')
    await addresses.nth(index).click()
  }

  async selectWalletPayment() {
    await this.walletOption.click()
  }

  async selectIyzicoPayment() {
    await this.iyzicoOption.click()
  }

  async applyCoupon(code: string) {
    await this.couponInput.fill(code)
    await this.applyCouponButton.click()
  }

  async placeOrder() {
    await this.placeOrderButton.click()
  }

  async waitForOrderConfirmation() {
    await expect(this.page).toHaveURL(/payment-success|orders\/[a-z0-9-]+/, { timeout: 15_000 })
  }
}
