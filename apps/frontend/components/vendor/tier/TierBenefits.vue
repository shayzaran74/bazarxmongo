<script setup lang="ts">
const props = defineProps<{
  features: string[]
}>()

const showAll = ref(false)
</script>

<template>
  <div class="p-8 border-b border-gray-50">
    <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
       <div class="w-2 h-2 rounded-full bg-green-500"></div> Avantajlar
    </h4>
    <ul class="space-y-4">
      <li v-for="(feature, index) in features.slice(0, showAll ? undefined : 4)" :key="index" class="flex items-start gap-4 animate-in slide-in-from-left duration-300" :style="{ transitionDelay: `${index * 50}ms` }">
        <span class="w-5 h-5 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
        <span class="text-xs font-bold text-gray-700 leading-tight">{{ feature }}</span>
      </li>
    </ul>
    <button v-if="features.length > 4" class="mt-8 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:underline" @click="showAll = !showAll">
       {{ showAll ? 'Daha az göster' : `+${features.length - 4} DAHA FAZLA AVANTAJ` }}
    </button>
  </div>
</template>
