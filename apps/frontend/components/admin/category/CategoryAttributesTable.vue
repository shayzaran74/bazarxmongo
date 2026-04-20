<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans italic">
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-950/50 border-b border-slate-800">
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ÖZELLİK ANALİZİ</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">VERİ TİPİ</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">OPSİYON MATRİSİ</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">KONFİGÜRASYON</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">DURUM</th>
            <th class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">OPERASYON</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50">
          <tr
            v-for="attr in attributes"
            :key="attr.id"
            class="hover:bg-slate-800/30 transition-all group"
          >
            <td class="px-8 py-6">
              <div>
                <div class="text-[13px] font-black text-slate-200 uppercase tracking-tight">{{ attr.label }}</div>
                <div class="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">@{{ attr.name }}</div>
              </div>
            </td>
            <td class="px-8 py-6">
              <span
                class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg"
                :class="{
                  'bg-blue-600/10 text-blue-400 border-blue-500/20': attr.type === 'select',
                  'bg-green-600/10 text-green-400 border-green-500/20': attr.type === 'text',
                  'bg-purple-600/10 text-purple-400 border-purple-500/20': attr.type === 'number',
                  'bg-amber-600/10 text-amber-400 border-amber-500/20': attr.type === 'checkbox',
                  'bg-pink-600/10 text-pink-400 border-pink-500/20': attr.type === 'multiselect'
                }"
              >
                {{ typeLabels[attr.type] || attr.type }}
              </span>
            </td>
            <td class="px-8 py-6">
              <div
                v-if="attr.options && attr.options.length > 0"
                class="flex flex-wrap gap-2"
              >
                <span
                  v-for="(opt, idx) in attr.options.slice(0, 4)"
                  :key="idx"
                  class="px-3 py-1 text-[9px] font-black bg-slate-950 text-slate-400 rounded-lg border border-slate-800 uppercase tracking-widest"
                >
                  {{ opt }}
                </span>
                <span v-if="attr.options.length > 4" class="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1.5">+{{ attr.options.length - 4 }} EKSTRA</span>
              </div>
              <span v-else class="text-[9px] font-black text-slate-700 uppercase tracking-widest">SERBEST VERİ GİRİŞİ</span>
            </td>
            <td class="px-8 py-6">
              <div class="flex flex-wrap gap-2">
                <span v-if="attr.isRequired" class="px-3 py-1 text-[8px] font-black bg-red-500/10 text-red-500 border border-red-500/20 rounded-md uppercase tracking-widest">ZORUNLU</span>
                <span v-if="attr.isVariant" class="px-3 py-1 text-[8px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md uppercase tracking-widest">VARYANT</span>
                <span v-if="attr.isFilterable" class="px-3 py-1 text-[8px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md uppercase tracking-widest">FİLTRE</span>
              </div>
            </td>
            <td class="px-8 py-6">
              <div
                class="flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all w-fit"
                :class="attr.isActive ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="attr.isActive ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'" />
                <span class="text-[9px] font-black uppercase tracking-widest">{{ attr.isActive ? 'AKTİF' : 'PASİF' }}</span>
              </div>
            </td>
            <td class="px-8 py-6 text-right">
              <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all active:scale-90"
                  @click="$emit('edit', attr)"
                >
                  ✎
                </button>
                <button
                  class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500 transition-all active:scale-90"
                  @click="$emit('delete', attr.id)"
                >
                  ✕
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  attributes: any[]
  typeLabels: any
}>()

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
</style>
