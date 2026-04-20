<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
    <!-- Main Tabs -->
    <div class="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit m-6 mb-2">
      <button
        v-for="tab in tabs" :key="tab.value"
        class="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
        :class="activeTab === tab.value ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'"
        @click="$emit('update:activeTab', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Filters & Search Bar -->
    <div class="px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="flex bg-gray-100 p-1.5 rounded-2xl">
          <button
            v-for="f in currentFilters" :key="f.value"
            class="px-5 py-2 text-xs font-bold rounded-xl transition-all"
            :class="activeFilter === f.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            @click="$emit('update:activeFilter', f.value)"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
      
      <div class="relative max-w-sm w-full">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          :value="searchQuery"
          type="text"
          placeholder="Mağaza veya kampanya ara..."
          class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-medium"
          @input="$emit('update:searchQuery', $event.target.value)"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  activeTab: String,
  activeFilter: String,
  searchQuery: String
})

defineEmits(['update:activeTab', 'update:activeFilter', 'update:searchQuery'])

const tabs = [
  { label: 'ANA MODÜL REKLAMLARI', value: 'PRODUCT_ADS' },
  { label: 'SIRA VE KATEGORİ REKLAMLARI', value: 'BANNER_ADS' }
]

const productFilters = [
  { label: 'HEPSİ', value: 'ALL' },
  { label: 'BEKLEYENLER', value: 'PENDING' },
  { label: 'AKTİF', value: 'ENABLED' },
  { label: 'REDDEDİLENLER', value: 'REJECTED' }
]

const bannerFilters = [
  { label: 'HEPSİ', value: 'ALL' },
  { label: 'BEKLEYENLER', value: 'PENDING' },
  { label: 'AKTİF', value: 'ENABLED' }
]

const currentFilters = computed(() => props.activeTab === 'PRODUCT_ADS' ? productFilters : bannerFilters)
</script>
