<template>
  <div v-if="vendor?.showFlashSales && (vendor?.flashProducts?.length || 0) > 0" class="mb-16 animate-in">
    <div class="flex items-center justify-between mb-10 italic uppercase">
      <div class="flex items-center gap-5">
        <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner transform -rotate-12">
          <BoltIcon class="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h2 class="text-4xl font-black text-gray-900 tracking-tighter italic leading-none">FLAŞ FIRSATLAR</h2>
          <p class="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-1">SINIRLI SÜRE & SINIRLI STOK</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center gap-2">
        <div class="px-6 py-3 bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-amber-50 flex items-center gap-4 border-b-4 border-b-amber-500">
          <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest block italic">BİTİŞE KALAN</span>
          <span class="text-xl font-black text-gray-900 tracking-tighter">02:45:12</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div v-for="product in vendor.flashProducts" :key="'flash-' + product.id" class="group bg-white rounded-[2.5rem] border border-amber-100/50 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-3 relative shadow-sm italic">
        <div class="absolute top-4 right-4 z-10 bg-amber-500 text-white p-2 rounded-xl shadow-2xl transform rotate-6 scale-110">
          <BoltIcon class="h-5 w-5" />
        </div>

        <div class="aspect-square overflow-hidden relative cursor-pointer" @click="navigateToProduct(product.id)">
          <NuxtImg :src="getImageUrl(product)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div class="absolute bottom-4 left-4 right-4 translate-y-16 group-hover:translate-y-0 transition-all duration-500">
            <button class="w-full bg-amber-500 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3" @click.stop="$emit('add-to-cart', product)">
              <ShoppingCartIcon class="h-4 w-4" />
              SEPETE EKLE
            </button>
          </div>
        </div>

        <div class="p-6 flex-1 flex flex-col">
          <h3 class="text-xs font-black text-gray-900 mb-3 line-clamp-2 min-h-[40px] uppercase italic tracking-tight group-hover:text-amber-600 transition-colors">{{ product.name }}</h3>
          <div class="mt-auto flex items-end justify-between border-t border-amber-50 pt-4">
            <div class="flex flex-col">
              <span class="text-[9px] text-gray-300 line-through font-black uppercase italic">{{ formatPrice(product.compareAtPrice || product.price * 1.5) }}</span>
              <span class="text-xl font-black text-amber-600 tracking-tighter italic">{{ formatPrice(product.price) }}</span>
            </div>
            <div class="bg-amber-50 text-amber-600 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-amber-100">-%{{ Math.round((1 - product.price / (product.compareAtPrice || product.price * 1.5)) * 100) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BoltIcon, ShoppingCartIcon } from '@heroicons/vue/24/solid'
defineProps({ vendor: Object })
defineEmits(['add-to-cart'])

const navigateToProduct = (id) => navigateTo(`/products/${id}`)
const getImageUrl = (p) => {
  if (!p?.image) return '/images/placeholder.png'
  return typeof p.image === 'string' ? p.image : p.image.url
}
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
</script>
