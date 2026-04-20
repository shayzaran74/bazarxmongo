<template>
  <div id="products-list" class="animate-in italic uppercase">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-neutral-100 gap-4">
      <h2 class="text-3xl font-black text-gray-900 tracking-tighter leading-none italic">
        MAĞAZA ÜRÜNLERİ
        <span class="text-[10px] font-black text-gray-400 ml-4 tracking-[0.2em] uppercase italic">({{ total }} ÜRÜN LİSTELENDİ)</span>
      </h2>
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-black text-gray-300 tracking-widest italic">SIRALAMA:</span>
        <select class="bg-transparent text-[10px] font-black uppercase tracking-widest italic outline-none cursor-pointer hover:text-indigo-600 transition-colors">
          <option>VARSAYILAN</option>
          <option>YENİDEN ESKİYE</option>
          <option>FİYAT (ARTAN)</option>
          <option>FİYAT (AZALAN)</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && products.length === 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
      <div v-for="i in 8" :key="i" class="animate-pulse space-y-6">
        <div class="aspect-square bg-neutral-100 rounded-[2.5rem] shadow-inner" />
        <div class="space-y-3">
          <div class="h-5 bg-neutral-100 rounded-xl w-3/4" />
          <div class="h-5 bg-neutral-100 rounded-xl w-1/2" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-32 bg-white rounded-[3.5rem] border border-dashed border-gray-100 shadow-sm">
      <div class="w-24 h-24 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-12">
        <ShoppingBagIcon class="h-10 w-10 text-gray-200" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 mb-2 italic">ÜRÜN BULUNAMADI</h3>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic max-w-xs mx-auto">ARAMA KRİTERLERİNİZE UYGUN ÜRÜN BULUNAMADI VEYA HENÜZ ÜRÜN EKLENMEMİŞ.</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <div v-for="product in products" :key="product.id" class="group bg-white rounded-[2.5rem] border border-neutral-100/50 overflow-hidden hover:shadow-2xl transition-all duration-700 flex flex-col h-full hover:-translate-y-3 relative shadow-sm italic">
        <!-- Product Image -->
        <div class="aspect-square overflow-hidden relative cursor-pointer" @click="navigateToProduct(product.id)">
          <div v-if="product.badgeText" class="absolute top-4 left-4 px-4 py-1.5 rounded-xl text-[9px] font-black text-white shadow-xl z-10 italic uppercase tracking-widest transform -rotate-6" :style="{ backgroundColor: product.badgeColor || '#ef4444' }">
            {{ product.badgeText }}
          </div>
          <NuxtImg :src="getImageUrl(product) || '/images/placeholder.png'" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" placeholder />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

          <div class="absolute bottom-4 left-4 right-4 translate-y-16 group-hover:translate-y-0 transition-all duration-500">
            <button class="w-full bg-white hover:bg-neutral-900 hover:text-white text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 italic" @click.stop="$emit('add-to-cart', product)">
              <ShoppingCartIcon class="h-4 w-4" />
              SEPETE EKLE
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="p-6 flex-1 flex flex-col cursor-pointer" @click="navigateToProduct(product.id)">
          <h3 class="text-xs font-black text-gray-900 mb-4 line-clamp-2 min-h-[40px] leading-tight group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">{{ product.name }}</h3>
          <div class="mt-auto flex items-end justify-between gap-4 border-t border-neutral-50 pt-4">
            <div class="flex flex-col">
              <span v-if="product.compareAtPrice" class="text-[9px] text-gray-300 line-through font-black uppercase italic">{{ formatPrice(product.compareAtPrice) }}</span>
              <span class="text-xl font-black text-gray-900 tracking-tighter italic">{{ formatPrice(product.price) }}</span>
            </div>
            <div class="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <PlusIcon class="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMore" class="mt-20 text-center">
      <button class="px-14 py-5 bg-white border border-neutral-100 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:shadow-2xl hover:bg-neutral-50 transition-all flex items-center gap-4 mx-auto italic disabled:opacity-50 group" :disabled="loading" @click="$emit('load-more')">
        <span v-if="loading" class="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <span v-else class="flex items-center gap-2">DAHA FAZLA ÜRÜN <ArrowDownIcon class="h-4 w-4 group-hover:translate-y-1 transition-transform" /></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ShoppingBagIcon, ShoppingCartIcon, PlusIcon, ArrowDownIcon } from '@heroicons/vue/24/outline'
defineProps({ products: Array, loading: Boolean, hasMore: Boolean, total: Number })
defineEmits(['add-to-cart', 'load-more'])

const navigateToProduct = (id) => navigateTo(`/products/${id}`)
const getImageUrl = (p) => {
  if (!p?.image) return '/images/placeholder.png'
  return typeof p.image === 'string' ? p.image : p.image.url
}
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
</script>
