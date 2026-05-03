// apps/mobile/hooks/useSurplus.ts
import { useState, useCallback } from 'react'
import api from '@/services/api'
import type { SurplusItem, TradeOffer, CreateSurplusDto, CreateOfferDto } from '@/types/surplus'

interface SurplusListParams {
  page?: number
  limit?: number
  q?: string
  categoryId?: string
  city?: string
}

export const useSurplus = () => {
  const [items, setItems] = useState<SurplusItem[]>([])
  const [myItems, setMyItems] = useState<SurplusItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchItems = useCallback(async (params: SurplusListParams = {}) => {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/surplus', { params: { limit: 20, page: 1, ...params } })
      if (res.data.success) {
        setItems(res.data.data || [])
        setTotal(res.data.meta?.total || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/surplus/my')
      if (res.data.success) setMyItems(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchItem = useCallback(async (id: string): Promise<SurplusItem | null> => {
    const res = await api.get(`/api/v1/surplus/${id}`)
    return res.data.success ? res.data.data : null
  }, [])

  const createItem = useCallback(async (dto: CreateSurplusDto): Promise<SurplusItem> => {
    const res = await api.post('/api/v1/surplus', dto)
    return res.data.data
  }, [])

  return { items, myItems, loading, total, fetchItems, fetchMyItems, fetchItem, createItem }
}

export const useTradeOffers = () => {
  const [offers, setOffers] = useState<TradeOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  const fetchMyOffers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/v1/offers/my', { params: { type: activeTab } })
      if (res.data.success) setOffers(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const fetchOffer = useCallback(async (id: string): Promise<TradeOffer | null> => {
    const res = await api.get(`/api/v1/offers/${id}`)
    return res.data.success ? res.data.data : null
  }, [])

  const createOffer = useCallback(async (dto: CreateOfferDto): Promise<TradeOffer> => {
    const res = await api.post('/api/v1/offers', dto)
    return res.data.data
  }, [])

  const acceptOffer = useCallback(async (id: string): Promise<string | null> => {
    const res = await api.post(`/api/v1/offers/${id}/accept`)
    return res.data.data?.sessionId || null
  }, [])

  const rejectOffer = useCallback(async (id: string): Promise<void> => {
    await api.patch(`/api/v1/offers/${id}/status`, { status: 'REJECTED' })
  }, [])

  const counterOffer = useCallback(async (id: string, dto: Partial<CreateOfferDto>): Promise<TradeOffer> => {
    const res = await api.post(`/api/v1/offers/${id}/counter`, dto)
    return res.data.data
  }, [])

  return {
    offers, loading, activeTab, setActiveTab,
    fetchMyOffers, fetchOffer, createOffer, acceptOffer, rejectOffer, counterOffer,
  }
}
