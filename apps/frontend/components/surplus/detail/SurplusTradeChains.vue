<template>
  <div v-if="chains && chains.length > 0" class="space-y-12 pt-20 border-t border-neutral-100 italic">
    <div class="flex items-center justify-between">
      <div class="space-y-3">
        <h2 class="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">ZİNCİRLEME TAKAS <span class="text-indigo-600">ÖNERİLERİ</span></h2>
        <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none pt-1">AI DESTEKLİ OPTİMİZE EDİLMİŞ TAKAS YOLLARI VE ROTA ANALİZİ.</p>
      </div>
      <div class="hidden md:block">
        <ArrowPathIcon class="h-16 w-16 text-gray-100 rotate-12" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
      <div v-for="(chain, idx) in chains" :key="idx" class="bg-white rounded-[4rem] p-10 border border-gray-100 shadow-2xl shadow-black/[0.02] hover:shadow-indigo-100 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
        <div class="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-[64px] opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div class="flex items-center justify-between mb-8 relative z-10">
          <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] italic">{{ chain.type }}</p>
          <div class="px-3 py-1 bg-neutral-50 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-widest border border-neutral-100">MATCH #{{ idx + 1 }}</div>
        </div>

        <div class="flex flex-wrap items-center gap-6 mb-12 relative z-10">
          <div v-for="(cItem, cIdx) in chain.items" :key="cIdx" class="flex items-center gap-6">
            <div class="w-20 h-20 rounded-[2rem] bg-neutral-50 flex items-center justify-center p-3 border border-black/5 hover:scale-110 transition-all cursor-help shadow-inner group-hover:bg-white" :title="cItem.title">
              <img v-if="cItem.images && cItem.images[0]" :src="resolveImageUrl(typeof cItem.images[0] === 'string' ? cItem.images[0] : cItem.images[0].url)" class="w-full h-full object-cover rounded-2xl shadow-sm">
              <span v-else class="text-2xl font-black text-gray-300 uppercase">{{ cItem.title.charAt(0) }}</span>
            </div>
            <div v-if="cIdx < chain.items.length - 1" class="text-gray-200">
              <ChevronRightIcon class="h-8 w-8 stroke-[4]" />
            </div>
          </div>
        </div>

        <button class="w-full bg-gray-900 group-hover:bg-indigo-600 text-white rounded-3xl py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all transform group-hover:scale-[1.02] mt-auto shadow-2xl relative z-10" @click="$emit('start', chain)">
          ZİNCİRİ BAŞLAT
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
defineProps({ chains: Array })
defineEmits(['start'])

const { resolveImageUrl } = useAppImage()
</script>
