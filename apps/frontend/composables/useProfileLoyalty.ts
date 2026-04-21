import { ref, computed } from 'vue'
import { userService } from '~/services/userService'
import type { LoyaltyStatus, LoyaltyHistoryItem, UserProfileStats } from '@barterborsa/shared-types'

export const useProfileLoyalty = () => {
  const loyaltyStatus = ref<LoyaltyStatus | null>(null)
  const loyaltyHistory = ref<LoyaltyHistoryItem[]>([])
  const loyaltyHistoryLoading = ref(false)
  const userTierData = ref<unknown>(null)
  const userStats = ref<UserProfileStats | null>(null)

  const loyaltyStatusMapped = computed(() => {
    if (!loyaltyStatus.value) return null
    const d = loyaltyStatus.value
    return {
      tier: d.rank || 'Bronze',
      xp: d.xp || 0,
      nextTier: 'Silver',
      nextTierXP: 1000,
      progress: Math.min((d.xp || 0) / 1000 * 100, 100),
      message: 'Keep going!'
    }
  })

  const fetchLoyaltyData = async () => {
    loyaltyHistoryLoading.value = true
    try {
      const [statusRes, historyRes, tierRes] = await Promise.all([
        userService.fetchLoyaltyStatus(),
        userService.fetchLoyaltyHistory(),
        userService.fetchUserTier()
      ])
      if (statusRes.success && statusRes.data) loyaltyStatus.value = statusRes.data as any
      if (historyRes.success && historyRes.data) loyaltyHistory.value = historyRes.data as any
      if (tierRes.success && tierRes.data) userTierData.value = tierRes.data as any
    } catch (error) {
      console.error('Error fetching loyalty data:', error)
    } finally {
      loyaltyHistoryLoading.value = false
    }
  }

  const fetchUserStats = async () => {
    try {
      const data = await userService.fetchUserStats()
      if (data.success && data.data) userStats.value = data.data.stats
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return { 
    loyaltyStatusMapped, loyaltyHistory, loyaltyHistoryLoading, userTierData, userStats,
    fetchLoyaltyData, fetchUserStats 
  }
}
