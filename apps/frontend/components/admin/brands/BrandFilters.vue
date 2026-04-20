<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex-1 min-w-[300px] relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          :value="searchQuery"
          type="text"
          class="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
          placeholder="Marka adı veya ID ile ara..."
          @input="$emit('update:searchQuery', $event.target.value); $emit('search')"
        >
      </div>

      <div class="flex gap-2 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          :class="[
            'px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
            status === filter.value 
              ? 'bg-gray-900 text-white shadow-lg' 
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          ]"
          @click="$emit('update:status', filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Alphabet Filter -->
    <div class="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm flex flex-wrap gap-1">
      <button
        v-for="letter in alphabet"
        :key="letter"
        :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all',
          selectedLetter === letter 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
            : 'text-gray-400 hover:bg-gray-50'
        ]"
        @click="$emit('update:selectedLetter', selectedLetter === letter ? '' : letter)"
      >
        {{ letter }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  searchQuery: String,
  status: String,
  selectedLetter: String
})

defineEmits(['update:searchQuery', 'update:status', 'update:selectedLetter', 'search'])

const statusFilters = [
  { label: 'Tümü', value: '' },
  { label: 'Bekleyenler', value: 'PENDING' },
  { label: 'Onaylılar', value: 'APPROVED' },
  { label: 'Reddedilenler', value: 'REJECTED' }
]

const alphabet = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z', '#']
</script>
