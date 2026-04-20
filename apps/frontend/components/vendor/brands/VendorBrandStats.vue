<template>
  <div class="space-y-4">
    <!-- Info Banners -->
    <div v-if="hasPendingIssues" class="space-y-2">
      <div 
        v-for="brand in belgeTalepEdilenler" 
        :key="brand.id"
        class="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <ExclamationTriangleIcon class="h-6 w-6 text-orange-500" />
          <div>
            <p class="text-sm font-bold text-orange-900">{{ brand.name }} için Ek Belge Gerekli!</p>
            <p class="text-xs text-orange-700">Yönetici incelemesi sonucunda marka belgelerinizde eksik tespit edildi.</p>
          </div>
        </div>
        <button class="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-100">
          Güncelle
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div v-for="stat in statsList" :key="stat.label" class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  stats: Object,
  brands: Array
})

const belgeTalepEdilenler = computed(() => {
  return props.brands.filter(b => b.status === 'PENDING' && b.additionalDocsRequestedAt)
})

const hasPendingIssues = computed(() => belgeTalepEdilenler.value.length > 0)

const statsList = computed(() => [
  { label: 'Toplam Marka', value: props.stats.total },
  { label: 'Onaylı', value: props.stats.approved },
  { label: 'Beklemede', value: props.stats.pending },
  { label: 'Reddedilen', value: props.stats.rejected }
])
</script>
