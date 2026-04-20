<script setup lang="ts">
import { 
  CurrencyDollarIcon, ClockIcon, CheckCircleIcon, BanknotesIcon 
} from '@heroicons/vue/24/outline'

defineProps<{
  stats: {
    total: number
    active: number
    completed: number
    revenue: number
  }
}>()
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
    <div class="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-3xl p-6">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary-500 transition-colors">
          <CurrencyDollarIcon class="h-6 w-6" />
        </div>
        <div class="ml-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Toplam Başlık</p>
          <p class="text-2xl font-black text-gray-900 italic tracking-tighter">{{ stats.total }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-3xl p-6">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
          <ClockIcon class="h-6 w-6" />
        </div>
        <div class="ml-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Aktif Olanlar</p>
          <p class="text-2xl font-black text-gray-900 italic tracking-tighter">{{ stats.active }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-3xl p-6">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
          <CheckCircleIcon class="h-6 w-6" />
        </div>
        <div class="ml-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Bitenler</p>
          <p class="text-2xl font-black text-gray-900 italic tracking-tighter">{{ stats.completed }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-3xl p-6">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
          <BanknotesIcon class="h-6 w-6" />
        </div>
        <div class="ml-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Tahmini Hacim</p>
          <p class="text-2xl font-black text-gray-900 italic tracking-tighter">₺{{ stats.revenue.toLocaleString('tr-TR') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
