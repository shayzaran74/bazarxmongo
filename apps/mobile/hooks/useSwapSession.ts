// apps/mobile/hooks/useSwapSession.ts
import { useState, useCallback } from 'react'
import api from '@/services/api'
import type { SwapSession } from '@/types/surplus'

export const useSwapSession = (sessionId: string) => {
  const [session, setSession] = useState<SwapSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await api.get(`/api/v1/barter/swap/${sessionId}`)
      if (res.data.success) setSession(res.data.data)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const submitShipping = useCallback(async (trackingCode: string, carrier: string) => {
    setActionLoading(true)
    try {
      await api.post(`/api/v1/barter/swap/${sessionId}/ship`, { trackingCode, carrier })
      await fetchSession()
    } finally {
      setActionLoading(false)
    }
  }, [sessionId, fetchSession])

  const confirmReceipt = useCallback(async () => {
    setActionLoading(true)
    try {
      await api.post(`/api/v1/barter/swap/${sessionId}/confirm`)
      await fetchSession()
    } finally {
      setActionLoading(false)
    }
  }, [sessionId, fetchSession])

  const finalizeSwap = useCallback(async () => {
    setActionLoading(true)
    try {
      await api.post(`/api/v1/barter/swap/${sessionId}/finalize`)
      await fetchSession()
    } finally {
      setActionLoading(false)
    }
  }, [sessionId, fetchSession])

  const sendDispute = useCallback(async (reason: string) => {
    setActionLoading(true)
    try {
      await api.post(`/api/v1/barter/swap/${sessionId}/dispute`, { reason })
      await fetchSession()
    } finally {
      setActionLoading(false)
    }
  }, [sessionId, fetchSession])

  return {
    session, loading, actionLoading,
    fetchSession, submitShipping, confirmReceipt, finalizeSwap, sendDispute,
  }
}
