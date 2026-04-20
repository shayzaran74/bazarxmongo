<template>
  <div class="space-y-6 font-sans italic">
    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">
      ÖDEME KANALI SEÇİMİ
    </label>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <button
        v-for="method in methods"
        :key="method.id"
        type="button"
        :class="[
          'relative text-left p-8 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden',
          selected === method.id
            ? 'bg-slate-900 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.1)]'
            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
        ]"
        @click="$emit('select', method.id)"
      >
        <div class="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div class="relative z-10 space-y-6">
          <div :class="[
            'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110',
            selected === method.id ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-900 text-slate-500'
          ]">
            {{ method.icon }}
          </div>
          
          <div>
            <h4 :class="[
              'text-[13px] font-black uppercase tracking-tightest leading-none',
              selected === method.id ? 'text-slate-100' : 'text-slate-400'
            ]">
              {{ method.name }}
            </h4>
            <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">
              {{ method.description }}
            </p>
          </div>

          <div
            class="inline-block px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest"
            :class="selected === method.id ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900 text-slate-600'"
          >
            {{ method.fee }}
          </div>
        </div>

        <!-- Selected Indicator -->
        <div
          v-if="selected === method.id"
          class="absolute top-8 right-8 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] animate-in zoom-in duration-300"
        >
          ✓
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  methods: any[]
  selected: string
}>()

defineEmits(['select'])
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
