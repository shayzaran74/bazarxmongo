<template>
  <div class="group bg-white rounded-[3rem] p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative italic">
    <div class="aspect-video rounded-[2rem] overflow-hidden mb-6 bg-gray-50 border border-gray-100 relative">
      <img :src="image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
      <div v-if="hasChain" class="absolute inset-0 bg-indigo-600/10 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transform -rotate-2">ZİNCİR EŞLEŞMESİ AKTİF</span>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="px-4 py-1.5 bg-neutral-50 text-[9px] font-black text-gray-400 uppercase tracking-widest rounded-full border border-gray-100 shadow-inner italic">{{ item.category }}</span>
        <span :class="getStatusClass(item.status)" class="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm">
          {{ item.status }}
        </span>
      </div>

      <h3 class="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight truncate px-1">{{ item.title }}</h3>

      <div class="flex items-center justify-between text-[10px] font-black text-gray-400 border-t border-gray-50 pt-6 px-1">
        <div class="flex flex-col">
          <span class="text-[8px] text-gray-300 uppercase tracking-widest mb-1 italic">Mevcut Stok</span>
          <span class="text-gray-900 italic tracking-tighter text-sm">{{ item.quantity }} {{ item.unit }}</span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-[8px] text-gray-300 uppercase tracking-widest mb-1 italic">Tahmini Değer</span>
          <span class="text-indigo-600 italic tracking-tighter text-base">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
        </div>
      </div>

      <button v-if="item.status === 'traded'" class="w-full mt-4 py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm italic" @click.stop="$emit('reactivate', item)">
        🔄 Yeniden Aktif Et
      </button>

      <div v-if="hasChain" class="mt-4 p-4 bg-indigo-50/50 rounded-2xl flex items-center justify-between group/chain cursor-pointer hover:bg-indigo-600 transition-all border border-indigo-100/50" @click.stop="$emit('viewChain')">
        <div class="flex items-center gap-3">
          <span class="text-xl">🤝</span>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest group-hover/chain:text-white transition-colors">AKILLI TAKAS EŞLEŞMESİ</span>
        </div>
        <span class="text-[14px] font-black text-indigo-400 group-hover/chain:text-white transition-colors italic">➜</span>
      </div>
    </div>

    <!-- Actions Overlay -->
    <div class="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
      <button class="bg-gray-900 text-white p-3 rounded-2xl hover:bg-black transition-all shadow-2xl" @click.stop="$emit('edit', item)">
        <PencilSquareIcon class="h-5 w-5" />
      </button>
      <button class="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 transition-all shadow-2xl" @click.stop="$emit('delete', item.id)">
        <TrashIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
const props = defineProps({ item: Object, hasChain: Boolean })
defineEmits(['edit', 'delete', 'reactivate', 'viewChain'])

const image = computed(() => {
  if (props.item?.images?.length > 0) {
    const img = props.item.images[0]
    return typeof img === 'string' ? img : img.url
  }
  return '/placeholder-surplus.jpg'
})

const getStatusClass = (status) => {
  switch (status) {
    case 'active': return 'bg-green-50 text-green-600 border-green-100'
    case 'traded': return 'bg-amber-50 text-amber-600 border-amber-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
</script>
