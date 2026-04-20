<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden italic">
    <div v-if="loading" class="p-24 flex flex-col items-center justify-center">
      <div class="animate-spin h-16 w-16 border-[6px] border-indigo-500/20 border-t-indigo-600 rounded-full mb-6" />
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">ENVANTER YÜKLENİYOR...</p>
    </div>

    <div v-else-if="products.length === 0" class="p-24 text-center">
      <div class="bg-neutral-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-12">
        <CubeIcon class="h-10 w-10 text-gray-200" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 uppercase">ENVANTER ŞU AN BOŞ</h3>
      <p class="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">YENİ ÜRÜNLER EKLEYEREK STOK YÖNETİMİNE BAŞLAYABİLİRSİNİZ.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-neutral-50/50">
            <th v-for="h in ['ÜRÜN BİLGİSİ', 'SKU / BARKOD', 'STOK MİKTARI', 'DURUM', 'İŞLEMLER']" :key="h" class="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{{ h }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-for="product in products" :key="product.id" class="group hover:bg-neutral-50/50 transition-all relative">
            <td class="px-10 py-8">
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center p-2 border border-black/5 group-hover:scale-110 transition-transform shadow-inner">
                  <img :src="resolveImageUrl(product.image)" :alt="product.name" class="w-full h-full object-cover rounded-xl shadow-sm">
                </div>
                <div>
                  <div class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ product.name }}</div>
                  <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ product.Category?.name || 'GENEL' }}</div>
                </div>
              </div>
            </td>
            <td class="px-10 py-8 text-sm font-black text-gray-500 uppercase tracking-tighter">{{ product.sku || 'N/A' }}</td>
            <td class="px-10 py-8">
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-black text-gray-900 tracking-tighter">{{ product.stock }}</span>
                <span class="text-[9px] font-black text-gray-400 uppercase italic">ADET</span>
              </div>
            </td>
            <td class="px-10 py-8">
              <span :class="getStockStatusClass(product)" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current opacity-80">{{ getStockStatusText(product) }}</span>
            </td>
            <td class="px-10 py-8 text-right">
              <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="px-6 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 text-[10px] font-black text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all uppercase tracking-widest" @click="$emit('history', product)">GEÇMİŞ</button>
                <button class="px-6 h-12 bg-indigo-600 rounded-xl shadow-lg text-[10px] font-black text-white hover:bg-black transition-all uppercase tracking-widest" @click="$emit('adjust', product)">STOK DÜZELT</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { CubeIcon } from '@heroicons/vue/24/outline'

defineProps({ products: Array, loading: Boolean })
defineEmits(['history', 'adjust'])

const { resolveImageUrl } = useAppImage()

const getStockStatusClass = (p) => {
  if (p.stock === 0) return 'text-red-600 bg-red-50'
  if (p.stock <= (p.lowStockThreshold || 5)) return 'text-amber-600 bg-amber-50'
  return 'text-green-600 bg-green-50'
}

const getStockStatusText = (p) => {
  if (p.stock === 0) return 'STOKTA YOK'
  if (p.stock <= (p.lowStockThreshold || 5)) return 'DÜŞÜK STOK'
  return 'YETERLİ / OPTİMAL'
}
</script>
