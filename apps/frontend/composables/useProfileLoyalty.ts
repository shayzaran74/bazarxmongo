import { ref, computed } from 'vue'
import { userService } from '~/services/userService'
import { useOrderService } from '~/services/api/OrderService'
import type { LoyaltyStatus, LoyaltyHistoryItem, UserProfileStats } from '@barterborsa/shared-types'

export const useProfileLoyalty = () => {
  const loyaltyStatus = ref<LoyaltyStatus | null>(null)
  const loyaltyHistory = ref<LoyaltyHistoryItem[]>([])
  const loyaltyHistoryLoading = ref(false)
  const userTierData = ref<unknown>(null)
  const userStats = ref<UserProfileStats | null>(null)
  const recentOrders = ref<any[]>([])

  const loyaltyStatusMapped = computed(() => {
    if (!loyaltyStatus.value) return null
    const d = loyaltyStatus.value
    const tierInfo = (userTierData.value as any) || {}
    
    return {
      tier: d.rank || tierInfo.currentTier?.name || 'BRONZE',
      xp: d.xp || 0,
      nextTier: tierInfo.nextTier?.name || 'Silver',
      nextTierXP: tierInfo.nextTier?.minXp || 1000,
      progress: tierInfo.progress || Math.min((d.xp || 0) / 1000 * 100, 100),
      message: tierInfo.nextTier ? `${tierInfo.nextTier.name} seviyesine ulaşmanıza az kaldı!` : 'En üst seviyedesiniz!'
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
      
      const { getMyOrders } = useOrderService()
      const ordersRes = await getMyOrders({ limit: 5 })
      if (ordersRes.success && ordersRes.data) {
        recentOrders.value = ordersRes.data
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return { 
    loyaltyStatusMapped, loyaltyHistory, loyaltyHistoryLoading, userTierData, userStats, recentOrders,
    fetchLoyaltyData, fetchUserStats 
  }
}
