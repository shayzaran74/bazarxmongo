<template>
  <div class="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap items-center gap-4">
    <div class="flex items-center space-x-2">
      <span class="text-sm font-medium text-gray-700">Durum:</span>
      <select 
        :value="statusFilter" 
        class="p-2 border border-gray-100 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary-500 outline-none"
        @input="$emit('update:statusFilter', $event.target.value)"
      >
        <option value="">
          Tümü
        </option>
        <option value="Pending">
          Beklemede
        </option>
        <option value="Processing">
          Hazırlanıyor
        </option>
        <option value="Shipped">
          Kargoya Verildi
        </option>
        <option value="Delivered">
          Teslim Edildi
        </option>
        <option value="Cancelled">
          İptal Edildi
        </option>
      </select>
    </div>
    <div class="flex-1">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
          :value="searchQuery"
          placeholder="Sipariş no veya müşteri ara..."
          class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          @input="$emit('update:searchQuery', $event.target.value)"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import MagnifyingGlassIcon from '@heroicons/vue/24/outline/MagnifyingGlassIcon'

defineProps({
  statusFilter: {
    type: String,
    default: ''
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

defineEmits(['update:statusFilter', 'update:searchQuery'])
</script>
