<script setup lang="ts">
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
import type { Category, Product } from '@barterborsa/shared-types'

interface Props {
  name: string
  brand: string
  productType: string
  foundCatalogProduct: Product | null
  isEditing: boolean
  mainCategories: Category[]
  subCategories1: Category[]
  subCategories2: Category[]
  selectedMainCategory: string
  selectedSubCategory1: string
  selectedSubCategory2: string
}

defineProps<Props>()
const emit = defineEmits([
  'update:name', 
  'update:brand', 
  'update:productType',
  'update:selectedMainCategory',
  'update:selectedSubCategory1',
  'update:selectedSubCategory2',
  'change:mainCategory',
  'change:subCategory1',
  'change:subCategory2'
])
</script>

<template>
  <section
    id="basics"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    :class="{ 'opacity-50 grayscale select-none pointer-events-none': foundCatalogProduct && !isEditing }"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-indigo-100 p-2 rounded-lg">
          <ShoppingBagIcon class="h-5 w-5 text-indigo-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          2. Temel Ürün Bilgileri
        </h3>
      </div>
      <span
        v-if="foundCatalogProduct"
        class="text-[10px] font-black tracking-widest text-green-600 uppercase bg-green-100 px-2 py-1 rounded-md"
      >
        Katalogdan Geliyor
      </span>
    </div>
    <div class="p-6 space-y-6">
      <div>
        <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Ürün Başlığı *</label>
        <input
          :value="name"
          type="text"
          required
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          placeholder="Marka + Model + Özellik (Örn: Apple iPhone 15 Pro 256GB)"
          @input="e => emit('update:name', (e.target as HTMLInputElement).value)"
        >
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Marka</label>
          <input
            :value="brand"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            placeholder="Örn: Nike, Samsung, Pasabahce"
            @input="e => emit('update:brand', (e.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Ürün Türü / Grubu</label>
          <input
            :value="productType"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            placeholder="Örn: Giyim, Aksesuar"
            @input="e => emit('update:productType', (e.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <div>
        <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
          Kategori Seçimi (Marketplace Hiyerarşisi) *
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            :value="selectedMainCategory"
            class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
            @change="e => {
              emit('update:selectedMainCategory', (e.target as HTMLSelectElement).value)
              emit('change:mainCategory')
            }"
          >
            <option value="">
              Ana Kategori
            </option>
            <option
              v-for="cat in mainCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>

          <select
            v-if="selectedMainCategory && subCategories1.length > 0"
            :value="selectedSubCategory1"
            class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
            @change="e => {
              emit('update:selectedSubCategory1', (e.target as HTMLSelectElement).value)
              emit('change:subCategory1')
            }"
          >
            <option value="">
              Alt Kategori
            </option>
            <option
              v-for="cat in subCategories1"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>

          <select
            v-if="selectedSubCategory1 && subCategories2.length > 0"
            :value="selectedSubCategory2"
            class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
            @change="e => {
              emit('update:selectedSubCategory2', (e.target as HTMLSelectElement).value)
              emit('change:subCategory2')
            }"
          >
            <option value="">
              Alt Kategori (Detay)
            </option>
            <option
              v-for="cat in subCategories2"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>
