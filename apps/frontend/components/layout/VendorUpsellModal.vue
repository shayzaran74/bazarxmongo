<template>
  <Transition name="fade">
    <div v-show="isOpen" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-md" @click="$emit('close')" />
      <div class="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-bounce-in">
        <!-- Premium Header Pattern -->
        <div class="absolute top-0 left-0 w-full h-36 bg-gradient-to-br from-indigo-600/10 to-purple-700/10" />

        <div class="p-10 pt-16 text-center relative">
          <div class="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200 rotate-6 hover:rotate-0 transition-transform duration-500">
            <BuildingOffice2Icon class="h-10 w-10 text-white" />
            <div class="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg">
              <LockClosedIcon class="h-5 w-5 text-red-500" />
            </div>
          </div>

          <h3 class="text-3xl font-black text-gray-900 mb-4 tracking-tighter italic uppercase leading-none">
            {{ $t('ecosystem.vendorRequired') }}
          </h3>

          <p class="text-[12px] font-bold text-gray-400 leading-relaxed mb-10 px-6 uppercase tracking-widest opacity-80">
            {{ $t('ecosystem.vendorDescription') }}
          </p>

          <div class="grid grid-cols-1 gap-4">
            <button
              class="w-full bg-indigo-600 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              @click="$emit('register')"
            >
              🚀 {{ $t('ecosystem.becomeVendor') }}
            </button>
            <button
              class="w-full bg-gray-50 text-gray-400 rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] hover:text-gray-900 transition-colors"
              @click="$emit('close')"
            >
              DAHA SONRA BELKİ
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { BuildingOffice2Icon, LockClosedIcon } from '@heroicons/vue/24/outline'

defineProps({ isOpen: Boolean })
defineEmits(['close', 'register'])
</script>
