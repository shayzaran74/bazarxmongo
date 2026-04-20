<template>
  <div class="border-b border-slate-800/50 pb-6 font-sans italic transition-all duration-500">
    <button
      class="flex items-center justify-between w-full text-left group"
      @click="$emit('toggle')"
    >
      <div class="space-y-1">
        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-amber-500 transition-colors">{{ title }}</span>
        <div v-if="isOpen" class="h-0.5 w-4 bg-amber-600 rounded-full" />
      </div>
      <div class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:border-slate-600 transition-all">
        <span :class="['text-xs transition-transform duration-300', isOpen ? 'rotate-180' : '']">▼</span>
      </div>
    </button>
    <div
      v-if="isOpen"
      class="mt-6 animate-in slide-in-from-top-2 duration-300"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  isOpen: boolean
}>()

defineEmits(['toggle'])
</script>
