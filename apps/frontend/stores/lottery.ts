// stores/lottery.ts
import { defineStore } from 'pinia'

export interface LotteryTicket {
  id: string
  lotteryId: string
  userId: string
  numbers: string[]
  createdAt: string
}

export interface Lottery {
  id: string
  title: string
  prizeDescription?: string
  ticketPrice: number
  status: 'ACTIVE' | 'ENDED' | 'DRAWN' | 'CANCELLED'
  winnerId?: string
  endTime: string
  startTime: string
  maxTicketsPerUser: number
  ownerId: string
  ticketDigits: number
  totalTickets: number
  numbersPerTicket: number
  prizeValue?: number
  winningNumber?: string
  listingId?: string
  _count?: { Tickets: number }
  // Joined
  Product?: {
    id: string
    name: string
    image: string | null
    description?: string
  }
  Winner?: {
    id: string
    email: string
    name?: string
  }
}

interface LotteryState {
  lotteries: Lottery[]
  currentLottery: Lottery | null
  myTickets: LotteryTicket[]
  myLotteries: Lottery[]
  total: number
  loading: boolean
  error: string | null
}

export const useLotteryStore = defineStore('lottery', {
  state: (): LotteryState => ({
    lotteries: [],
    currentLottery: null,
    myTickets: [],
    myLotteries: [],
    total: 0,
    loading: false,
    error: null,
  }),

  getters: {
    activeLotteries: (state) =>
      state.lotteries.filter(l => l.status === 'ACTIVE'),
  },

  actions: {
    async fetchLotteries(params: { status?: string; search?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useApi()
        const res = await $api<any[]>(
          '/api/lotteries',
          { query: params }
        )
        this.lotteries = (res.data || []).map(mapLottery)
      } catch (e: any) {
        this.error = e?.data?.message || 'Çekilişler yüklenemedi'
      } finally {
        this.loading = false
      }
    },

    async fetchLottery(id: string) {
      this.loading = true
      this.error = null
      try {
        const { $api } = useApi()
        const res = await $api<any>(
          `/api/lotteries/${id}`
        )
        this.currentLottery = mapLottery(res.data)
      } catch (e: any) {
        this.error = e?.data?.message || 'Çekiliş yüklenemedi'
        this.currentLottery = null
      } finally {
        this.loading = false
      }
    },

    async fetchMyTickets(lotteryId?: string) {
      try {
        const { $api } = useApi()
        const res = await $api<LotteryTicket[]>(
          '/api/lotteries/my/tickets'
        )
        const tickets = res.data || []
        this.myTickets = lotteryId
          ? tickets.filter(t => t.lotteryId === lotteryId)
          : tickets
      } catch { /* ignore */ }
    },

    async fetchMyLotteries() {
      try {
        const { $api } = useApi()
        const res = await $api<any[]>(
          '/api/lotteries/my'
        )
        this.myLotteries = (res.data || []).map(mapLottery)
      } catch { /* ignore */ }
    },

    async buyTickets(lotteryId: string, count: number) {
      const { $api } = useApi()
      const res = await $api<LotteryTicket[]>(
        `/api/lotteries/${lotteryId}/buy`,
        { method: 'POST', body: { count } }
      )
      if (res.success && res.data) {
        this.myTickets.push(...res.data)
      }
      return res
    },
  }
})

function mapLottery(raw: any): Lottery {
  if (!raw) return {} as Lottery
  return {
    ...raw,
    ticketPrice: Number(raw.ticketPrice),
    prizeValue: raw.prizeValue ? Number(raw.prizeValue) : undefined,
  }
}
