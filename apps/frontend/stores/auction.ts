// stores/auction.ts
import { defineStore } from 'pinia'

export interface AuctionBid {
  id: string
  userId: string
  amount: number
  createdAt: string
  user?: { email: string; firstName?: string; lastName?: string }
}

export interface AuctionParticipation {
  id: string
  userId: string
  status: string
  blockedAmount: number
}

export interface Auction {
  id: string
  listingId: string
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'COMPLETED' | 'CANCELLED'
  startingPrice: number
  currentPrice: number
  minBidIncrement: number
  participationDeposit?: number
  startTime: string
  endTime: string
  winnerId?: string
  title?: string
  // Joined fields
  listing?: {
    id: string
    title: string
    price: number
    catalogProduct?: {
      id: string
      name: string
      slug: string
      media?: Array<{ url: string; type: string }>
      category?: { id: string; name: string; slug: string }
    }
    vendor?: { id: string; slug: string; profile?: { storeName: string } }
  }
  _count?: { bids: number; participations: number }
  // Computed / UI helpers
  Product?: {
    id: string
    name: string
    image: string | null
    category?: { name: string } | null
  }
}

interface AuctionState {
  auctions: Auction[]
  currentAuction: Auction | null
  bids: AuctionBid[]
  myBids: AuctionBid[]
  createdAuctions: Auction[]
  participation: AuctionParticipation | null
  total: number
  loading: boolean
  error: string | null
}

export const useAuctionStore = defineStore('auction', {
  state: (): AuctionState => ({
    auctions: [],
    currentAuction: null,
    bids: [],
    myBids: [],
    createdAuctions: [],
    participation: null,
    total: 0,
    loading: false,
    error: null,
  }),

  getters: {
    activeAuctions: (state) =>
      state.auctions.filter(a => a.status === 'ACTIVE'),
    scheduledAuctions: (state) =>
      state.auctions.filter(a => a.status === 'SCHEDULED'),
    isParticipating: (state) =>
      !!state.participation &&
      state.participation.status === 'ACTIVE',
  },

  actions: {
    async fetchAuctions(params: {
      page?: number
      limit?: number
      status?: string
      categoryId?: string
      search?: string
      sortBy?: string
    } = {}) {
      this.loading = true
      this.error = null
      try {
        console.log('AuctionStore: Fetching auctions...', params)
        const { $api } = useApi()
        const res = await $api<any>('/api/auctions', { query: params })
        console.log('AuctionStore: Response received', res)

        if (!res) throw new Error('Sunucudan yanıt alınamadı')

        let items: any[] = []
        if (res.data) {
          if (Array.isArray(res.data.items)) {
            items = res.data.items
          } else if (Array.isArray(res.data)) {
            items = res.data
          }
        }

        this.auctions = items.map(mapAuction)
        this.total = res.data?.total || this.auctions.length
        console.log('AuctionStore: Auctions mapped', this.auctions.length)
      } catch (e: any) {
        console.error('AuctionStore Error:', e)
        this.error = e?.data?.message || e?.message || 'Açık artırmalar yüklenemedi'
      } finally {
        this.loading = false
      }
    },

    async fetchAuction(id: string) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useApi()
        const res = await $api<any>(`/api/auctions/${id}`)
        this.currentAuction = mapAuction(res.data)
      } catch (e: any) {
        this.error = e?.data?.message || 'Açık artırma yüklenemedi'
        this.currentAuction = null
      } finally {
        this.loading = false
      }
    },

    async fetchBids(auctionId: string) {
      try {
        const { $api } = useApi()
        const res = await $api<AuctionBid[]>(
          `/api/auctions/${auctionId}/bids`
        )
        this.bids = res.data || []
      } catch { /* ignore */ }
    },

    async fetchParticipation(auctionId: string) {
      try {
        const { $api } = useApi()
        const res = await $api<AuctionParticipation>(
          `/api/auctions/${auctionId}/participation`
        )
        this.participation = res.data || null
      } catch {
        this.participation = null
      }
    },

    async participate(auctionId: string) {
      const { $api } = useApi()
      const res = await $api<AuctionParticipation>(
        `/api/auctions/${auctionId}/participate`,
        { method: 'POST' }
      )
      if (res.success) {
        this.participation = res.data || null
      }
      return res
    },

    async placeBid(auctionId: string, amount: number) {
      const { $api } = useApi()
      const res = await $api<AuctionBid>(
        `/api/auctions/${auctionId}/bid`,
        { method: 'POST', body: { amount } }
      )
      if (res.success && res.data) {
        const authStore = useAuthStore()
        if (authStore.user) {
          res.data.userName = authStore.user.firstName 
            || authStore.user.email?.split('@')[0] 
            || 'Siz';
        }
        this.bids.unshift(res.data)
        if (this.currentAuction) {
          this.currentAuction.currentPrice = amount
        }
      }
      return res
    },

    async claimWin(auctionId: string) {
      const { $api } = useApi()
      return $api<{ success: boolean }>(
        `/api/auctions/${auctionId}/claim`,
        { method: 'POST' }
      )
    },

    async fetchMyBids() {
      try {
        const { $api } = useApi()
        const res = await $api<AuctionBid[]>(
          '/api/auctions/my/bids'
        )
        this.myBids = res.data || []
      } catch { /* ignore */ }
    },

    async fetchCreatedAuctions() {
      try {
        const { $api } = useApi()
        const res = await $api<any[]>(
          '/api/auctions/my/created'
        )
        this.createdAuctions = (res.data || []).map(mapAuction)
      } catch { /* ignore */ }
    },

    async endAuction(auctionId: string) {
      const { $api } = useApi()
      return $api<{ success: boolean }>(
        `/api/admin/auctions/${auctionId}/end`,
        { method: 'POST' }
      )
    },
  }
})

// Mapper — backend'den gelen raw veriyi Auction tipine dönüştürür
function mapAuction(raw: any): Auction {
  if (!raw) return {} as Auction
  const media = raw.listing?.catalogProduct?.media || []
  const image = media.find((m: any) => m.type === 'IMAGE')?.url ||
                media[0]?.url || null

  return {
    ...raw,
    startingPrice: Number(raw.startingPrice || 0),
    currentPrice: Number(raw.currentPrice ?? raw.startingPrice ?? 0),
    minBidIncrement: Number(raw.minBidIncrement || 1),
    participationDeposit: raw.participationDeposit
      ? Number(raw.participationDeposit)
      : 0,
    title: raw.title || raw.listing?.title || raw.listing?.catalogProduct?.name || 'İsimsiz Protokol',
    Product: raw.listing?.catalogProduct
      ? {
          id: raw.listing.catalogProduct.id,
          name: raw.listing.catalogProduct.name,
          image,
          category: raw.listing.catalogProduct.category || null,
        }
      : {
          id: '',
          name: raw.title || 'Ürün Bilgisi Yok',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
          category: null
        },
  }
}
