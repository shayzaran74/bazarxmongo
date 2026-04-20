<template>
  <div class="p-6 border-b border-white/5 bg-slate-950/80 backdrop-blur-md text-white shrink-0 font-sans italic">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <!-- Ghost Badge -->
        <div class="relative group">
          <div class="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/40 transition-all rounded-full" />
          <span class="relative flex items-center gap-2 text-[10px] bg-slate-900 border border-blue-500/30 px-3 py-1 rounded-full font-black tracking-widest text-blue-400">
            <span class="animate-pulse">👻</span>
            WATCHTOWER MODE
          </span>
        </div>

        <div class="space-y-1">
          <h3 class="font-black text-xs uppercase tracking-tightest leading-none">
            {{ room.tradeOffer?.fromCompany?.name || 'ÜYE A' }}
            <span class="text-slate-600 font-bold mx-2">VS</span>
            {{ room.tradeOffer?.toCompany?.name || 'ÜYE B' }}
          </h3>
          <div class="flex items-center gap-3">
             <div class="flex items-center gap-1.5">
               <span :class="['w-1.5 h-1.5 rounded-full shadow-[0_0_8px]', isConnected ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50']" />
               <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                 {{ isConnected ? 'CANLI İZLEME AKTİF' : 'BAĞLANTI KESİLDİ' }}
               </p>
             </div>
             <div
                v-if="isFrozen"
                class="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase"
              >
                🧊 DONDURULMUŞ
             </div>
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <button
        class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-600 transition-all active:scale-90"
        title="IZLEMEYI DURDUR"
        @click="$emit('close')"
      >
        <span class="text-xs">✕</span>
      </button>
    </div>

    <!-- Trade Mini Overview -->
    <div
      v-if="room.tradeOffer"
      class="mt-6 flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-600"
    >
      <div v-if="room.tradeOffer.offeredItem" class="flex items-center gap-2">
        <span class="text-blue-500">OFFERED:</span>
        <span class="text-slate-400">{{ room.tradeOffer.offeredItem.title }}</span>
      </div>
      <div v-if="room.tradeOffer.requestedItem" class="flex items-center gap-2 border-l border-slate-800 pl-6">
        <span class="text-emerald-500">WANTED:</span>
        <span class="text-slate-400">{{ room.tradeOffer.requestedItem.title }}</span>
      </div>
      <div
        class="ml-auto px-3 py-1 rounded-md border"
        :class="{
          'bg-emerald-500/5 border-emerald-500/20 text-emerald-500': room.tradeOffer.status === 'ACCEPTED',
          'bg-amber-500/5 border-amber-500/20 text-amber-500': room.tradeOffer.status === 'PENDING',
          'bg-red-500/5 border-red-500/20 text-red-500': room.tradeOffer.status === 'DISPUTED',
        }"
      >
        STATUS: {{ room.tradeOffer.status }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  room: any
  isConnected: boolean
  isFrozen: boolean
}>()

defineEmits(['close'])
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
