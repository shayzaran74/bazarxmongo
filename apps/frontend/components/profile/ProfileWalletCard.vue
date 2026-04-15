<template>
  <div class="space-y-6">
    <!-- Cüzdan Kartı (Premium Gradient Görüntü) -->
    <div 
      class="relative overflow-hidden group rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 p-8 text-white shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-indigo-500/25"
    >
      <!-- Arka Plan Dekoratif Elementleri -->
      <div class="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
      <div class="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-purple-500/20 blur-2xl" />
      
      <!-- Kart İçeriği -->
      <div class="relative z-10">
        <div class="mb-8 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
              <CreditCardIcon class="h-6 w-6 text-indigo-200" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/80">
                BazarX Digital Pass
              </p>
              <p class="text-xs font-bold text-white/60">
                Premium Ticari Üyelik
              </p>
            </div>
          </div>
          <div class="text-right">
            <div class="h-8 w-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-inner" />
          </div>
        </div>

        <div class="mb-8">
          <p class="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-100/70">
            Kullanılabilir Bakiye
          </p>
          <div class="flex items-baseline gap-2">
            <span class="text-5xl font-black tracking-tighter">
              {{ formatPrice(balance) }}
            </span>
            <span class="text-lg font-bold text-indigo-200/80">TRY</span>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-white/10 pt-6">
          <div v-if="blockedBalance > 0" class="flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1.5 backdrop-blur-md">
             <LockClosedIcon class="h-3 w-3 text-red-300" />
             <span class="text-[10px] font-black uppercase tracking-wider text-red-200">
               {{ formatPrice(blockedBalance) }} BLOKE
             </span>
          </div>
          <div v-else class="flex items-center gap-2">
             <div class="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
             <span class="text-[10px] font-black uppercase tracking-wider text-green-300">
               Sistem Aktif
             </span>
          </div>
          
          <div class="flex -space-x-2">
            <div class="h-8 w-8 rounded-full border-2 border-indigo-600 bg-indigo-500 p-1">
              <ShieldCheckIcon class="h-full w-full text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CreditCardIcon, 
  LockClosedIcon, 
  ShieldCheckIcon 
} from '@heroicons/vue/24/outline'

interface Props {
  balance: number
  blockedBalance: number
}

defineProps<Props>()

/**
 * Fiyat biçimlendirme fonksiyonu
 * @param price - Sayısal değer
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}
</script>

<style scoped>
/* Kart üzerindeki hafif parlama efekti */
.group:hover::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(30deg);
  pointer-events: none;
}
</style>
