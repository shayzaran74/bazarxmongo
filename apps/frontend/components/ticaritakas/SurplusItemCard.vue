<!-- apps/frontend/components/ticaritakas/SurplusItemCard.vue -->
<template>
  <div class="group bg-white rounded-[3rem] p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative italic">
    <div class="aspect-video rounded-[2rem] overflow-hidden mb-6 bg-gray-50 border border-gray-100 relative">
      <img :src="image" :alt="item.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
      <div v-if="hasChain" class="absolute inset-0 bg-indigo-600/10 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transform -rotate-2">ZİNCİR EŞLEŞMESİ AKTİF</span>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="px-4 py-1.5 bg-neutral-50 text-[9px] font-black text-gray-400 uppercase tracking-widest rounded-full border border-gray-100 shadow-inner italic">{{ item.category }}</span>
        <span :class="statusClass" class="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm">
          {{ statusLabel }}
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

      <button
        v-if="item.status === 'traded'"
        class="w-full mt-4 py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm italic"
        @click.stop="$emit('reactivate', item)"
      >
        🔄 Yeniden Aktif Et
      </button>

      <div
        v-if="hasChain"
        class="mt-4 p-4 bg-indigo-50/50 rounded-2xl flex items-center justify-between group/chain cursor-pointer hover:bg-indigo-600 transition-all border border-indigo-100/50"
        @click.stop="$emit('viewChain')"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">🤝</span>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest group-hover/chain:text-white transition-colors">AKILLI TAKAS EŞLEŞMESİ</span>
        </div>
        <span class="text-[14px] font-black text-indigo-400 group-hover/chain:text-white transition-colors italic">➜</span>
      </div>
    </div>

    <!-- Aksiyon overlay -->
    <div class="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
      <button class="bg-gray-900 text-white p-3 rounded-2xl hover:bg-black transition-all shadow-2xl" @click.stop="$emit('edit', item)">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      </button>
      <button class="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 transition-all shadow-2xl" @click.stop="$emit('delete', item.id)">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SurplusItem {
  id: string
  title: string
  category?: string
  status: string
  quantity: number
  unit?: string
  unitPrice: number
  images?: (string | { url: string })[]
}

const props = defineProps<{
  item: SurplusItem
  hasChain?: boolean
}>()

defineEmits<{
  edit: [item: SurplusItem]
  delete: [id: string]
  reactivate: [item: SurplusItem]
  viewChain: []
}>()

const config = useRuntimeConfig()

const image = computed((): string => {
  if (!props.item?.images?.length) return '/placeholder-surplus.jpg'
  const img = props.item.images[0]
  const url = typeof img === 'string' ? img : img.url
  if (!url) return '/placeholder-surplus.jpg'
  return url.startsWith('http') ? url : `${config.public.apiBase}${url}`
})

const statusClass = computed((): string => {
  switch (props.item.status) {
    case 'ACTIVE':   case 'active':   return 'bg-green-50 text-green-600 border-green-100'
    case 'PENDING':  case 'pending':  return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'REJECTED': case 'rejected': return 'bg-red-50 text-red-500 border-red-100'
    case 'TRADED':   case 'traded':   return 'bg-indigo-50 text-indigo-600 border-indigo-100'
    default:                          return 'bg-gray-50 text-gray-500 border-gray-100'
  }
})

const statusLabel = computed((): string => {
  switch (props.item.status?.toUpperCase()) {
    case 'ACTIVE':   return 'AKTİF'
    case 'PENDING':  return 'ONAY BEKLİYOR'
    case 'REJECTED': return 'REDDEDİLDİ'
    case 'TRADED':   return 'TAKAS EDİLDİ'
    default:         return props.item.status
  }
})

const formatPrice = (p: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
</script>
