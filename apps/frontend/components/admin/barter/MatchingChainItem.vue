<template>
  <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
    <!-- Chain Header -->
    <div class="bg-gray-50/50 p-6 md:px-10 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 italic">
      <div class="flex items-center gap-4">
        <span class="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-indigo-100 uppercase tracking-widest">
          ID: {{ chain.id.slice(-6) }}
        </span>
        <span :class="getStatusClass(chain.status)" class="px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border">
          {{ chain.status }}
        </span>
        <span class="text-[10px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest">
          📅 {{ formatDate(chain.createdAt) }}
        </span>
      </div>
      <div class="flex items-center gap-8">
        <div class="text-right">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Toplam Değer</p>
          <p class="text-xl font-black text-gray-900 tracking-tighter">{{ formatPrice(chain.totalValue) }}</p>
        </div>
        <div class="text-right">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Eşleşme Skoru</p>
          <div class="flex items-center gap-3">
            <div class="w-20 bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-600 shadow-sm" :style="{ width: chain.matchScore + '%' }" />
            </div>
            <p class="text-lg font-black text-indigo-600">%{{ chain.matchScore }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chain Visual Flow -->
    <div class="p-10 md:p-14">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-12 relative">
        <div v-for="(offer, index) in chain.offers" :key="offer.id" class="flex-1 w-full max-w-sm relative z-10 group/item">
          <div class="bg-white p-8 rounded-[2rem] border-2 border-transparent bg-gray-50/30 shadow-sm relative group-hover/item:border-indigo-200 transition-all">
            <!-- Step Connectors -->
            <div v-if="index < chain.offers.length - 1" class="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 z-0 font-black text-indigo-200 text-4xl animate-pulse">➜</div>
            <div v-if="index < chain.offers.length - 1" class="lg:hidden flex justify-center my-6 font-black text-indigo-200 text-4xl animate-pulse">⬇️</div>

            <div class="flex items-start gap-4 mb-6">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm transform group-hover/item:-rotate-6 transition-transform">
                <span class="text-xl">🏢</span>
              </div>
              <div class="min-w-0">
                <h4 class="font-black text-gray-900 truncate uppercase italic tracking-tighter leading-tight">{{ offer.fromCompany?.name }}</h4>
                <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest italic">GÖNDERİCİ</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl mb-6 shadow-inner border border-gray-50 flex items-center gap-4">
              <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">📦</div>
              <div class="min-w-0">
                <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest truncate">{{ offer.offeredItem?.title }}</p>
                <p class="text-sm font-black text-indigo-600 italic tracking-tighter">{{ formatPrice(offer.offeredValue) }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-gray-100">
              <div class="min-w-0">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">ALICI</p>
                <p class="text-[10px] font-black text-gray-700 truncate uppercase italic">{{ offer.toCompany?.name }}</p>
              </div>
              <div class="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shadow-sm">
                <span class="text-sm">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 italic">
      <button class="px-8 py-3 bg-white border border-gray-200 text-gray-600 text-[10px] font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest shadow-sm" @click="$emit('view', chain)">Detaylar</button>
      <button v-if="chain.status === 'DRAFT'" class="px-8 py-3 bg-white border border-red-100 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-50 transition-all uppercase tracking-widest" @click="$emit('delete', chain.id)">Sil</button>
      <button v-if="chain.status === 'DRAFT'" class="px-8 py-3 bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-black transition-all uppercase tracking-widest shadow-xl" @click="$emit('approve', chain.id)">Zinciri Onayla</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ chain: Object })
defineEmits(['view', 'delete', 'approve'])

const getStatusClass = (status) => {
  switch (status) {
    case 'DRAFT': return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'PENDING': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-100'
    case 'FAILED': return 'bg-red-50 text-red-600 border-red-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
</script>
