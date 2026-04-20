<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="$emit('close')" />
    <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-slide-up">
      <div class="p-8 space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-2xl font-black text-gray-900 italic uppercase">🤝 Bayi Ara & Ekle</h3>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <XMarkIcon class="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div class="relative">
          <input 
            v-model="query" 
            type="text" 
            placeholder="Firma ismi ile arayın..." 
            class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-5 text-sm font-black focus:border-indigo-500 outline-none transition-all italic uppercase"
            @input="handleSearch"
          >
          <MagnifyingGlassIcon class="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-300" />
        </div>

        <div class="max-h-64 overflow-y-auto space-y-3 rounded-2xl bg-indigo-50/20 p-2 border border-indigo-100/30">
          <div v-for="v in results" :key="v.id" class="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all shadow-sm">
            <div class="flex flex-col">
              <span class="text-sm font-black text-gray-900 italic uppercase">{{ v.businessName }}</span>
              <span class="text-[9px] text-gray-400 font-bold tracking-widest">{{ v.id.slice(0, 12) }}</span>
            </div>
            <button 
              class="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              @click="$emit('invite', v.id)"
            >
              EKLE
            </button>
          </div>
          <div v-if="!results.length" class="p-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic">
            {{ query.length > 1 ? 'Sonuç Bulunamadı' : 'Aramaya başlayın' }}
          </div>
        </div>
      </div>
      <div class="p-6 bg-gray-50 flex justify-center">
        <button class="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors" @click="$emit('close')">Kapat</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ isOpen: Boolean, results: Array })
const emit = defineEmits(['close', 'invite', 'search'])
const query = ref('')

let timeout = null
const handleSearch = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => emit('search', query.value), 300)
}
</script>
