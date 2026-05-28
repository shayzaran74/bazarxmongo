// composables/useOnlineStats.ts
// Admin için online kullanıcı istatistiklerini çeker ve 30 saniyede bir günceller.

import { ref, onMounted, onUnmounted } from 'vue'
import type { OnlineStatsDto } from '~/types/admin'

export function useOnlineStats() {
  const stats = ref<OnlineStatsDto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let intervalId: ReturnType<typeof setInterval> | null = null

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      const { $api } = useApi()
      const res = await $api<{ success: boolean; data: OnlineStatsDto }>('/api/admin/stats/online')
      if (res.success) {
        stats.value = res.data
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'İstatistikler alınamadı'
      error.value = msg
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchStats()
    // Her 30 saniyede bir otomatik güncelle
    intervalId = setInterval(fetchStats, 30_000)
  })

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return { stats, loading, error, fetchStats }
}
