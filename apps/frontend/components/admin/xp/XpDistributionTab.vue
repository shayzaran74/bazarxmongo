<template>
  <div class="space-y-6">
    <div v-if="loading" class="py-12 text-center flex flex-col items-center justify-center opacity-30 italic">
      <div class="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p class="text-[10px] font-black uppercase tracking-widest">KURALLAR YAKALANIYOR</p>
    </div>
    
    <div v-else class="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
      <ul role="list" class="divide-y divide-neutral-50">
        <li v-for="rule in rules" :key="rule.id" class="p-8 hover:bg-neutral-50 transition-all group italic">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <span class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform transform -rotate-12">🎖️</span>
              <p class="text-sm font-black text-gray-900 uppercase tracking-tighter italic leading-tight">{{ rule.name }}</p>
            </div>
            <span :class="[rule.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100', 'px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border shadow-sm']">
              {{ rule.isActive ? 'Aktif' : 'Pasif' }}
            </span>
          </div>
          
          <div class="flex flex-wrap items-center justify-between gap-6 px-14">
            <div class="flex items-center gap-8">
              <div class="flex flex-col">
                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">📍 Şehir</span>
                <span class="text-[10px] font-black text-gray-700 uppercase tracking-tight">{{ rule.city || 'ULUSAL' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">🏷️ Seviye</span>
                <span class="text-[10px] font-black text-gray-700 uppercase tracking-tight">{{ rule.tier || 'TÜMÜ' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">🔥 ÖNCELİK</span>
                <span class="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{{ rule.priority }}</span>
              </div>
            </div>

            <div class="flex items-center gap-10">
              <div v-for="(val, label) in { 'KOMİSYON': rule.commissionPct, 'REKLAM': rule.adPct, 'HİZMET': rule.servicePct }" :key="label" class="text-center group/stat">
                <p class="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1 group-hover/stat:text-indigo-400 transition-colors">{{ label }}</p>
                <p class="text-xl font-black text-gray-900 tracking-tighter">%{{ val }}</p>
              </div>
            </div>
          </div>
        </li>
        <li v-if="rules.length === 0" class="p-24 text-center">
          <div class="text-5xl mb-6 transform -rotate-12">📜</div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">HENÜZ HİÇ DAĞITIM KURALI OLUŞTURULMADI</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({ rules: Array, loading: Boolean })
</script>
