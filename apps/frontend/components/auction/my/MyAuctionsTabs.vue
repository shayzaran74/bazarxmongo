<template>
  <div class="mb-12 bg-white/50 backdrop-blur-sm p-4 rounded-[2.5rem] border border-neutral-100 shadow-sm font-sans italic uppercase">
    <nav class="flex flex-wrap gap-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-4 px-8 py-4 rounded-[1.8rem] transition-all relative overflow-hidden group active:scale-95"
        :class="[
          activeTab === tab.id
            ? 'bg-gray-900 text-white shadow-2xl translate-y-[-2px]'
            : 'text-gray-400 hover:text-gray-900 hover:bg-neutral-50'
        ]"
        @click="$emit('update:activeTab', tab.id)"
      >
        <component
          :is="tab.icon"
          class="h-5 w-5"
          :class="activeTab === tab.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-900'"
        />
        <span class="text-[10px] font-black tracking-widest leading-none">{{ tab.name }}</span>
        <span
          v-if="tab.count !== undefined"
          class="px-3 py-1 rounded-full text-[9px] font-black tracking-tighter"
          :class="[
            activeTab === tab.id
              ? 'bg-white/10 text-white'
              : 'bg-neutral-100 text-gray-500'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ClipboardIcon, HandRaisedIcon, TrophyIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  activeTab: string
  createdCount: number
  bidsCount: number
  wonCount: number
}>()

defineEmits(['update:activeTab'])

const tabs = computed(() => [
  {
    id: 'created',
    name: 'AÇTIĞIM İHALELER',
    icon: ClipboardIcon,
    count: props.createdCount
  },
  {
    id: 'bids',
    name: 'VERDİĞİM TEKLİFLER',
    icon: HandRaisedIcon,
    count: props.bidsCount
  },
  {
    id: 'won',
    name: 'KAZANDIKLARIM',
    icon: TrophyIcon,
    count: props.wonCount
  }
])
</script>
