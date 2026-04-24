<template>
  <div class="mt-6 pt-6 border-t border-gray-100">
    <label class="text-[10px] font-black text-gray-400 upper tracking-widest block mb-2">
      İNDİRİM KUPONU
    </label>
    <div class="flex gap-2">
      <input 
        v-model="couponCode" 
        type="text"
        class="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
        placeholder="Kupon kodunuz" 
        :disabled="!!appliedCoupon" 
      >
      <button 
        v-if="!appliedCoupon" 
        :disabled="!couponCode || validating" 
        class="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
        @click="$emit('apply', couponCode)"
      >
        <span
          v-if="validating"
          class="flex items-center"
        >
          <div class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2" />
          Uygulanıyor
        </span>
        <span v-else>UYGULA</span>
      </button>
      <button 
        v-else 
        class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
        @click="$emit('remove')"
      >
        KALDIR
      </button>
    </div>
    <p
      v-if="error"
      class="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase"
      data-testid="form-error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CheckoutCoupon } from '@barterborsa/shared-types'

const props = defineProps({
  appliedCoupon: { type: Object as () => CheckoutCoupon | null, default: null },
  validating: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

defineEmits(['apply', 'remove'])

const couponCode = ref('')

// Clear local input when coupon is applied or removed externally if needed
watch(() => props.appliedCoupon, (newVal) => {
  if (!newVal) {
    couponCode.value = ''
  } else {
    couponCode.value = newVal.code
  }
}, { immediate: true })
</script>
