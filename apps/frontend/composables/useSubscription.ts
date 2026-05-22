// apps/frontend/composables/useSubscription.ts
// Master Plan v4.3 — B2C Abonelik composable

import { ref, computed } from 'vue'
import type { SubscriptionTier } from '~/types/subscription'

interface MembershipPlan {
  id: string; tier: SubscriptionTier; monthlyFee: number; annualFee: number | null
  menuCredit: number; breakeven: number; benefits: Record<string, unknown>
}

interface MyMembership {
  hasSubscription: boolean
  subscription?: {
    id: string; tier: SubscriptionTier; status: string
    startDate: string; endDate: string; autoRenew: boolean
    nextBillingDate: string | null; monthlyFee: number
    downgradeProtectedUntil?: string
  }
  menuCredit?: { total: number; used: number; remaining: number }
  upgradeEligibility?: {
    monthlyRevenue: number; revenueThreshold: number
    revenueProgress: number; nearThreshold: boolean; eligible: boolean
  }
}

export function useSubscription() {
  const { $api } = useApi()
  const plans        = ref<MembershipPlan[]>([])
  const membership   = ref<MyMembership>({ hasSubscription: false })
  const pending      = ref(false)
  const error        = ref<string | null>(null)

  const currentTier  = computed(() => membership.value.subscription?.tier ?? null)
  const isActive     = computed(() => membership.value.subscription?.status === 'ACTIVE')
  const menuCredit   = computed(() => membership.value.menuCredit ?? { total: 0, used: 0, remaining: 0 })
  const eligibility  = computed(() => membership.value.upgradeEligibility)

  async function fetchPlans() {
    const res = await $api<MembershipPlan[]>('/api/v1/subscriptions/plans')
    plans.value = Array.isArray(res.data) ? res.data : []
  }

  async function fetchMyMembership() {
    try {
      const res = await $api<MyMembership>('/api/v1/subscriptions/me')
      membership.value = res.data ?? { hasSubscription: false }
    } catch { membership.value = { hasSubscription: false } }
  }

  async function subscribe(tier: SubscriptionTier, annual = false) {
    pending.value = true; error.value = null
    try {
      const res = await $api('/api/v1/subscriptions/subscribe', {
        method: 'POST', body: { tier, annual },
      })
      await fetchMyMembership()
      return res
    } catch (e: unknown) {
      error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Abonelik başarısız'
      throw e
    } finally { pending.value = false }
  }

  async function upgrade(newTier: SubscriptionTier, xpAmount = 0) {
    pending.value = true; error.value = null
    try {
      const res = await $api('/api/v1/subscriptions/upgrade', {
        method: 'POST', body: { newTier, xpAmount },
      })
      await fetchMyMembership()
      return res
    } catch (e: unknown) {
      error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Yükseltme başarısız'
      throw e
    } finally { pending.value = false }
  }

  async function cancel() {
    await $api('/api/v1/subscriptions/cancel', { method: 'POST' })
    await fetchMyMembership()
  }

  async function calcMenuPrice(originalPrice: number) {
    const res = await $api<{ originalPrice: number; totalPaid: number; savings: number }>(
      '/api/v1/subscriptions/menu-price-calc', { method: 'POST', body: { originalPrice } },
    )
    return res.data
  }

  return {
    plans, membership, pending, error,
    currentTier, isActive, menuCredit, eligibility,
    fetchPlans, fetchMyMembership, subscribe, upgrade, cancel, calcMenuPrice,
  }
}
