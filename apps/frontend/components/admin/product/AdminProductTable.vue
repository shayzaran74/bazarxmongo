<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div
      v-if="loading"
      class="flex justify-center items-center h-64"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>

    <div v-else>
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left w-10">
              <input 
                type="checkbox" 
                :checked="isAllSelected" 
                class="w-4 h-4 text-primary-600 rounded border-gray-300"
                @change="$emit('toggleSelectAll')" 
              >
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Ürün Adı
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Marka
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Kategori
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Fiyat (₺)
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              Stok
            </th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr
            v-for="product in products"
            :key="product.id"
            class="hover:bg-gray-50"
            :class="{ 'bg-primary-50/30': selectedIds.includes(product.id) }"
          >
            <td class="px-6 py-4">
              <input 
                type="checkbox" 
                :value="product.id" 
                :checked="selectedIds.includes(product.id)"
                class="w-4 h-4 text-primary-600 rounded border-gray-300"
                @change="$emit('update:selectedIds', toggleId(product.id))" 
              >
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center space-x-3">
                <NuxtImg
                  :src="resolveImageUrl(product.image)"
                  :alt="product.name"
                  class="w-12 h-12 rounded object-cover shadow-sm border border-gray-100"
                  width="48"
                  height="48"
                  loading="lazy"
                />
                <div>
                  <p class="text-sm font-bold text-gray-900 line-clamp-1">
                    {{ product.name }}
                  </p>
                  <p class="text-[10px] text-gray-500 font-mono tracking-tighter">
                    {{ product.sku }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
              {{ product.Brand?.name || 'Markasız' }}
            </td>
            <td class="px-6 py-4">
              <span
                v-if="product.Category"
                class="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {{ product.Category.name }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm font-black text-gray-900">
              {{ formatPrice(product.price) }}
              <div
                v-if="product.Vendor"
                class="text-[9px] font-bold text-indigo-500 mt-0.5 uppercase tracking-tighter"
              >
                Satıcı: {{ product.Vendor.company?.name || product.Vendor.profile?.storeName || 'Bilinmeyen' }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', getStockClass(product.stock)]">
                {{ product.stock }} ADET
              </span>
            </td>
            <td class="px-6 py-4 text-sm font-bold space-x-3">
              <span
                v-if="product.status && PRODUCT_STATUS_CONFIG[product.status as keyof typeof PRODUCT_STATUS_CONFIG]"
                :class="['inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mr-2', PRODUCT_STATUS_CONFIG[product.status as keyof typeof PRODUCT_STATUS_CONFIG].class]"
              >
                {{ PRODUCT_STATUS_CONFIG[product.status as keyof typeof PRODUCT_STATUS_CONFIG].label }}
              </span>
              <button 
                v-if="product.status === 'PENDING'" 
                class="text-green-600 hover:text-green-800 transition-colors"
                @click="$emit('approve', product.id)"
              >
                ONAYLA
              </button>
              <button 
                class="text-blue-600 hover:text-blue-800 transition-colors" 
                @click="$emit('edit', product)"
              >
                DÜZENLE
              </button>
              <button 
                class="text-red-500 hover:text-red-700 transition-colors" 
                @click="$emit('delete', product.id)"
              >
                SİL
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
        <div class="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          TOPLAM <span class="text-gray-900">{{ pagination.total }}</span> ÜRÜN
        </div>
        <div class="flex items-center gap-2">
          <button 
            :disabled="pagination.page === 1" 
            class="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all"
            @click="$emit('pageChange', pagination.page - 1)"
          >
            Önceki
          </button>
          
          <div class="flex items-center gap-1">
            <button 
              v-for="p in visiblePages" 
              :key="p" 
              :class="pagination.page === p ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
              class="w-10 h-10 border rounded-xl font-black transition-all text-xs"
              @click="$emit('pageChange', p)"
            >
              {{ p }}
            </button>
          </div>

          <button 
            :disabled="pagination.page === pagination.pages" 
            class="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all"
            @click="$emit('pageChange', pagination.page + 1)"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppImage } from '#imports'
import type { Product } from '@barterborsa/shared-types'

interface PaginationState {
  page: number;
  total: number;
  pages: number;
}

const props = defineProps({
  products: { type: Array as () => Product[], default: () => [] },
  loading: Boolean,
  selectedIds: { type: Array as () => (string | number)[], default: () => [] },
  isAllSelected: Boolean,
  pagination: { type: Object as () => PaginationState, default: () => ({ page: 1, total: 0, pages: 1 }) }
})

defineEmits<{
  (e: 'update:selectedIds', ids: (string | number)[]): void
  (e: 'toggleSelectAll'): void
  (e: 'edit', product: Product): void
  (e: 'delete', id: string | number): void
  (e: 'approve', id: string | number): void
  (e: 'pageChange', page: number): void
}>()

const { resolveImageUrl } = useAppImage()

const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return '0.00 ₺'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const toggleId = (id: string | number) => {
  const newSelection = [...props.selectedIds]
  const index = newSelection.indexOf(id)
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(id)
  }
  return newSelection
}

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, props.pagination.page - 2)
  const end = Math.min(props.pagination.pages, start + 4)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// UI Configuration Maps
interface ProductStatusItem { label: string; class: string }
const PRODUCT_STATUS_CONFIG: Record<string, ProductStatusItem> = {
  PENDING: { label: 'ONAY BEKLİYOR', class: 'bg-amber-100 text-amber-700' },
  REJECTED: { label: 'REDDEDİLDİ', class: 'bg-red-100 text-red-700' }
}

const getStockClass = (stock: number) => {
  if (stock > 10) return 'bg-green-100 text-green-800'
  if (stock > 0) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
</script>
