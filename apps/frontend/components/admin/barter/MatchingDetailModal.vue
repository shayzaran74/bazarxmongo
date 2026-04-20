<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-[100]" @close="$emit('close')">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-md" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-[3rem] bg-white p-12 text-left align-middle shadow-2xl transition-all border border-gray-100">
              <DialogTitle as="h3" class="text-3xl font-black text-gray-900 mb-10 flex items-center gap-5 italic uppercase tracking-tighter">
                <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner transform -rotate-12">🔗</div>
                Takas Zinciri Teknik Detayı
              </DialogTitle>

              <div v-if="chain" class="space-y-10">
                <div class="overflow-hidden rounded-3xl border border-gray-100 shadow-inner bg-gray-50/20">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50/50">
                        <th class="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Sıra</th>
                        <th class="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Şirketler (Veren ➜ Alan)</th>
                        <th class="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Ürün & Detay</th>
                        <th class="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Tahmini Değer</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                      <tr v-for="(offer, idx) in chain.offers" :key="offer.id" class="hover:bg-gray-50/50 transition-colors group">
                        <td class="p-6 font-black text-gray-400 italic">#{{ idx + 1 }}</td>
                        <td class="p-6">
                          <div class="space-y-1">
                            <p class="text-sm font-black text-gray-900 uppercase italic leading-tight">{{ offer.fromCompany?.name }}</p>
                            <div class="flex items-center gap-2 text-indigo-400">
                              <span class="text-xs">➜</span>
                              <p class="text-[10px] font-bold text-gray-500 uppercase italic">{{ offer.toCompany?.name }}</p>
                            </div>
                          </div>
                        </td>
                        <td class="p-6">
                          <div class="space-y-1">
                            <p class="text-sm font-black text-indigo-600 uppercase italic leading-tight">{{ offer.offeredItem?.title }}</p>
                            <p class="text-[10px] text-gray-400 font-bold uppercase">{{ offer.offeredQuantity }} {{ offer.offeredItem?.unit }}</p>
                          </div>
                        </td>
                        <td class="p-6 text-right font-black text-gray-900 italic tracking-tighter">{{ formatPrice(offer.offeredValue) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-10 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-inner">
                  <div>
                    <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Algoritma Skoru</p>
                    <p class="text-2xl font-black text-indigo-600 italic tracking-tighter uppercase leading-none">%{{ chain.matchScore }} Hassasiyet</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Toplam Döngü Hacmi</p>
                    <p class="text-3xl font-black text-indigo-900 italic tracking-tighter">{{ formatPrice(chain.totalValue) }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-12 flex justify-end gap-4 italic uppercase font-black text-[10px] tracking-widest">
                <button class="px-10 py-5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl transition-all" @click="$emit('close')">Vazgeç</button>
                <button v-if="chain?.status === 'DRAFT'" class="px-12 py-5 bg-gray-900 text-white rounded-2xl shadow-2xl shadow-gray-200 hover:bg-black transition-all" @click="$emit('approve', chain.id)">Şimdi Onayla</button>
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
defineEmits(['close', 'approve'])
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
</script>
