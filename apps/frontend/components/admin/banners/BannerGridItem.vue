<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
    <div class="relative h-48 overflow-hidden">
      <img :src="resolveUrl(banner.imageUrl)" :alt="banner.title" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      <!-- Status Badge -->
      <div class="absolute top-3 left-3">
        <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white']">
          {{ banner.isActive ? '🔥 AKTİF' : '⏸️ PASİF' }}
        </span>
      </div>

      <!-- Position -->
      <div class="absolute bottom-3 right-3 text-[10px] font-black text-white px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 uppercase italic">
        {{ banner.position === 'home_top' ? 'Üst Slider' : 'Orta Alan' }}
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="text-xl font-black text-white italic uppercase">{{ banner.title }}</h3>
        <p v-if="banner.description" class="text-xs text-white/70 line-clamp-1 italic uppercase">{{ banner.description }}</p>
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">GEÇERLİLİK</div>
        <div class="text-xs font-black text-gray-900">{{ formatDate(banner.startDate) }} - {{ banner.endDate ? formatDate(banner.endDate) : '∞' }}</div>
      </div>

      <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
        <button class="flex-1 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" @click="$emit('edit')">
          DÜZENLE
        </button>
        <button 
          :class="['flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', banner.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100']"
          @click="$emit('toggle')"
        >
          {{ banner.isActive ? 'PASİFLE' : 'AKTİFLE' }}
        </button>
        <button class="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-all" @click="$emit('delete')">
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TrashIcon } from '@heroicons/vue/24/outline'
const config = useRuntimeConfig()

defineProps({ banner: Object })
defineEmits(['edit', 'toggle', 'delete'])

const resolveUrl = (url) => url?.startsWith('http') ? url : `${config.public.apiBase}${url}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : 'Süresiz'
</script>
