<template>
  <div class="bg-white rounded-[3rem] border border-neutral-100 shadow-xl overflow-hidden hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-500 italic flex flex-col group">
    <!-- Header -->
    <div class="bg-neutral-50/80 p-8 flex flex-wrap justify-between items-center gap-6 border-b border-neutral-100 italic">
      <div class="flex items-center gap-5">
        <span :class="getStatusClass(chain.status)" class="px-6 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">{{ getStatusText(chain.status) }}</span>
        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">ID: #{{ chain.id.slice(-6) }}</span>
      </div>
      <div class="flex items-center gap-8">
        <div class="text-right">
          <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">SON ONAY TARİHİ</span>
          <span class="text-sm font-black text-red-500 italic">{{ formatDate(chain.expiresAt) }}</span>
        </div>
        <button class="h-12 px-8 bg-white border border-neutral-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm active:scale-95" @click="$emit('view', chain)">TAKAS DETAYI →</button>
      </div>
    </div>

    <!-- Offers Flow -->
    <div class="p-10 space-y-8 flex-1">
      <h3 class="text-xl font-black text-gray-900 uppercase tracking-tightest flex items-center gap-3 italic">
        <span class="w-2.5 h-7 bg-indigo-600 rounded-full" />
        TAKAS DÖNGÜSÜ
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        <div v-for="(offer, idx) in chain.offers" :key="offer.id" class="relative group/offer">
          <!-- Connector -->
          <div v-if="idx < chain.offers.length - 1" class="hidden lg:flex absolute -right-10 top-1/2 -translate-y-1/2 z-10 text-neutral-200 pointer-events-none group-hover:text-indigo-200 transition-colors">
            <ArrowRightIcon class="h-8 w-8" />
          </div>

          <div :class="isMyOffer(offer) ? 'border-indigo-600 shadow-2xl bg-indigo-50/30' : 'border-neutral-100 bg-white opacity-60 hover:opacity-100'" class="relative p-8 rounded-[2.5rem] border-2 transition-all group-hover/offer:scale-[1.02] duration-500">
            <div v-if="isMyOffer(offer)" class="absolute -top-3.5 left-8 px-5 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">SİZE GELEN</div>

            <div class="flex items-start gap-5 mb-6">
              <div class="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-black/5">🏢</div>
              <div>
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">GÖNDEREN</p>
                <p class="text-sm font-black text-gray-900 tracking-tight uppercase leading-none">{{ offer.fromCompany.name }}</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl mb-6 border border-neutral-100 shadow-sm transition-all group-hover/offer:shadow-md">
              <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 italic">OFFERED ITEM</p>
              <p class="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-2">{{ offer.offeredItem.title }}</p>
              <p class="text-[11px] font-black text-gray-400 uppercase opacity-60 italic">{{ offer.offeredQuantity }} ADET</p>
            </div>

            <div class="flex items-center justify-between">
              <div :class="offer.status === 'accepted' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'" class="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                 <component :is="offer.status === 'accepted' ? CheckCircleIcon : ClockIcon" class="h-4 w-4" />
                 {{ offer.status === 'accepted' ? 'ONAYLANDI' : 'BEKLENİYOR' }}
              </div>
            </div>

            <div v-if="isMyOffer(offer) && offer.status === 'pending'" class="mt-8 pt-6 border-t border-indigo-100 flex flex-col gap-3">
              <button :disabled="loading" class="w-full py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-black transition-all active:scale-95 disabled:opacity-50" @click="$emit('accept', offer.id)">TEKLİFİ KABUL ET</button>
              <button :disabled="loading" class="w-full py-3 text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all" @click="$emit('reject', offer.id)">REDDET</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRightIcon, CheckCircleIcon, ClockIcon } from '@heroicons/vue/24/solid'

defineProps({ chain: Object, myCompanyId: String, loading: Boolean })
defineEmits(['view', 'accept', 'reject'])

const isMyOffer = (offer) => offer.toCompanyId === useTradeChains().myCompany.value?.id
const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
const getStatusText = (s) => ({ PENDING: 'ONAY BEKLİYOR', COMPLETED: 'TAMAMLANDI' }[s] || s)
const getStatusClass = (s) => ({ PENDING: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-700')
</script>
