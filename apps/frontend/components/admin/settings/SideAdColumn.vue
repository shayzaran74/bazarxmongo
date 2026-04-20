<script setup lang="ts">
import draggable from 'vuedraggable'
import { Bars2Icon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  modelValue: any[]
  side: 'LEFT' | 'RIGHT'
  title: string
  loading: boolean
}>()

const emit = defineEmits(['update:modelValue', 'edit', 'delete', 'dragEnd'])

const { resolveImageUrl } = useAppImage()

const ads = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between px-2">
      <h2 class="text-lg font-black flex items-center uppercase tracking-widest" :class="side === 'LEFT' ? 'text-primary-900' : 'text-purple-900'">
        <slot name="icon"></slot> {{ title }}
      </h2>
      <span :class="ads.length > 10 ? 'text-red-500' : 'text-gray-400'" class="text-[10px] font-black bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
        {{ ads.length }}/10
      </span>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-gray-50 animate-pulse rounded-3xl" />
    </div>

    <div v-else class="min-h-[200px] border-2 border-dashed border-gray-100 rounded-[3rem] p-6 bg-gray-50/30">
      <draggable
        v-model="ads"
        item-key="id"
        handle=".drag-handle"
        tag="div"
        class="space-y-4"
        @end="$emit('dragEnd')"
      >
        <template #item="{ element }">
          <div class="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group flex items-center gap-5">
            <div class="drag-handle cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-gray-600">
              <Bars2Icon class="h-5 w-5" />
            </div>
            <div class="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 italic font-black text-2xl flex items-center justify-center">
              <img v-if="element.image" :src="resolveImageUrl(element.image)" class="w-full h-full object-cover">
              <span v-else>{{ element.emoji || '🎁' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                 <span class="text-[9px] font-black uppercase text-primary-500 tracking-widest">{{ element.category || 'GENEL' }}</span>
                 <span :class="element.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                  {{ element.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </div>
              <h4 class="font-black text-gray-900 truncate italic tracking-tighter">{{ element.title }}</h4>
              <p class="text-[10px] text-gray-400 font-medium truncate">{{ element.subtitle }}</p>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
              <button class="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors" @click="$emit('edit', element)">
                <PencilIcon class="h-5 w-5" />
              </button>
              <button class="p-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors" @click="$emit('delete', element.id)">
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
