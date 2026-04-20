<script setup lang="ts">
import { InformationCircleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title: string
  content: string
}>()
</script>

<template>
  <div v-if="content" class="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-10 pb-8 border-b border-gray-50">
        <div class="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
          <InformationCircleIcon class="w-7 h-7" />
        </div>
        <h3 class="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
          {{ title }}
        </h3>
      </div>
      
      <div class="prose prose-orange max-w-none">
        <div class="text-sm font-medium text-gray-400 leading-loose whitespace-pre-line">
          {{ content }}
        </div>
      </div>
    </div>
  </div>
</template>
