<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-dark-950/40 backdrop-blur-sm z-[100]" @click="close" />
    </Transition>

    <Transition name="slide">
      <div v-if="modelValue" class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-xl font-display font-black text-slate-800 italic tracking-tighter">{{ title }}</h2>
          <button @click="close" class="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <Icon name="heroicons:x-mark" class="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div class="flex-grow overflow-y-auto p-6 custom-scrollbar">
          <slot />
        </div>

        <div v-if="$slots.footer" class="p-6 border-t border-slate-100 bg-slate-50/50">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
