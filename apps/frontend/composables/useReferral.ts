// apps/frontend/composables/useReferral.ts
// Master Plan v4.3 §2.6 — Referans sistemi composable
// Tek katmanlı: 3 referansa kadar XP + bonus ödülleri

import type { Ref } from 'vue'

interface ReferralEntry {
  refereeId:    string
  xpEarned:     number | null
  bonusGranted: boolean | null
  completedAt:  string | null
  joinedAt:     string
}

interface ReferralStats {
  referralCode:   string | null
  totalReferrals: number
  completed:      number
  remaining:      number       // max(0, 3 - completed)
  hasThirdBonus:  boolean
  referrals:      ReferralEntry[]
}

export function useReferral() {
  const { apiBase } = useRuntimeConfig().public
  const stats: Ref<ReferralStats | null> = ref(null)
  const pending = ref(false)
  const error   = ref<string | null>(null)

  async function fetchStats(): Promise<void> {
    pending.value = true
    error.value   = null
    try {
      const data = await $fetch<ReferralStats>(`${apiBase}/api/v1/users/me/referral-stats`)
      stats.value = data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Referral bilgileri alınamadı'
    } finally {
      pending.value = false
    }
  }

  async function generateCode(): Promise<string | null> {
    try {
      const data = await $fetch<{ referralCode: string }>(
        `${apiBase}/api/v1/users/me/referral-code`,
        { method: 'POST' },
      )
      if (stats.value) stats.value.referralCode = data.referralCode
      return data.referralCode
    } catch {
      return null
    }
  }

  // Paylaşım URL'i
  const shareUrl = computed(() => {
    if (!stats.value?.referralCode) return null
    return `${useRuntimeConfig().public.appUrl ?? ''}/auth/register?ref=${stats.value.referralCode}`
  })

  // 3. referans tamamlandığında bonus göstergesi
  const thirdBonusUnlocked = computed(() => stats.value?.hasThirdBonus ?? false)

  // İlerleme yüzdesi (3 hedefine göre)
  const progressPct = computed(() => {
    if (!stats.value) return 0
    return Math.min(100, Math.round((stats.value.completed / 3) * 100))
  })

  onMounted(fetchStats)

  return {
    stats,
    pending,
    error,
    shareUrl,
    thirdBonusUnlocked,
    progressPct,
    fetchStats,
    generateCode,
  }
}
