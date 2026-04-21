<template>
  <div v-if="type === 'color'" class="grid grid-cols-4 gap-3 p-1">
    <button
      v-for="item in items"
      :key="item"
      :class="[
        'group relative w-10 h-10 rounded-full border-2 transition-all duration-300 transform hover:scale-110 active:scale-95',
        selectedItems.includes(item)
          ? 'border-primary-600 ring-2 ring-primary-200 ring-offset-2'
          : 'border-gray-200 hover:border-gray-400'
      ]"
      :style="{ backgroundColor: getColorHex ? getColorHex(item) : '#CCC' }"
      :title="item"
      @click="$emit('toggle', item)"
    >
      <CheckIcon v-if="selectedItems.includes(item)" :class="['w-5 h-5 absolute inset-0 m-auto', isLightColor(item) ? 'text-gray-900' : 'text-white']" />
    </button>
  </div>

  <div v-else-if="type === 'grid'" class="grid grid-cols-3 gap-2">
    <button
      v-for="item in items"
      :key="item"
      :class="[
        'px-2 py-2 text-xs font-bold rounded-xl border transition-all duration-200 active:scale-95',
        selectedItems.includes(item)
          ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-900/10'
          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:text-gray-900'
      ]"
      @click="$emit('toggle', item)"
    >
      {{ item }}
    </button>
  </div>

  <div v-else class="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
    <label
      v-for="item in items"
      :key="item"
      class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors group"
    >
      <input
        type="checkbox"
        :checked="selectedItems.includes(item)"
        class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 transition-all duration-200"
        @change="$emit('toggle', item)"
      >
      <span :class="['text-sm transition-colors', selectedItems.includes(item) ? 'text-primary-700 font-medium' : 'text-gray-700 group-hover:text-gray-900']">{{ item }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from '@heroicons/vue/20/solid'

const props = defineProps<{
  items: string[]
  selectedItems: string[]
  type: 'color' | 'grid' | 'list'
  getColorHex?: (name: string) => string
}>()

defineEmits<{
  (e: 'toggle', value: string): void
}>()

const isLightColor = (colorName: string) => {
  const lightColors = ['Beyaz', 'Krem', 'Bej', 'Sarı']
  return lightColors.includes(colorName)
}
</script>
