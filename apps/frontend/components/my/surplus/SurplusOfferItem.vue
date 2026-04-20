<template>
  <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all group italic">
    <div class="flex items-center gap-6 flex-1 w-full">
      <div class="relative w-24 h-24 shrink-0">
        <img :src="itemImage" class="w-full h-full rounded-[2rem] object-cover bg-gray-50 border border-neutral-100 shadow-inner group-hover:scale-105 transition-transform">
        <div class="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-sm border border-gray-50">
          {{ isReceived ? '📥' : '📤' }}
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">
          {{ isReceived ? 'TEKLİF EDEN' : 'ALICI' }}
        </p>
        <h4 class="text-xl font-black text-gray-900 uppercase tracking-tighter truncate italic leading-tight mb-2">
          {{ isReceived ? offer.fromCompany?.name : offer.toCompany?.name }}
        </h4>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">ÜRÜN:</span>
          <span class="text-[11px] font-black text-gray-700 uppercase italic truncate">{{ isReceived ? offer.offeredItem?.title : offer.requestedItem?.title }}</span>
        </div>
      </div>
    </div>

    <div class="px-8 py-3 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-inner flex flex-col items-center min-w-[180px]">
      <p class="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1 italic">DURUM</p>
      <span :class="statusClass" class="text-[10px] font-black uppercase tracking-widest text-center">
        {{ displayStatus }}
      </span>
    </div>

    <div class="flex items-center gap-3 w-full md:w-auto">
      <template v-if="isReceived && ['pending', 'waiting_approval', 'PENDING', 'WAITING_APPROVAL'].includes(offer.status)">
        <button class="flex-1 md:flex-none h-12 px-8 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 italic" @click="$emit('accept', offer.id)">KABUL ET</button>
        <button class="flex-1 md:flex-none h-12 px-8 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 italic" @click="$emit('reject', offer.id)">REDDET</button>
      </template>
      <template v-else-if="offer.status === 'accepted'">
        <NuxtLink :to="`/my/offers?offerId=${offer.id}&type=${activeTab}`" class="flex-1 md:flex-none h-12 px-6 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 flex items-center justify-center transition-all italic">💬 SOHBET</NuxtLink>
        <NuxtLink :to="`/my/surplus/swap/${offer.id}`" class="flex-1 md:flex-none h-12 px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center justify-center transition-all shadow-xl italic">KONTROL PANELİ</NuxtLink>
      </template>
      <div v-else class="text-right">
        <p class="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">İŞLEM TARİHİ</p>
        <p class="text-[11px] font-black text-gray-600 italic tracking-widest uppercase">{{ formatDate(offer.createdAt) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ offer: Object, activeTab: String })
defineEmits(['accept', 'reject'])

const isReceived = computed(() => props.activeTab === 'received')

const itemImage = computed(() => {
  const item = isReceived.value ? props.offer.offeredItem : props.offer.requestedItem
  if (item?.images?.length > 0) {
    const img = item.images[0]
    return typeof img === 'string' ? img : img.url
  }
  return '/placeholder-surplus.jpg'
})

const statusClass = computed(() => {
  switch (props.offer.status) {
    case 'accepted': case 'completed': return 'text-green-600'
    case 'rejected': return 'text-red-600'
    case 'pending': case 'waiting_approval': return 'text-amber-600'
    default: return 'text-gray-400'
  }
})

const displayStatus = computed(() => {
  const s = props.offer.status
  if (s === 'waiting_approval' || s === 'WAITING_APPROVAL') return 'YÖNETİCİ ONAYI BEKLİYOR'
  if (s === 'pending' || s === 'PENDING') return isReceived.value ? 'YANITINIZI BEKLİYOR' : 'KARŞI TARAF BEKLENİYOR'
  if (s === 'accepted') return 'TAKAS SÜRECİNDE'
  if (s === 'completed') return 'TAMAMLANDI'
  return s.toUpperCase()
})

const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
</script>
