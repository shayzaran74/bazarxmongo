<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-xl" @click="$emit('close')" />

    <div class="relative bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-2xl overflow-hidden transform transition-all animate-modal-in border border-white/20">

      <!-- Header -->
      <div class="relative p-10 bg-gray-900 overflow-hidden">
        <div class="absolute -right-20 -top-20 w-60 h-60 bg-primary-600 rounded-full blur-[100px] opacity-30" />
        <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] opacity-20" />
        <div class="relative z-10 flex items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-3xl font-black text-white uppercase tracking-tightest italic flex items-center">
              <ArrowsRightLeftIcon class="h-8 w-8 mr-4 text-primary-500" />
              {{ isCounter ? 'KARŞI TEKLİF' : 'TAKAS TEKLİFİ' }}
            </h2>
            <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-12">PROFESSIONAL TRADING OFFER</p>
          </div>
          <button class="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-white/50 hover:text-white" @click="$emit('close')">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div class="p-10 max-h-[70vh] overflow-y-auto scrollbar-thin bg-[#fcfcfc]">
        <form class="space-y-10" @submit.prevent="submitOffer">

          <!-- Comparison -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-4">
              <p class="text-[9px] font-black text-primary-600 uppercase tracking-widest italic">İSTEDİĞİNİZ ÜRÜN</p>
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-2xl bg-gray-50 p-1 border border-black/5 overflow-hidden flex-shrink-0">
                  <img :src="getMainImage(item)" class="w-full h-full object-cover rounded-xl">
                </div>
                <div>
                  <h4 class="text-sm font-black text-gray-900 uppercase leading-snug">{{ item.title }}</h4>
                  <p class="text-[10px] font-bold text-gray-400 mt-0.5 uppercase">{{ item.company?.name }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-900 rounded-[2rem] p-6 text-white space-y-4 relative overflow-hidden">
              <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl" />
              <p class="text-[9px] font-black text-primary-400 uppercase tracking-widest italic">TEKLİF EDİLEN</p>
              <div v-if="selectedItems.length > 0" class="space-y-3 max-h-32 overflow-y-auto">
                <div v-for="sel in selectedItems" :key="sel.id" class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-white/10 p-0.5 border border-white/5 overflow-hidden flex-shrink-0">
                    <img :src="getMainImage(sel)" class="w-full h-full object-cover rounded-lg">
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-black text-white uppercase leading-snug truncate">{{ sel.title }}</p>
                    <p class="text-[9px] font-bold text-gray-500 uppercase">STOK: {{ sel.availableQuantity }}</p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <input
                      @update:modelValue="updateOfferedItemQty(sel.id, $event)"
                      type="number"
                      step="0.01"
                      :max="sel.availableQuantity"
                      class="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs font-black text-white text-center"
                      min="0.01"
                    >
                    <button type="button" class="text-white/40 hover:text-red-400 transition-colors" @click="removeOfferedItem(sel.id)">
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="flex items-center space-x-4 h-16">
                <div class="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                  <InformationCircleIcon class="h-6 w-6 text-white/20" />
                </div>
                <p class="text-xs font-black text-white/30 uppercase italic">Henüz seçilmedi</p>
              </div>
            </div>
          </div>

          <!-- Fields -->
          <div class="space-y-8">
            <!-- Multi-Item Selector -->
            <div class="space-y-3">
              <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">KENDİ ÜRÜNLERİNİZİ SEÇİN</label>
              <div v-if="myItems.length > 0" class="space-y-3">
                <div class="relative">
                  <select
                    id="item-select"
                    class="w-full bg-white border border-gray-100 rounded-3xl px-8 py-5 text-sm font-black text-gray-900 uppercase shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    @change="addOfferedItem(($event.target as HTMLSelectElement).value)"
                  >
                    <option value="" disabled>Ürün eklemek için seçin...</option>
                    <option v-for="it in availableToAdd" :key="it.id" :value="it.id">
                      {{ it.title }} | KALAN: {{ it.availableQuantity }} {{ it.unit }}
                    </option>
                  </select>
                  <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDownIcon class="h-5 w-5" />
                  </div>
                </div>
                <div v-if="myItems.length === 0" class="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center text-amber-700">
                  <InformationCircleIcon class="h-10 w-10 mr-4 opacity-50" />
                  <p class="text-xs font-black uppercase tracking-tight italic">Takas yapabilmek için önce bir ürün eklemelisiniz.</p>
                </div>
              </div>
              <div v-else class="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center text-amber-700">
                <InformationCircleIcon class="h-10 w-10 mr-4 opacity-50" />
                <p class="text-xs font-black uppercase tracking-tight italic">Takas yapabilmek için önce bir ürün eklemelisiniz.</p>
              </div>
            </div>

            <!-- Cash -->
            <div class="space-y-4">
              <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">NAKİT FARKI (ALICIYA / TEKLİFÇİYE)</label>
              <div class="flex items-center gap-4">
                <select v-model="formData.cashDirection" class="bg-white border border-gray-100 rounded-3xl px-6 py-4 text-xs font-black text-gray-700 uppercase shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all">
                  <option value="NONE">Fark yok</option>
                  <option value="TO_RECEIVER">Alıcıya ödeyeceğim</option>
                  <option value="TO_INITIATOR">Teklifçiye ödeyeceğim</option>
                </select>
                <div class="relative flex-1">
                  <div class="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 italic">₺</div>
                  <input v-model.number="formData.cashAmount" type="number" step="0.01" class="w-full bg-white border border-gray-100 rounded-3xl pl-16 pr-8 py-5 text-2xl font-black text-gray-900 placeholder-gray-100 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm" placeholder="0.00">
                </div>
              </div>
            </div>

            <!-- Note -->
            <div class="space-y-3">
              <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">PERSONAL NOTE</label>
              <textarea v-model="formData.message" rows="4" class="w-full bg-white border border-gray-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-gray-600 placeholder-gray-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm resize-none italic" placeholder="Takas detayları hakkında profesyonel bir not bırakın..." />
            </div>

            <!-- Legal -->
            <div class="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 shadow-inner">
              <label class="flex items-start cursor-pointer space-x-5">
                <input v-model="legalAccepted" type="checkbox" class="mt-1 h-6 w-6 text-primary-600 border-gray-200 rounded-xl focus:ring-primary-500/20 cursor-pointer" required>
                <div>
                  <p class="text-xs font-black text-gray-900 uppercase tracking-tight leading-relaxed italic">
                    <span class="text-primary-600 underline decoration-2 underline-offset-4 cursor-pointer" @click.prevent="showLegalModal = true">DİJİTAL TAKAS TAAHHÜTNAMESİ</span>'nu okudum ve kabul ediyorum.
                  </p>
                  <p class="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">GİZLİLİK VE KVKK UYUMLULUĞU DAHİLDİR</p>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="p-10 bg-white border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button class="bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-[1.5rem] py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95" @click="$emit('close')">
          İŞLEMİ İPTAL ET
        </button>
        <button :disabled="submitting || formData.offeredItems.length === 0 || !legalAccepted" class="relative bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-primary-600/30 disabled:opacity-50 disabled:grayscale overflow-hidden group" @click="submitOffer">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {{ submitting ? 'VERİLER İŞLENİYOR...' : 'RESMİ TEKLİFİ GÖNDER' }}
        </button>
      </div>
    </div>

    <LegalDocumentModal :is-open="showLegalModal" title="BazarX Dijital Takas Taahhütnamesi" :content="LEGAL_TEXT" @close="showLegalModal = false" @confirm="acceptLegal" />
  </div>
</template>

<script setup lang="ts">
import { ArrowsRightLeftIcon, XMarkIcon, InformationCircleIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import LegalDocumentModal from '~/components/modals/LegalDocumentModal.vue'
import { useTradeOffer, LEGAL_TEXT } from '~/composables/useTradeOffer'

interface SurplusListItem {
  id: string
  title: string
  quantity: number
  blockedQuantity?: number
  unit?: string
  images?: string[]
  availableQuantity: number
  company?: { id?: string; name?: string }
}

const props = defineProps({
  item: { type: Object as PropType<SurplusListItem>, required: true },
  isCounter: { type: Boolean, default: false },
  originalOffer: {
    type: Object as PropType<{
      id: string
      fromCompanyId?: string
      requestedItemId?: string
      offeredItemId?: string
      requestedQuantity?: number
      offeredQuantity?: number
      cashDifference?: number
    }>,
    default: null
  }
})
const emit = defineEmits(['close', 'success'])

const {
  myItems, submitting, legalAccepted, showLegalModal,
  formData, selectedItems,
  acceptLegal, submitOffer, getMainImage
} = useTradeOffer(props)

const availableToAdd = computed(() =>
  myItems.value.filter((it: SurplusListItem) => !formData.value.offeredItems.some(o => o.surplusItemId === it.id))
)

const getItemQty = (id: string): number => {
  const found = formData.value.offeredItems.find(o => o.surplusItemId === id)
  return found?.quantity ?? 1
}

const updateOfferedItemQty = (id: string, qty: number): void => {
  const item = formData.value.offeredItems.find(o => o.surplusItemId === id)
  if (item) item.quantity = qty
}

const addOfferedItem = (id: string): void => {
  if (!id) return
  const it = myItems.value.find((it: SurplusListItem) => it.id === id)
  if (!it) return
  if (!formData.value.offeredItems.some(o => o.surplusItemId === id)) {
    formData.value.offeredItems.push({ surplusItemId: id, quantity: it.availableQuantity })
  }
  ;(document.getElementById('item-select') as HTMLSelectElement).value = ''
}

const removeOfferedItem = (id: string): void => {
  formData.value.offeredItems = formData.value.offeredItems.filter(o => o.surplusItemId !== id)
}
</script>

<style scoped>
.animate-modal-in {
  animation: modal-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modal-in {
  from { transform: translateY(20px) scale(0.98); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
</style>
