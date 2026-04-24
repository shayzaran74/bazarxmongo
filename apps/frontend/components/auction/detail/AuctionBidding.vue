<template>
  <div class="bg-white rounded-[3.5rem] shadow-2xl shadow-black/[0.03] p-10 lg:p-12 border border-neutral-100 relative overflow-hidden italic">
    <div
      v-if="isHighestBidder"
      data-testid="highest-bidder"
      class="absolute top-0 right-0 left-0 h-2 bg-emerald-500 shadow-lg shadow-emerald-500/20"
    />

    <div class="space-y-12">
      <div class="flex items-center justify-between">
        <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">CANLI DURUM</h3>
        <div v-if="auction?.status === 'Active'" class="flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] pt-0.5">YAYINDA</span>
        </div>
      </div>

      <div class="text-center p-10 bg-gray-900 rounded-[3rem] shadow-3xl shadow-gray-900/40 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span class="relative z-10 block text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic leading-none">ŞU ANKİ TEKLİF</span>
        <span
          data-testid="current-price"
          class="relative z-10 text-5xl sm:text-6xl font-black text-white tracking-tightest leading-none drop-shadow-2xl"
        >
          {{ formatPrice(auction?.currentPrice || auction?.startingPrice) }}
        </span>
      </div>

      <div v-if="auction?.status === 'ACTIVE'" class="space-y-8">
        <!-- Participation Needed -->
        <div v-if="auction?.participationDeposit > 0 && (!participation || participation.status !== 'APPROVED')" class="space-y-6">
          <div v-if="!participation" class="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100/50 text-center space-y-6 shadow-inner">
            <p class="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] leading-snug">KATILMAK İÇİN DEPOZİTO ONAYI GEREKLİDİR</p>
            <button
              data-testid="participate-button"
              class="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-amber-500/30 active:scale-95"
              @click="$emit('participate')"
            >
              KATILIM TALEBİ GÖNDER
            </button>
          </div>
          <div v-else-if="participation.status === 'Pending'" class="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100/50 text-center space-y-4 shadow-inner">
            <div class="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <ClockIcon class="w-8 h-8 text-indigo-600" />
            </div>
            <p class="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-none">KATILIM TALEBİNİZ BEKLEMEDE</p>
            <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-relaxed italic opacity-70">ADMIN ONAYLADIĞINDA BAKİYENİZDEN {{ formatPrice(auction.participationDeposit) }} BLOKE EDİLECEKTİR.</p>
          </div>
        </div>

        <!-- Bidding Allowed -->
        <div v-else class="space-y-6">
          <div class="relative group">
            <input
              v-model.number="bidFieldValue"
              data-testid="bid-amount"
              type="number"
              :min="minNextBid"
              class="w-full bg-neutral-50 border-4 border-neutral-100 rounded-[2.5rem] px-10 py-7 font-black text-3xl focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-inner"
              placeholder="0.00"
            >
            <div class="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-200 font-black text-2xl group-hover:text-neutral-400 transition-colors uppercase italic">TRY</div>
          </div>

          <div class="flex items-center justify-between px-6">
            <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic">MİNİMUM TEKLİF: {{ formatPrice(minNextBid) }}</p>
            <div v-if="isHighestBidder" class="flex items-center gap-2 text-emerald-600">
              <CheckCircleIcon class="w-4 h-4" />
              <span class="text-[9px] font-black uppercase tracking-widest">LİDER SENSİN</span>
            </div>
          </div>

          <button
            data-testid="place-bid-button"
            :disabled="loading || bidFieldValue < minNextBid"
            class="w-full bg-indigo-600 hover:bg-black text-white p-10 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] active:scale-[0.98] transition-all flex items-center justify-center gap-6 shadow-2xl shadow-indigo-100 disabled:opacity-30 group relative overflow-hidden"
            @click="$emit('place-bid', bidFieldValue)"
          >
            <div v-if="loading" class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else class="relative z-10">{{ isHighestBidder ? 'TEKLİFİ YÜKSELT' : 'TEKLİF VER' }}</span>
          </button>
        </div>
      </div>

      <div v-if="auction?.status === 'Completed'" class="space-y-8">
        <div class="text-center space-y-8 p-10 bg-indigo-50/50 rounded-[3.5rem] border border-indigo-100/50 shadow-inner">
          <div class="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 animate-pulse">
            <TrophyIcon class="w-10 h-10 text-white" />
          </div>
          <div>
            <h4 class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 italic">KAZANAN ÜYE</h4>
            <p class="text-3xl font-black text-gray-900 leading-none tracking-tightest">{{ maskEmail(auction?.winner?.email || bids[0]?.User?.email) }}</p>
          </div>

          <div v-if="isEligibleToClaim" class="space-y-6 pt-4">
            <button
              data-testid="claim-button"
              :disabled="claiming"
              class="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-10 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-4"
              @click="$emit('claim')"
            >
              <div v-if="claiming" class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <span>HEMEN SATIN AL</span>
            </button>
            <div class="flex items-center justify-center gap-3 text-emerald-600 bg-white py-4 rounded-2xl border border-emerald-50 shadow-sm">
              <ClockIcon class="w-5 h-5" />
              <span class="text-[10px] font-black uppercase tracking-widest pt-1">{{ formatDate(auction.paymentDeadline) }} SON ÖDEME</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TrophyIcon, ClockIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  auction: Object,
  participation: Object,
  isHighestBidder: Boolean,
  isEligibleToClaim: Boolean,
  minNextBid: Number,
  loading: Boolean,
  claiming: Boolean,
  bids: Array,
})
const emit = defineEmits(['participate', 'place-bid', 'claim'])

const bidFieldValue = ref(props.minNextBid)
watch(() => props.minNextBid, (v) => { if (bidFieldValue.value < v) bidFieldValue.value = v })

const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p || 0)
const maskEmail = (e) => e ? `${e.split('@')[0].slice(0, 3)}***@${e.split('@')[1]}` : '---'
const formatDate = (val) => new Date(val).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>
