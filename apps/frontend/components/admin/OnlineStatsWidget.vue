<script setup lang="ts">
// components/admin/OnlineStatsWidget.vue
// Admin paneli online kullanıcı istatistikleri — 30 saniyede bir otomatik güncellenir.

const { stats, loading, error, fetchStats } = useOnlineStats()

// Son güncelleme zamanını okunabilir formata çevir
const lastUpdated = computed(() => {
  if (!stats.value?.cachedAt) return null
  return new Date(stats.value.cachedAt).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

interface StatCard {
  label: string
  description: string
  valueKey: keyof import('~/types/admin').OnlineStatsDto
  color: string
  dotColor: string
  isLive: boolean
}

const cards: StatCard[] = [
  {
    label: 'Şu An Online',
    description: 'Son 5 dakikada aktif',
    valueKey: 'onlineNow',
    color: 'bg-green-50 border-green-200',
    dotColor: 'bg-green-500',
    isLive: true,
  },
  {
    label: 'Bugün Aktif',
    description: 'Bugün giriş yapanlar',
    valueKey: 'activeToday',
    color: 'bg-blue-50 border-blue-200',
    dotColor: 'bg-blue-500',
    isLive: false,
  },
  {
    label: 'Bugün Kayıt',
    description: 'Yeni üyelik (UTC)',
    valueKey: 'newTodayCount',
    color: 'bg-purple-50 border-purple-200',
    dotColor: 'bg-purple-500',
    isLive: false,
  },
  {
    label: 'Toplam Aktif',
    description: 'ACTIVE statüsündeki üyeler',
    valueKey: 'totalActiveUsers',
    color: 'bg-gray-50 border-gray-200',
    dotColor: 'bg-gray-400',
    isLive: false,
  },
]
</script>

<template>
  <div>
    <!-- Başlık + kontroller -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Online Kullanıcılar
      </h2>
      <div class="flex items-center gap-3 text-xs text-gray-400">
        <span v-if="lastUpdated">Son güncelleme: {{ lastUpdated }}</span>
        <button
          class="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
          :disabled="loading"
          @click="fetchStats"
        >
          <svg
            :class="['w-3.5 h-3.5', loading ? 'animate-spin' : '']"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          YENİLE
        </button>
      </div>
    </div>

    <!-- Hata durumu -->
    <div
      v-if="error"
      class="flex items-center justify-between p-4 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
    >
      <span>{{ error }}</span>
      <button
        class="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold text-xs transition-all"
        @click="fetchStats"
      >
        TEKRAR DENE
      </button>
    </div>

    <!-- 4 kart grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <template v-if="loading && !stats">
        <!-- Loading skeleton -->
        <div
          v-for="i in 4"
          :key="i"
          class="border rounded-xl p-4 animate-pulse bg-gray-50 border-gray-200"
        >
          <div class="h-3 bg-gray-200 rounded w-3/4 mb-3" />
          <div class="h-8 bg-gray-200 rounded w-1/2 mb-2" />
          <div class="h-2.5 bg-gray-100 rounded w-2/3" />
        </div>
      </template>

      <template v-else>
        <div
          v-for="card in cards"
          :key="card.valueKey"
          :class="['border rounded-xl p-4 transition-all', card.color]"
        >
          <!-- Etiket + canlı göstergesi -->
          <div class="flex items-center gap-1.5 mb-2">
            <span
              :class="['inline-block w-2 h-2 rounded-full flex-shrink-0', card.dotColor, card.isLive ? 'animate-pulse' : '']"
            />
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 truncate">
              {{ card.label }}
            </span>
          </div>

          <!-- Değer -->
          <p class="text-3xl font-black text-gray-900 tabular-nums leading-none mb-1">
            {{ stats ? stats[card.valueKey].toLocaleString('tr-TR') : '—' }}
          </p>

          <!-- Açıklama -->
          <p class="text-[10px] text-gray-400 font-medium">
            {{ card.description }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
