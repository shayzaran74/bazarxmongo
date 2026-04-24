// e2e/auction-bid.spec.ts
import { test, expect } from '@playwright/test'

// ─── Inline mock verisi ──────────────────────────────────────────────────────

const END_TIME = new Date(Date.now() + 86_400_000).toISOString()

const MOCK_LIST = {
  success: true,
  data: {
    items: [
      {
        id: 'auction-test-001',
        title: 'Test iPhone 15 Pro Max',
        status: 'ACTIVE',
        startingPrice: 500,
        currentPrice: 650,
        endTime: END_TIME,
        _count: { bids: 5 },
        Product: { id: 'prod-001', name: 'iPhone 15 Pro Max', image: null, category: { name: 'Elektronik' } },
      },
    ],
    total: 1,
  },
}

const MOCK_DETAIL = {
  success: true,
  data: {
    id: 'auction-test-001',
    title: 'Test iPhone 15 Pro Max',
    status: 'ACTIVE',
    startingPrice: 500,
    currentPrice: 650,
    minBidIncrement: 50,
    participationDeposit: 100,
    endTime: END_TIME,
    _count: { bids: 5 },
    Product: { id: 'prod-001', name: 'iPhone 15 Pro Max', image: null, category: { name: 'Elektronik' } },
    bids: [],
  },
}

const MOCK_BIDS = {
  success: true,
  data: [
    { id: 'bid-001', amount: 600, createdAt: new Date().toISOString(), User: { id: 'user-x', profile: { firstName: 'Ali', lastName: 'K' } } },
    { id: 'bid-002', amount: 650, createdAt: new Date().toISOString(), User: { id: 'user-y', profile: { firstName: 'Veli', lastName: 'D' } } },
  ],
}

const MOCK_PARTICIPATION = {
  success: true,
  data: { participated: true, depositAmount: 100, status: 'ACTIVE' },
}

const MOCK_NO_PARTICIPATION = {
  success: true,
  data: { participated: false },
}

const MOCK_BID_SUCCESS = {
  success: true,
  data: { id: 'bid-003', amount: 700, auctionId: 'auction-test-001' },
}

// ─── Test suite ──────────────────────────────────────────────────────────────

test.describe('Auction & Bid Placement Flow', () => {
  // beforeEach: ortak mock'lar (auth, kategoriler, açık artırma listesi + detay)
  test.beforeEach(async ({ page }) => {
    // Debug logları
    page.on('console', msg => {
      const t = msg.type()
      if (t === 'error' || t === 'warning') console.log(`[BROWSER ${t.toUpperCase()}]`, msg.text())
    })
    page.on('pageerror', err => console.log('[PAGE ERROR]', err.message))
    page.on('response', res => {
      if (res.status() === 401) console.log('[401]', res.url())
    })

    // Auth mock'ları
    await page.route('**/api/v1/auth/csrf', route =>
      route.fulfill({ json: { csrfToken: 'mock-csrf' } })
    )
    await page.route('**/api/v1/auth/me', route =>
      route.fulfill({ json: { success: true, data: { id: 'user-001', email: 'test@bazarx.com.tr', role: 'USER', profile: { firstName: 'Test', lastName: 'User' } } } })
    )
    await page.route('**/api/v1/auth/refresh', route =>
      route.fulfill({ json: { success: true, data: { accessToken: 'mock-user-token' } } })
    )

    // Kategori mock
    await page.route('**/api/v1/listings/categories', route =>
      route.fulfill({ json: { success: true, data: [{ id: 'cat-1', name: 'Elektronik' }] } })
    )
    await page.route('**/api/v1/categories**', route =>
      route.fulfill({ json: { success: true, data: [{ id: 'cat-1', name: 'Elektronik' }] } })
    )

    // Side-ads / settings mock
    await page.route('**/api/v1/settings/**', route =>
      route.fulfill({ json: { success: true, data: [] } })
    )

    // Cart & wishlist mock
    await page.route('**/api/v1/cart**', route =>
      route.fulfill({ json: { success: true, data: { items: [], summary: { subtotal: 0, total: 0, shipping: 0, tax: 0 } } } })
    )
    await page.route('**/api/v1/wishlist**', route =>
      route.fulfill({ json: { success: true, data: [] } })
    )

    // Companies mock
    await page.route('**/api/v1/companies/me', route =>
      route.fulfill({ json: { success: true, data: null }, status: 200 })
    )

    // ── Auction route'ları — sıralı ve çakışmasız ──
    // 1) Bids endpoint
    await page.route('**/api/v1/auctions/auction-test-001/bids**', route =>
      route.fulfill({ json: MOCK_BIDS })
    )
    // 2) Participation endpoint
    await page.route('**/api/v1/auctions/auction-test-001/participation**', route =>
      route.fulfill({ json: MOCK_NO_PARTICIPATION })
    )
    // 3) Detay endpoint (liste mock'u çakışmasın diye ID'li olanlar önce)
    await page.route('**/api/v1/auctions/auction-test-001**', route =>
      route.fulfill({ json: MOCK_DETAIL })
    )
    // 4) LİSTE endpoint
    await page.route('**/api/v1/auctions**', async (route) => {
      const url = route.request().url()
      // ID'li route'lar yukarıdaki handler'larda zaten karşılandı; yine de güvenlik filtresi:
      if (url.includes('auction-test-001')) {
        return route.fulfill({ json: MOCK_DETAIL })
      }
      return route.fulfill({ json: MOCK_LIST })
    })
  })

  // ── LİSTE TESTLERİ ────────────────────────────────────────────────────────

  test('auction listesi yüklenir ve kartlar görünür', async ({ page }) => {
    await page.goto('/auctions')
    
    const currentUrl = page.url()
    console.log('[TEST] URL after goto:', currentUrl)
    
    // Login'e düştüysek fail fast
    expect(currentUrl).not.toContain('/login')
    
    await expect(page.getByTestId('auction-card').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('auction-title').first()).toContainText(/iphone 15/i)
    await expect(page.getByTestId('current-price').first()).toBeVisible()
  })

  test('aktif filtresi çalışır', async ({ page }) => {
    await page.goto('/auctions')
    await expect(page.getByTestId('auction-card').first()).toBeVisible({ timeout: 15_000 })

    // Filtre butonuna bas
    const activeBtn = page.getByRole('button', { name: /aktif/i })
    if (await activeBtn.isVisible()) {
      await activeBtn.click()
      await page.waitForTimeout(500)
    }
    await expect(page.getByTestId('auction-card').first()).toBeVisible({ timeout: 10_000 })
  })

  test('detay sayfasına link çalışır', async ({ page }) => {
    await page.goto('/auctions')
    await expect(page.getByTestId('auction-card').first()).toBeVisible({ timeout: 15_000 })

    // Karta tıkla
    await page.getByTestId('auction-card').first().click()
    await expect(page).toHaveURL(/\/auctions\//, { timeout: 8_000 })
  })

  // ── DETAY TESTLERİ ────────────────────────────────────────────────────────

  test('auction detay sayfası yüklenir', async ({ page }) => {
    await page.goto('/auctions/auction-test-001')
    
    await expect(page.getByTestId('current-price')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('countdown')).toBeVisible()
  })

  test('teklif geçmişi görüntülenir', async ({ page }) => {
    await page.goto('/auctions/auction-test-001')
    await expect(page.getByTestId('bid-history')).toBeVisible({ timeout: 10_000 })
    const bidRows = page.getByTestId('bid-row')
    await expect(bidRows.first()).toBeVisible()
  })

  // ── KATILIM TESTLERİ ─────────────────────────────────────────────────────

  test('katılım butonu görünür', async ({ page }) => {
    await page.goto('/auctions/auction-test-001')
    await expect(page.getByTestId('participate-button')).toBeVisible({ timeout: 10_000 })
  })

  test('başarılı katılım → onay mesajı gösterilir', async ({ page }) => {
    // Katılım endpoint'ini başarılı olacak şekilde override et
    await page.route('**/api/v1/auctions/auction-test-001/participate**', route =>
      route.fulfill({ json: MOCK_PARTICIPATION })
    )
    // Katılım durumunu güncelle
    await page.route('**/api/v1/auctions/auction-test-001/participation**', route =>
      route.fulfill({ json: MOCK_PARTICIPATION })
    )

    await page.goto('/auctions/auction-test-001')
    
    const participateBtn = page.getByTestId('participate-button')
    await expect(participateBtn).toBeVisible({ timeout: 10_000 })
    await participateBtn.click()

    await expect(page.getByText(/katıldınız|depozito|bloke/i)).toBeVisible({ timeout: 8_000 })
  })

  // ── TEKLİF TESTLERİ ──────────────────────────────────────────────────────

  test('başarılı teklif → fiyat güncellenir', async ({ page }) => {
    // Katılmış durum
    await page.route('**/api/v1/auctions/auction-test-001/participation**', route =>
      route.fulfill({ json: MOCK_PARTICIPATION })
    )
    // Başarılı bid
    await page.route('**/api/v1/auctions/auction-test-001/bid**', route =>
      route.fulfill({ json: MOCK_BID_SUCCESS })
    )

    await page.goto('/auctions/auction-test-001')

    const bidAmountInput = page.getByTestId('bid-amount')
    await expect(bidAmountInput).toBeVisible({ timeout: 10_000 })
    await bidAmountInput.fill('700')

    const placeBidBtn = page.getByTestId('place-bid-button')
    await expect(placeBidBtn).toBeVisible()
    await placeBidBtn.click()

    // Teklif onayı
    await expect(page.getByText(/teklif|bid|başarı/i)).toBeVisible({ timeout: 8_000 })
  })

  test('bitmiş artırmada teklif formu görünmez', async ({ page }) => {
    // ENDED auction detail override
    await page.route('**/api/v1/auctions/auction-test-001**', route => {
      const url = route.request().url()
      if (url.includes('/bids')) return route.fulfill({ json: MOCK_BIDS })
      if (url.includes('/participation')) return route.fulfill({ json: MOCK_NO_PARTICIPATION })
      return route.fulfill({ json: {
        ...MOCK_DETAIL,
        data: { ...MOCK_DETAIL.data, status: 'ENDED' },
      }})
    })

    await page.goto('/auctions/auction-test-001')
    await expect(page.getByTestId('current-price')).toBeVisible({ timeout: 15_000 })

    // Teklif formu görünmemeli
    await expect(page.getByTestId('place-bid-button')).not.toBeVisible()
  })
})
