<template>
  <div class="relative bg-slate-950 rounded-[4rem] p-10 md:p-16 shadow-[0_0_100px_rgba(37,99,235,0.1)] border border-slate-900 overflow-hidden group font-sans italic">
    <!-- Decorative Orbitals -->
    <div class="absolute -right-32 -bottom-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000" />
    <div class="absolute -left-32 -top-32 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16">
      <div class="space-y-4">
        <h3 class="text-4xl md:text-6xl font-black text-slate-100 uppercase tracking-tightest leading-none flex items-center gap-6">
          <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border border-blue-400/30 shadow-2xl shadow-blue-900/40">
            <span class="text-4xl">+</span>
          </div>
          CÜZDAN <span class="text-blue-600">İKBALİ</span>
        </h3>
        <p class="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">
          EKOSİSTEM İÇİN GÜVENLİ LİKİDİTE TRANSFERİ VE BAKİYE YÖNETİMİ
        </p>
      </div>
    </div>

    <!-- Feedback Systems -->
    <div class="space-y-6 mb-12">
      <Transition name="fade-slide">
        <div v-if="success" class="bg-blue-600/10 border border-blue-500/30 rounded-[2rem] p-10 flex items-center gap-8 backdrop-blur-xl">
           <div class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-900/40 animate-bounce">✓</div>
           <div class="space-y-2">
             <p class="text-xl font-black text-slate-100 uppercase tracking-tight">İŞLEM BAŞARILI</p>
             <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">TALEBİNİZ ANA SİSTEME İLETİLDİ. ONAY SONRASI BAKİYE AKTİF OLACAKTIR.</p>
           </div>
        </div>
      </Transition>

      <Transition name="fade-slide">
        <div v-if="error" class="bg-red-600/10 border border-red-500/30 rounded-[2rem] p-10 flex items-center gap-8 backdrop-blur-xl">
           <div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-3xl shadow-xl shadow-red-900/40">✕</div>
           <div class="space-y-2">
             <p class="text-xl font-black text-red-500 uppercase tracking-tight">PROTOKOL HATASI</p>
             <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ error }}</p>
           </div>
        </div>
      </Transition>
    </div>

    <form class="space-y-16 relative z-10" @submit.prevent="handleSubmit">
      <!-- ── PHASE 1: QUANTITY ── -->
      <WalletAmountInput
        v-model="amount"
        :limit="currentLimits?.singleTransaction"
        :is-over-limit="isOverLimit"
        :tier-name="tierInfo?.currentTier?.id"
        :quick-amounts="quickAmounts"
      />

      <!-- ── PHASE 2: CHANNEL ── -->
      <WalletPaymentSelector
        :methods="paymentMethods"
        :selected="selectedPaymentMethod"
        @select="(m: string) => selectedPaymentMethod = m"
      />

      <!-- ── PHASE 3: INSTRUCTIONS ── -->
      <Transition name="fade-slide">
        <WalletPaymentInstructions
          v-if="selectedPaymentMethod"
          :method="selectedPaymentMethod"
          :user-email="authStore.user?.email"
        />
      </Transition>

      <!-- ── FINAL EXECUTION ── -->
      <div class="space-y-8">
        <button
          type="submit"
          :disabled="loading || amount < 1 || !selectedPaymentMethod || isOverLimit"
          class="w-full relative overflow-hidden group py-10 px-10 rounded-[2.5rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-xl uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-20 disabled:grayscale"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[progressShimmer_1.5s_infinite]" />
          
          <div v-if="loading" class="flex items-center justify-center gap-4">
            <div class="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span class="text-sm">PROTOKOL İŞLENİYOR...</span>
          </div>
          <span v-else>{{ submitButtonText }}</span>
        </button>

        <WalletSecurityTrust />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import WalletAmountInput from '../wallet/WalletAmountInput.vue'
import WalletPaymentSelector from '../wallet/WalletPaymentSelector.vue'
import WalletPaymentInstructions from '../wallet/WalletPaymentInstructions.vue'
import WalletSecurityTrust from '../wallet/WalletSecurityTrust.vue'


const props = defineProps({
  userId: { type: String, default: null }
})

const emit = defineEmits(['success'])

const {
  amount, loading, success, error, selectedPaymentMethod, tierInfo,
  paymentMethods, quickAmounts, currentLimits, isOverLimit, submitButtonText,
  handleSubmit
} = useWalletTopUp(props, emit)

const authStore = useAuthStore()
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(20px); }

@keyframes progressShimmer {
  0% { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(200%) skewX(-20deg); }
}
</style>