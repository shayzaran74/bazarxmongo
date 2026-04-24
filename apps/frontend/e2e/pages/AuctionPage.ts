// e2e/pages/AuctionPage.ts
import { type Page, type Locator, expect } from '@playwright/test'

export class AuctionPage {
  readonly page: Page

  // Liste
  readonly auctionCards: Locator
  readonly filterActive: Locator
  readonly searchInput: Locator

  // Detay
  readonly auctionTitle: Locator
  readonly currentPrice: Locator
  readonly countdown: Locator
  readonly participateButton: Locator
  readonly bidAmountInput: Locator
  readonly placeBidButton: Locator
  readonly bidHistory: Locator
  readonly highestBidderBadge: Locator
  readonly claimButton: Locator

  constructor(page: Page) {
    this.page = page

    this.auctionCards = page.locator('[data-testid="auction-card"]')
    this.filterActive = page.getByRole('button', { name: /aktif/i })
    this.searchInput = page.getByPlaceholder(/artırma ara/i)

    this.auctionTitle = page.locator('[data-testid="auction-title"]')
    this.currentPrice = page.locator('[data-testid="current-price"]')
    this.countdown = page.locator('[data-testid="countdown"]')
    this.participateButton = page.getByRole('button', { name: /katıl|depozito/i })
    this.bidAmountInput = page.locator('[data-testid="bid-amount"]')
    this.placeBidButton = page.getByRole('button', { name: /teklif ver/i })
    this.bidHistory = page.locator('[data-testid="bid-history"]')
    this.highestBidderBadge = page.locator('[data-testid="highest-bidder"]')
    this.claimButton = page.getByRole('button', { name: /ödeme yap|kazanımı onayla/i })
  }

  async gotoList() {
    await this.page.goto('/auctions')
    await this.page.waitForLoadState('networkidle')
  }

  async gotoAuction(id: string) {
    await this.page.goto(`/auctions/${id}`)
    await this.page.waitForLoadState('networkidle')
  }

  async participate() {
    await this.participateButton.click()
    await expect(
      this.page.getByText(/katıldınız|depozito/i)
    ).toBeVisible({ timeout: 8_000 })
  }

  async placeBid(amount: number) {
    await this.bidAmountInput.fill(String(amount))
    await this.placeBidButton.click()
  }

  async waitForBidConfirmation() {
    await expect(
      this.page.getByText(/teklif.*kaydedildi|teklifiniz alındı/i)
    ).toBeVisible({ timeout: 8_000 })
  }

  async waitForHighestBidder() {
    await expect(this.highestBidderBadge).toBeVisible({ timeout: 5_000 })
  }

  async getBidHistoryCount() {
    return this.bidHistory.locator('[data-testid="bid-row"]').count()
  }
}
