<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  filters: {
    status: string
    category: string
    search: string
  }
  categories: any[]
}>()

const emit = defineEmits(['update:filters', 'reset'])

const updateFilters = (key: string, value: string) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<template>
  <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-4 items-end">
      <div>
        <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-1">GÜNCEL DURUM</label>
        <select
          :value="filters.status"
          class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold transition-all outline-none appearance-none cursor-pointer"
          @change="updateFilters('status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tümü</option>
          <option value="Active">Aktif</option>
          <option value="Completed">Tamamlandı</option>
          <option value="Cancelled">İptal Edildi</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-1">KATEGORİ SEÇİMİ</label>
        <select
          :value="filters.category"
          class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold transition-all outline-none appearance-none cursor-pointer"
          @change="updateFilters('category', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tüm Kategoriler</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
        </select>
      </div>

      <div class="relative">
        <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-1">KELİME İLE ARA</label>
        <div class="relative">
          <input
            :value="filters.search"
            type="text"
            placeholder="Açık artırma adı..."
            class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-bold transition-all outline-none"
            @input="updateFilters('search', ($event.target as HTMLInputElement).value)"
          >
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <button
          class="w-full px-6 py-3 border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
          @click="$emit('reset')"
        >
          Filteyi SIFIRLA
        </button>
      </div>
    </div>
  </div>
</template>
