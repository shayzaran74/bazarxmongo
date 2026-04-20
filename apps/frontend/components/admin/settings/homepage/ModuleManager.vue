<template>
  <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-8">
    <div class="p-6 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-lg font-black text-gray-900 flex items-center italic uppercase leading-none">
        <PuzzlePieceIcon class="h-5 w-5 mr-2 text-indigo-600" />
        Modül <span class="text-indigo-600 ml-1">Yönetimi</span>
      </h2>
    </div>

    <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="item in modules" :key="item.key" class="p-5 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col gap-4 group hover:shadow-lg hover:shadow-indigo-100/50 transition-all">
        <div class="flex items-center justify-between">
          <div :class="item.bg" class="p-2.5 rounded-xl text-white shadow-sm transition-transform group-hover:rotate-12">
            <component :is="item.icon" class="h-5 w-5" />
          </div>
          <button 
            class="w-10 h-5 rounded-full transition-colors relative" 
            :class="modelValue[item.key] ? 'bg-indigo-600' : 'bg-gray-300'"
            @click="$emit('toggle', item.key)"
          >
            <div class="w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all" :class="modelValue[item.key] ? 'right-0.75' : 'left-0.75'" />
          </button>
        </div>
        <div>
          <h3 class="text-xs font-black text-gray-900 uppercase italic mb-1">{{ item.label }}</h3>
          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-tight leading-tight opacity-70">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PuzzlePieceIcon, TicketIcon, StarIcon, UserGroupIcon, BanknotesIcon } from '@heroicons/vue/24/outline'

defineProps({ modelValue: Object })
defineEmits(['toggle'])

const modules = [
  { key: 'showAuctions', label: 'Açık Artırmalar', desc: 'Süreli teklif toplama sistemi', icon: TicketIcon, bg: 'bg-blue-500' },
  { key: 'showLotteries', label: 'Çekilişler', desc: 'Şans bazlı ödül mekanizması', icon: StarIcon, bg: 'bg-purple-500' },
  { key: 'showGroupBuy', label: 'Birlikte Al', desc: 'Grup satın alma kampanyaları', icon: UserGroupIcon, bg: 'bg-indigo-500' },
  { key: 'showPersonalized', label: 'Sana Özel', desc: 'Kişiselleştirilmiş öneriler', icon: StarIcon, bg: 'bg-orange-500' },
  { key: 'showBarterPool', label: 'Barter Havuzu', desc: 'Havuz tabanlı takas sistemi', icon: BanknotesIcon, bg: 'bg-cyan-500' }
]
</script>
