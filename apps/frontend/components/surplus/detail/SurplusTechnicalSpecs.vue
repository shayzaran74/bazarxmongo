<template>
  <div v-if="item.materialType || (item.technicalSpecs && Object.keys(item.technicalSpecs).length > 0)" class="space-y-12 italic">
    <div class="flex items-center space-x-6">
      <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tightest italic">TEKNİK DETAYLAR</h2>
      <div class="h-2 flex-1 bg-gradient-to-r from-neutral-100 to-transparent rounded-full shadow-inner" />
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div v-if="item.materialType" class="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all relative overflow-hidden">
        <div class="flex items-center space-x-4 mb-4 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            <SparklesIcon class="h-6 w-6" />
          </div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none pt-1">MALZEME TİPİ</p>
        </div>
        <p class="text-xl font-black text-gray-900 uppercase truncate relative z-10">{{ item.materialType }}</p>
      </div>

      <template v-if="item.technicalSpecs">
        <div v-for="(val, key) in item.technicalSpecs" :key="key" class="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all relative overflow-hidden">
          <div class="flex items-center space-x-4 mb-4 relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <div class="w-2.5 h-2.5 rounded-full border-[3px] border-current" />
            </div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none pt-1">{{ key }}</p>
          </div>
          <p class="text-xl font-black text-gray-900 uppercase truncate relative z-10">{{ val }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { SparklesIcon } from '@heroicons/vue/24/outline'
defineProps({ item: Object })
</script>
