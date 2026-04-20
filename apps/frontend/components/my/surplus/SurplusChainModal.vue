<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-[100]" @close="$emit('close')">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-md" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-[3rem] bg-white p-12 text-left align-middle shadow-2xl transition-all border border-gray-100">
              <DialogTitle as="h3" class="text-3xl font-black text-gray-900 mb-10 flex items-center gap-5 italic uppercase tracking-tighter">
                <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner transform -rotate-12">🔗</div>
                Takas Zinciri Detayı
              </DialogTitle>

              <div v-if="chain" class="space-y-8 italic">
                <div class="flex justify-between items-center bg-neutral-50 p-6 rounded-2xl border border-gray-100 italic shadow-inner">
                  <div class="flex flex-col">
                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none italic">ZİNCİR DURUMU</span>
                    <span :class="getStatusClass(chain.status)" class="text-sm font-black uppercase tracking-widest leading-none">{{ chain.status === 'PENDING' ? 'ONAY BEKLİYOR' : chain.status }}</span>
                  </div>
                  <div class="text-right">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">ZİNCİR KİMLİĞİ</p>
                    <p class="text-sm font-black text-indigo-600 tracking-widest uppercase italic">#{{ chain.id.slice(-8).toUpperCase() }}</p>
                  </div>
                </div>

                <div class="space-y-6">
                  <div v-for="(offer, idx) in chain.offers" :key="offer.id" class="p-8 bg-white border-2 border-dashed border-gray-100 rounded-3xl relative hover:border-indigo-200 transition-colors">
                    <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm">{{ idx + 1 }}</div>
                    
                    <div class="flex justify-between items-start mb-6">
                      <div class="space-y-1">
                        <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block italic leading-none">İŞLEM ROTASI</span>
                        <p class="text-base font-black text-gray-900 uppercase italic tracking-tighter">{{ offer.fromCompany?.name }} ➜ {{ offer.toCompany?.name }}</p>
                      </div>
                      <div class="text-right space-y-1">
                        <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block italic leading-none">TAHMİNİ DEĞER</span>
                        <p class="text-lg font-black text-green-600 italic tracking-tighter leading-none">{{ formatCurrency(offer.offeredValue) }}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-5 p-5 bg-neutral-50/50 rounded-2xl shadow-inner border border-gray-50 italic">
                      <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center text-xl">📦</div>
                      <div class="min-w-0">
                        <p class="text-sm font-black text-gray-800 uppercase tracking-tight truncate">{{ offer.offeredItem?.title || 'Ürün' }}</p>
                        <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">{{ offer.offeredQuantity }} BİRİM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="chain.status === 'PENDING' && chain.expiresAt" class="p-6 bg-amber-50 rounded-2xl border border-amber-100 italic flex items-center gap-4">
                  <span class="text-2xl">⏰</span>
                  <p class="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-loose">BU TAKAS DÖNGÜSÜ İÇİN SON ONAY TARİHİ: {{ formatDate(chain.expiresAt) }}</p>
                </div>
              </div>

              <div class="mt-12 flex justify-between gap-4 italic uppercase font-black text-[10px] tracking-widest">
                <NuxtLink v-if="chain" to="/my/trades" class="flex-1 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  <span>🚀</span> İŞLEMLERE GİT
                </NuxtLink>
                <button class="px-12 h-16 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl transition-all" @click="$emit('close')">KAPAT</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
defineProps({ isOpen: Boolean, chain: Object })
defineEmits(['close'])

const getStatusClass = (s) => {
  switch (s) {
    case 'PENDING': return 'text-amber-600'
    case 'COMPLETED': return 'text-green-600'
    case 'FAILED': return 'text-red-600'
    default: return 'text-gray-400'
  }
}
const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
</script>
