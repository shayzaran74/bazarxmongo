// e2e/fixtures/api.fixtures.ts
// API mock'ları — gerçek backend olmadan test edilebilmesi için

export const mockCart = {
  success: true,
  data: {
    id: 'cart-test-001',
    userId: 'user-001',
    items: [
      {
        id: 'item-001',
        quantity: 1,
        Product: {
          id: 'prod-001',
          name: 'Laptop Stand Pro',
          image: '/placeholder-product.svg',
          price: 250,
          stock: 10
        }
      }
    ],
    summary: {
      subtotal: 250,
      shipping: 0,
      tax: 0,
      total: 250
    }
  }
}

export const mockAddresses = {
  success: true,
  data: [
    {
      id: 'addr-001',
      title: 'Ev',
      fullName: 'Test Kullanıcı',
      phone: '5550000000',
      addressLine: 'Test Sokak No:1',
      city: 'İstanbul',
      district: 'Kadıköy',
      isDefault: true,
    },
  ],
}

export const mockWallet = {
  success: true,
  data: {
    availableBalance: 5000,
    barterBalance: 1000,
    pendingBalance: 0,
  },
}

export const mockCheckoutResult = {
  success: true,
  data: [
    {
      id: 'order-test-001',
      orderNumber: 'ORD-2026-001',
      status: 'PENDING',
      totalAmount: 250,
    },
  ],
}

export const mockAuctions = {
  success: true,
  data: {
    items: [
      {
        id: 'auction-test-001',
        status: 'ACTIVE',
        startingPrice: 500,
        currentPrice: 650,
        minBidIncrement: 50,
        participationDeposit: 100,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        title: 'Test Açık Artırma — iPhone 15',
        _count: { bids: 3, participations: 5 },
        listing: {
          title: 'iPhone 15 Pro Max',
          catalogProduct: {
            name: 'iPhone 15 Pro Max 256GB',
            media: [{ url: '/placeholder-product.svg', type: 'IMAGE' }],
            category: { name: 'Telefon' },
          },
        },
        Product: {
          id: 'prod-001',
          name: 'iPhone 15 Pro Max 256GB',
          image: '/placeholder-product.svg',
          category: { name: 'Telefon' },
        },
      },
    ],
    total: 1,
  },
}

export const mockAuctionDetail = {
  success: true,
  data: {
    id: 'auction-test-001',
    status: 'ACTIVE',
    startingPrice: 500,
    currentPrice: 650,
    minBidIncrement: 50,
    participationDeposit: 100,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    title: 'Test Açık Artırma — iPhone 15',
    winnerId: null,
    listing: {
      title: 'iPhone 15 Pro Max',
      catalogProduct: {
        name: 'iPhone 15 Pro Max 256GB',
        media: [{ url: '/placeholder-product.svg', type: 'IMAGE' }],
        category: { name: 'Telefon' },
      },
      vendor: { profile: { storeName: 'Apple Yetkili' } },
    },
    _count: { bids: 3, participations: 5 },
    Product: {
      id: 'prod-001',
      name: 'iPhone 15 Pro Max 256GB',
      image: '/placeholder-product.svg',
      category: { name: 'Telefon' },
    },
  },
}

export const mockBids = {
  success: true,
  data: [
    {
      id: 'bid-003',
      userId: 'user-other-002',
      amount: 650,
      createdAt: new Date(Date.now() - 600000).toISOString(),
      user: { email: 'diger@user.com', firstName: 'Ali' },
    },
    {
      id: 'bid-002',
      userId: 'user-other-001',
      amount: 600,
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      user: { email: 'baska@user.com', firstName: 'Veli' },
    },
  ],
}

export const mockParticipation = {
  success: true,
  data: null, // Henüz katılmamış
}

export const mockParticipationSuccess = {
  success: true,
  data: {
    id: 'part-001',
    userId: 'user-test-001',
    status: 'ACTIVE',
    blockedAmount: 100,
  },
}

export const mockBidSuccess = {
  success: true,
  data: {
    id: 'bid-004',
    userId: 'user-test-001',
    amount: 700,
    createdAt: new Date().toISOString(),
  },
}

export const mockVendorApply = {
  success: true,
  data: {
    id: 'vendor-test-001',
    status: 'PENDING',
  },
}
