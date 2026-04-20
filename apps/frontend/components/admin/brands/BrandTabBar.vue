<template>
  <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 flex gap-2">
    <button
      v-for="tab in tabItems"
      :key="tab.id"
      :class="[
        'flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3',
        modelValue === tab.id 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
      ]"
      @click="$emit('update:modelValue', tab.id)"
    >
      <component :is="tab.icon" class="h-5 w-5" />
      {{ tab.label }}
      <span 
        v-if="tab.count > 0"
        :class="modelValue === tab.id ? 'bg-white/20' : 'bg-gray-100'"
        class="px-2 py-0.5 rounded-lg text-[10px] min-w-[20px]"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ClockIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: String,
  stats: Object
})

defineEmits(['update:modelValue'])

const tabItems = computed(() => [
  { id: 'pending', label: 'Bekleyenler', icon: ClockIcon, count: props.stats.PENDING || 0 },
  { id: 'all', label: 'Tüm Markalar', icon: ShieldCheckIcon, count: 0 },
  { id: 'violations', label: 'İhlaller', icon: ExclamationTriangleIcon, count: props.stats.VIOLATIONS || 0 }
])
</script>
