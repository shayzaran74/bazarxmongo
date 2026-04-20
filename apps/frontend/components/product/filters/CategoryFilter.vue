<template>
  <div class="space-y-4">
    <div class="relative group">
      <input
        :value="searchQuery"
        type="text"
        placeholder="KATEGORİ ARA..."
        class="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-700"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      >
    </div>
    
    <div class="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
      <button
        :class="[
          'block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
          !activeCategory
            ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
            : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
        ]"
        @click="$emit('select', '')"
      >
        TÜMÜ
      </button>

      <div
        v-for="cat in categories"
        :key="cat.id"
        class="space-y-1"
      >
        <div class="flex items-center group">
          <button
            :class="[
              'flex-grow text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-l-xl transition-all',
              activeCategory === cat.name
                ? 'bg-slate-800 text-amber-500 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-900'
            ]"
            @click="$emit('select', cat.name)"
          >
            {{ cat.name }}
          </button>
          <button
            v-if="!searchQuery && hasSub(cat.id)"
            class="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-r-xl hover:bg-slate-800 transition-colors"
            @click.stop="$emit('toggle-expand', cat.id)"
          >
            <span :class="['block text-[8px] transition-transform', isExpanded(cat.id) ? 'rotate-180' : '']">▼</span>
          </button>
        </div>

        <!-- Subcategories -->
        <div
          v-if="!searchQuery && isExpanded(cat.id)"
          class="pl-4 space-y-1 border-l-2 border-slate-800 ml-2"
        >
          <button
            v-for="sub in getSub(cat.id)"
            :key="sub.id"
            :class="[
              'block w-full text-left px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all',
              activeCategory === sub.name
                ? 'bg-amber-600/10 text-amber-500'
                : 'text-slate-600 hover:bg-slate-800 hover:text-slate-300'
            ]"
            @click="$emit('select', sub.name)"
          >
            {{ sub.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: any[]
  searchQuery: string
  activeCategory: string
  expandedCategories: Set<string>
  hasSub: (id: string) => boolean
  getSub: (id: string) => any[]
  isExpanded: (id: string) => boolean
}>()

defineEmits(['update:searchQuery', 'select', 'toggle-expand'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>
