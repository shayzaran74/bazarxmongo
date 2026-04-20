<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-[100]" @close="$emit('close')">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-6">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-[4rem] bg-white p-12 text-left shadow-3xl transition-all border border-neutral-100 italic">
              <div class="flex items-center justify-between mb-10">
                <DialogTitle as="h3" class="text-3xl font-black text-gray-900 uppercase tracking-tightest leading-none">TAKAS ZİNCİRİ DETAYI</DialogTitle>
                <button class="w-14 h-14 bg-neutral-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-inner flex items-center justify-center text-3xl font-black" @click="$emit('close')">&times;</button>
              </div>

              <div v-if="chain" class="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                <div v-for="offer in chain.offers" :key="offer.id" class="p-8 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 shadow-inner space-y-8">
                  <div class="flex justify-between items-start italic">
                    <div class="space-y-2">
                      <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">PROTOKOL ROTASI</p>
                      <p class="text-lg font-black text-gray-900 tracking-tightest uppercase">{{ offer.fromCompany.name }} <span class="text-indigo-600">➜</span> {{ offer.toCompany.name }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">TAHMİNİ DEĞER</p>
                      <p class="text-xl font-black text-indigo-600 tracking-tightest">{{ formatCurrency(offer.offeredValue) }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-6 pt-8 border-t border-black/5">
                    <div class="w-16 h-16 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center text-3xl">📦</div>
                    <div>
                      <p class="text-lg font-black text-gray-800 tracking-tight uppercase leading-none">{{ offer.offeredItem.title }}</p>
                      <p class="text-[11px] font-black text-gray-400 uppercase mt-2 italic opacity-60">{{ offer.offeredQuantity }} {{ offer.offeredItem.unit || 'ADET' }}</p>
                    </div>
                  </div>

                  <div v-if="isMyOffer(offer) || isMine(offer)" class="pt-4 flex flex-col gap-4">
                     <button class="w-full h-16 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-50 shadow-sm flex items-center justify-center gap-4 group" @click="$emit('chat', offer.id)">
                       <span class="text-lg group-hover:scale-125 transition-transform">💬</span>
                       SOHBETİ BAŞLAT ({{ isMyOffer(offer) ? 'GELEN' : 'GİDEN' }} TEKLİF)
                     </button>
                     
                     <div v-if="activeChatId === offer.id" class="animate-in fade-in slide-in-from-top-4 duration-500">
                        <ChatWindow :trade-offer-id="offer.id" class="rounded-[2rem] border border-indigo-100 overflow-hidden shadow-2xl h-[400px]" />
                     </div>
                  </div>
                </div>
              </div>

              <div class="mt-12 flex justify-end">
                <button class="h-16 px-12 bg-neutral-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all" @click="$emit('close')">KAPAT</button>
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
import ChatWindow from '~/components/chat/ChatWindow.vue'

const props = defineProps({ isOpen: Boolean, chain: Object, activeChatId: String })
defineEmits(['close', 'chat'])

const { myCompany } = useTradeChains()
const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
const isMyOffer = (o) => o.toCompanyId === myCompany.value?.id
const isMine = (o) => o.fromCompanyId === myCompany.value?.id
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
