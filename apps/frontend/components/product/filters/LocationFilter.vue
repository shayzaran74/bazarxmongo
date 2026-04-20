<template>
  <div class="space-y-4">
    <div class="relative group">
      <input
        :value="searchQuery"
        type="text"
        placeholder="ŞEHİR ARA..."
        class="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-700"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      >
    </div>
    
    <div class="max-h-48 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
      <button
        :class="[
          'block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
          !activeLocation
            ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
            : 'text-slate-500 hover:bg-slate-800'
        ]"
        @click="$emit('select', '')"
      >
        TÜMÜ
      </button>

      <button
        v-for="city in cities"
        :key="city"
        :class="[
          'block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
          activeLocation === city
            ? 'bg-slate-800 text-amber-500 border border-amber-500/30'
            : 'text-slate-400 hover:bg-slate-900'
        ]"
        @click="$emit('select', city)"
      >
        {{ city }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  cities: string[]
  searchQuery: string
  activeLocation: string
}>()

defineEmits(['update:searchQuery', 'select'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>
