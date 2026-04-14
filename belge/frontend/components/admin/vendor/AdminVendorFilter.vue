<template>
  <div class="flex gap-2">
    <div class="relative min-w-80">
      <input 
        :value="searchQuery"
        type="text"
        placeholder="İşletme adı veya tel ile ara..." 
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        @input="$emit('update:searchQuery', $event.target.value)" 
      >
      <div class="absolute left-3 top-1/2 -translate-y-1/2">
        <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
      </div>
    </div>
    
    <button
      :class="['px-4 py-2 rounded-lg font-bold transition-all', !statusFilter ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']"
      @click="$emit('update:statusFilter', null)"
    >
      Tümü
    </button>
    <button
      :class="['px-4 py-2 rounded-lg font-bold transition-all', statusFilter === 'PENDING' ? 'bg-yellow-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']"
      @click="$emit('update:statusFilter', 'PENDING')"
    >
      Bekleyen
    </button>
    <button
      :class="['px-4 py-2 rounded-lg font-bold transition-all', statusFilter === 'APPROVED' ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']"
      @click="$emit('update:statusFilter', 'APPROVED')"
    >
      Onaylı
    </button>
  </div>
</template>

<script setup>
import MagnifyingGlassIcon from '@heroicons/vue/24/outline/MagnifyingGlassIcon'
defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  statusFilter: {
    type: String,
    default: null
  }
})

defineEmits(['update:searchQuery', 'update:statusFilter'])
</script>
