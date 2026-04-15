<script setup lang="ts">
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/vue/24/outline'
import type { Product } from '@barterborsa/shared-types'

interface Props {
  product: Product
}

defineProps<Props>()
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-8 space-y-8">
        <div
          v-if="product.technicalSpecifications"
          class="whitespace-pre-line text-slate-600 font-medium leading-relaxed"
        >
          {{ product.technicalSpecifications }}
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4"
        >
          <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
            <ChatBubbleBottomCenterTextIcon class="w-8 h-8 opacity-20" />
          </div>
          <p class="text-xs font-bold uppercase tracking-widest">
            {{ $t('products.detail.noSpecifications') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
