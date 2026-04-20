<template>
  <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
    <!-- Search + Letter Filter -->
    <div class="px-8 py-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-center gap-1 overflow-x-auto">
        <button
          v-for="letter in ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZÇĞİÖŞÜ'.split('')]" :key="letter"
          class="min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-all shrink-0"
          :class="selectedLetter === letter ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-100'"
          @click="$emit('update:selectedLetter', letter === 'ALL' ? '' : letter)"
        >{{ letter }}</button>
      </div>
      <div class="relative max-w-xs w-full">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          :value="searchQuery"
          type="text"
          placeholder="Marka adı ara..."
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold"
          @input="$emit('search')"
        >
      </div>
    </div>

    <!-- Table -->
    <table class="w-full text-left border-collapse">
      <thead class="bg-gray-50/50">
        <tr>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marka</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Popüler</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="brand in brands" :key="brand.id" class="hover:bg-indigo-50/30 transition-colors group">
          <td class="px-8 py-4">
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0">
                <img :src="resolveImageUrl(brand.logoUrl || brand.image)" class="w-full h-full object-contain rounded-xl" @error="$event.target.src='/images/no-brand.png'">
              </div>
              <div>
                <div class="text-sm font-black text-gray-900 group-hover:text-indigo-700 transition-colors">{{ brand.name }}</div>
                <div class="text-[11px] font-bold text-gray-400">/{{ brand.slug }}</div>
              </div>
            </div>
          </td>
          <td class="px-8 py-4 text-center">
            <span :class="getStatusClass(brand.status)" class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              {{ brand.status }}
            </span>
          </td>
          <td class="px-8 py-4 text-center">
            <StarIcon :class="brand.isPopular ? 'text-amber-500 fill-amber-400' : 'text-gray-200'" class="w-5 h-5 mx-auto" />
          </td>
          <td class="px-8 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button v-if="brand.status === 'PENDING'" class="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all" @click="$emit('review', brand)">
                <EyeIcon class="w-4 h-4" />
              </button>
              <button class="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all" @click="$emit('edit', brand)">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button class="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all" @click="$emit('delete', brand.id)">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="!brands?.length">
          <td colspan="4" class="py-20 text-center italic text-gray-400 font-bold">Marka bulunamadı.</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="totalItems > 0" class="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
      <span class="text-[11px] font-black text-gray-400 uppercase tracking-widest">TOPLAM {{ totalItems }} MARKA</span>
      <div class="flex items-center gap-1">
        <button
          v-for="p in totalPages" :key="p"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all"
          :class="currentPage === p ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-white border border-transparent hover:border-gray-100'"
          @click="$emit('update:currentPage', p)"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, StarIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
defineProps({
  brands: Array, totalItems: Number, totalPages: Number,
  currentPage: Number, searchQuery: String, selectedLetter: String,
  resolveImageUrl: Function
})
defineEmits(['update:searchQuery', 'update:selectedLetter', 'update:currentPage', 'review', 'edit', 'delete', 'search'])
const getStatusClass = (s) => ({
  PENDING:  'bg-amber-50 text-amber-700 border border-amber-100',
  APPROVED: 'bg-green-50 text-green-700 border border-green-100',
  REJECTED: 'bg-red-50 text-red-700 border border-red-100'
})[s] || 'bg-gray-100 text-gray-700'
</script>
