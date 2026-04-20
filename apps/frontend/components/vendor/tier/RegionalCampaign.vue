<script setup lang="ts">
defineProps<{
  regional: any
}>()
</script>

<template>
  <div v-if="regional && (regional.multiplier > 1 || regional.burnRate > 0.25)" class="p-8 bg-gradient-to-r from-green-600 to-emerald-700 text-white relative overflow-hidden group">
    <div class="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>
    <div class="relative flex gap-6">
      <div class="text-5xl animate-bounce-slow">🌍</div>
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h4 class="text-lg font-black italic uppercase tracking-tighter">{{ regional.city }}'ye Özel Fırsat!</h4>
          <span class="bg-yellow-400 text-black text-[8px] font-black px-2 py-1 rounded-lg animate-pulse">AKTİF</span>
        </div>
        <p class="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-4">Şehrinize özel ayrıcalıkların tadını çıkarın:</p>
        <ul class="space-y-3">
          <li v-if="regional.multiplier > 1" class="flex items-center gap-3 text-xs font-black italic bg-white/10 p-3 rounded-xl border border-white/5">
             <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center not-italic">🚀</span>
             {{ regional.multiplier }}x daha fazla XP kazanın!
          </li>
          <li v-if="regional.burnRate > 0.25" class="flex items-center gap-3 text-xs font-black italic bg-white/10 p-3 rounded-xl border border-white/5">
             <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center not-italic">🔥</span>
             Komisyonlarda %{{ (regional.burnRate * 100).toFixed(0) }}'a kadar indirim!
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s infinite ease-in-out;
}
</style>
