// e2e/pages/VendorRegistrationPage.ts
import { type Page, type Locator, expect } from '@playwright/test'

export class VendorRegistrationPage {
  readonly page: Page

  // Stepper
  readonly stepIndicators: Locator
  readonly nextButton: Locator
  readonly prevButton: Locator
  readonly submitButton: Locator

  // Step 1 — İşletme bilgileri
  readonly businessNameInput: Locator
  readonly businessTypeSelect: Locator
  readonly taxIdInput: Locator

  // Step 2 — İletişim & Adres
  readonly phoneInput: Locator
  readonly emailInput: Locator
  readonly cityInput: Locator
  readonly addressInput: Locator

  // Step 3 — Banka & Kategoriler
  readonly ibanInput: Locator
  readonly bankNameInput: Locator
  readonly categoryCheckboxes: Locator

  // Durum
  readonly successMessage: Locator
  readonly pendingBadge: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    this.stepIndicators = page.locator('[data-testid="step-indicator"]')
    this.nextButton = page.getByRole('button', { name: /devam|ileri/i })
    this.prevButton = page.getByRole('button', { name: /geri/i })
    this.submitButton = page.getByRole('button', { name: /başvur|gönder/i })

    this.businessNameInput = page.getByLabel(/işletme adı|firma adı/i)
    this.businessTypeSelect = page.getByLabel(/işletme tipi/i)
    this.taxIdInput = page.getByLabel(/vergi no|tc kimlik/i)

    this.phoneInput = page.getByLabel(/telefon/i)
    this.emailInput = page.getByLabel(/e-posta/i)
    this.cityInput = page.getByLabel(/şehir/i)
    this.addressInput = page.getByLabel(/adres/i)

    this.ibanInput = page.getByLabel(/iban/i)
    this.bankNameInput = page.getByLabel(/banka/i)
    this.categoryCheckboxes = page.locator('[data-testid="category-checkbox"]')

    this.successMessage = page.getByText(/başvurunuz alındı|inceleme/i)
    this.pendingBadge = page.locator('[data-testid="vendor-status-pending"]')
    this.errorMessage = page.locator('[data-testid="form-error"]')
  }

  async goto() {
    await this.page.goto('/become-vendor')
    await this.page.waitForLoadState('networkidle')
  }

  async fillStep1(data: {
    businessName: string
    businessType?: string
    taxId: string
  }) {
    // Eğer Giriş adımındaysak Devam Et'e bas
    const introText = this.page.getByText(/ayrıcalıkları|hoş geldiniz/i)
    if (await introText.isVisible()) {
      await this.nextButton.click()
    }

    await this.businessNameInput.fill(data.businessName)
    if (data.businessType) {
      await this.businessTypeSelect.selectOption(data.businessType)
    }
    await this.taxIdInput.fill(data.taxId)
    await this.nextButton.click()
  }

  async fillStep2(data: {
    phone: string
    city: string
    address: string
  }) {
    await this.phoneInput.fill(data.phone)
    await this.cityInput.fill(data.city)
    await this.addressInput.fill(data.address)
    await this.nextButton.click()
  }

  async fillStep3(data: {
    iban: string
    bankName: string
    categoryIndex?: number
  }) {
    await this.ibanInput.fill(data.iban)
    await this.bankNameInput.fill(data.bankName)
    const idx = data.categoryIndex ?? 0
    await this.categoryCheckboxes.nth(idx).check()
    await this.submitButton.click()
  }

  async waitForSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 10_000 })
  }
}
