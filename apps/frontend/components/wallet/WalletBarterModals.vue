<template>
  <div>
    <!-- Barter Topup Modal -->
    <Teleport to="body">
      <div v-if="showTopup" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <h3 class="text-2xl font-black text-gray-900 mb-2">Havuz Aktarımı</h3>
          <p class="text-sm text-gray-500 mb-6">Cüzdan bakiyenizden barter havuzuna aktarmak istediğiniz tutarı girin.</p>

          <div class="mb-6">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktarılacak Tutar (TL)</label>
            <input
              v-model="topupAmount"
              type="number"
              class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:outline-none font-black text-xl"
              placeholder="0.00"
            >
            <p class="mt-2 text-[10px] font-bold text-gray-400">
              Mevcut Nakit: {{ formatPrice(mainAccount?.availableBalance || 0) }}
            </p>
          </div>

          <div class="flex gap-4">
            <button class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest" @click="$emit('close-topup')">İptal</button>
            <button
              :disabled="!topupAmount || topupAmount < 1 || topupAmount > (mainAccount?.availableBalance || 0) || loading"
              class="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 disabled:opacity-50"
              @click="$emit('submit-topup', topupAmount)"
            >
              {{ loading ? '...' : 'Onayla' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Barter Withdraw Modal -->
    <Teleport to="body">
      <div v-if="showWithdraw" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <h3 class="text-2xl font-black text-gray-900 mb-2">💸 Havuzdan Para Çek</h3>
          <p class="text-sm text-gray-500 mb-6">Barter havuzunuzdan nakit bakiyenize aktarmak istediğiniz tutarı girin.</p>

          <div class="mb-6">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Çekilecek Tutar (TL)</label>
            <input
              v-model="withdrawAmount"
              type="number"
              class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:outline-none font-black text-xl"
              placeholder="0.00"
              :max="barterAccount?.availableBalance || 0"
            >
            <p class="mt-2 text-[10px] font-bold text-gray-400">
              Havuz Bakiyeniz: {{ formatPrice(barterAccount?.availableBalance || 0) }}
            </p>
          </div>

          <div class="flex gap-4">
            <button class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest" @click="$emit('close-withdraw')">İptal</button>
            <button
              :disabled="!withdrawAmount || withdrawAmount < 1 || withdrawAmount > (barterAccount?.availableBalance || 0) || loading"
              class="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-200 disabled:opacity-50"
              @click="$emit('submit-withdraw', withdrawAmount)"
            >
              {{ loading ? '...' : 'Çek' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  showTopup: Boolean,
  showWithdraw: Boolean,
  mainAccount: Object,
  barterAccount: Object,
  formatPrice: Function,
  loading: Boolean
})

const emit = defineEmits(['close-topup', 'close-withdraw', 'submit-topup', 'submit-withdraw'])

const topupAmount = ref(0)
const withdrawAmount = ref(0)

watch(() => props.showTopup, (val) => { if (!val) topupAmount.value = 0 })
watch(() => props.showWithdraw, (val) => { if (!val) withdrawAmount.value = 0 })
</script>
