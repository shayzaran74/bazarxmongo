// apps/frontend/composables/useTrustScore.ts

import { ref, computed } from 'vue'

interface TrustScoreData {
  vendorId: string
  tier: string
  tierInfo: { annualFee: number; commissionRate: number; groupRate: number; poolLimit: number }
  trustScore: {
    overall: number; tradingPerformance: number; xpLoyalty: number; compliance: number
    violationCount: number; isFrozen: boolean; level: string; lastCalculatedAt: string
  }
}

export function useTrustScore() {
  const { $api } = useApi()
  const data    = ref<TrustScoreData | null>(null)
  const pending = ref(false)

  const score        = computed(() => data.value?.trustScore.overall ?? 0)
  const isFrozen     = computed(() => data.value?.trustScore.isFrozen ?? false)
  const level        = computed(() => data.value?.trustScore.level ?? '-')
  const scoreColor   = computed(() => {
    const s = score.value
    if (s >= 90) return 'text-emerald-400'
    if (s >= 75) return 'text-blue-400'
    if (s >= 60) return 'text-amber-400'
    return 'text-red-400'
  })

  async function fetch() {
    pending.value = true
    try {
      const res = await $api<TrustScoreData>('/api/trust-score/me')
      data.value = res.data ?? null
    } finally { pending.value = false }
  }

  async function getXpAllowance(type: 'COMMISSION' | 'ADVERTISING' | 'POOL_DEPOSIT', amount?: number) {
    const body: Record<string, unknown> = { type }
    if (type === 'COMMISSION') body.commissionAmount = amount
    if (type === 'POOL_DEPOSIT') body.quotaAmount = amount
    const res = await $api('/api/trust-score/xp-allowance', { method: 'POST', body })
    return res.data
  }

  return { data, pending, score, isFrozen, level, scoreColor, fetch, getXpAllowance }
}
