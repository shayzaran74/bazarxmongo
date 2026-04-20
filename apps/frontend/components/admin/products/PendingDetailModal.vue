<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6 italic">
    <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')" />
    
    <div class="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-3xl flex flex-col overflow-hidden animate-in border border-neutral-100 max-h-[90vh]">
      <div class="p-10 border-b border-neutral-100 flex items-center justify-between">
        <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">ÜRÜN DETAYI</h3>
        <button class="w-12 h-12 bg-neutral-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-inner flex items-center justify-center text-2xl font-black" @click="$emit('close')">&times;</button>
      </div>

      <div class="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
        <div class="aspect-video rounded-[3rem] overflow-hidden border border-neutral-50 shadow-inner group">
          <img :src="resolveImageUrl(product?.image)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
        </div>

        <div class="grid grid-cols-2 gap-8">
          <div v-for="d in details" :key="d.l" class="bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100 shadow-inner hover:bg-white transition-all">
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">{{ d.l }}</p>
            <p class="text-lg font-black text-gray-900 tracking-tightest uppercase">{{ d.v }}</p>
          </div>
        </div>

        <div class="bg-neutral-50 p-10 rounded-[3rem] border border-neutral-100 shadow-inner">
           <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">AÇIKLAMA</p>
           <p class="text-lg font-black text-gray-700 leading-relaxed italic uppercase tracking-tight">{{ product?.description || 'AÇIKLAMA GİRİLMEMİŞ.' }}</p>
        </div>
      </div>

      <div class="p-10 bg-neutral-50/50 border-t border-neutral-100 flex gap-4">
        <button class="flex-1 h-16 bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm" @click="$emit('reject', product.id)">REDDET</button>
        <button class="flex-2 h-16 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-indigo-100 px-12" @click="$emit('approve', product.id)">ONAYLA</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ isOpen: Boolean, product: Object })
defineEmits(['close', 'approve', 'reject'])

const { resolveImageUrl } = useAppImage()
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)

const details = computed(() => [
  { l: 'ÜRÜN ADI', v: props.product?.name },
  { l: 'SATICI', v: props.product?.Vendor?.businessName },
  { l: 'KATEGORİ', v: props.product?.Category?.name || '-' },
  { l: 'FİYAT', v: formatPrice(props.product?.price) },
  { l: 'STOK', v: `${props.product?.stock} ADET` },
  { l: 'SKU', v: props.product?.sku || '-' }
])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
