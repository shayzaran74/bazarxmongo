<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[400] overflow-y-auto flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        @click="close"
      />
  
      <!-- Modal Content -->
      <div 
        class="relative bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden transform transition-all animate-scale-up border border-white/20 ring-1 ring-black/5"
      >
        <!-- Header -->
        <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 class="text-xl font-black text-gray-900 uppercase tracking-tightest italic flex items-center">
              <ShieldCheckIcon class="h-6 w-6 mr-3 text-primary-600" />
              {{ title }}
            </h2>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              Lütfen tüm maddeleri dikkatlice okuyunuz
            </p>
          </div>
          <button
            class="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
            @click="close"
          >
            <XMarkIcon class="h-5 w-5 text-gray-600" />
          </button>
        </div>
  
        <!-- Body -->
        <div class="p-8">
          <div class="max-h-[50vh] overflow-y-auto custom-scrollbar bg-gray-50/50 rounded-3xl p-8 border border-gray-100 text-sm leading-relaxed text-gray-600 font-medium whitespace-pre-wrap">
            {{ content }}
          </div>
          
          <div class="mt-8 flex items-center p-6 bg-primary-50 rounded-3xl border border-primary-100">
            <div class="p-3 bg-white rounded-2xl shadow-sm mr-4">
              <InformationCircleIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h4 class="text-xs font-black text-primary-900 uppercase tracking-wider">
                YASAL HATIRLATMA
              </h4>
              <p class="text-[11px] font-bold text-primary-700 mt-0.5">
                Bu formun onaylanması, Türk Borçlar Kanunu uyarınca ıslak imzalı taahhütname hükmündedir.
              </p>
            </div>
          </div>
        </div>
  
        <!-- Footer -->
        <div class="p-8 bg-gray-50 border-t border-gray-100 flex items-center gap-4">
          <button
            class="flex-1 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all"
            @click="close"
          >
            Vazgeç
          </button>
          <button
            class="flex-[2] bg-primary-600 hover:bg-primary-500 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-600/20 transition-all active:scale-95"
            @click="confirm"
          >
            Okudum, Onaylıyorum
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
  
<script setup>
import ShieldCheckIcon from '@heroicons/vue/24/outline/ShieldCheckIcon'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'
import InformationCircleIcon from '@heroicons/vue/24/outline/InformationCircleIcon'

defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  }
})
  
const emit = defineEmits(['close', 'confirm'])
  
const close = () => {
  emit('close')
}
  
const confirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.animate-scale-up {
  animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scale-up {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
