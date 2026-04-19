<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      />
      <div class="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all">
        <h3 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
          {{ $t('profile.profilePhoto') }}
        </h3>
        
        <div
          v-if="preview"
          class="mb-6"
        >
          <img
            :src="preview" 
            class="w-32 h-32 mx-auto rounded-full object-cover border-4 border-primary-50 shadow-inner"
          >
        </div>
        
        <div class="space-y-3">
          <button
            class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg active:scale-[0.98]" 
            @click="$emit('triggerUpload')"
          >
            {{ $t('profile.selectPhoto') }}
          </button>
          
          <button
            v-if="preview"
            :disabled="loading"
            class="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg active:scale-[0.98]"
            @click="$emit('save')"
          >
            {{ loading ? $t('common.processing') : $t('profile.save') }}
          </button>
          
          <button
            class="w-full text-gray-500 py-2 hover:bg-gray-50 rounded-xl transition-colors font-medium" 
            @click="$emit('close')"
          >
            {{ $t('profile.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  preview: {
    type: String,
    default: ''
  },
  loading: Boolean
})

defineEmits(['close', 'triggerUpload', 'save'])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
