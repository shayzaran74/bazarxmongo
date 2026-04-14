<script setup lang="ts">
import type { Product } from '@barterborsa/shared-types'

interface Props {
  product: Product
}

defineProps<Props>()
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-headings:font-black">
        <h2 class="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">
          {{ product.name }}
        </h2>
        <div class="whitespace-pre-line text-slate-600 leading-relaxed font-medium">
          {{ product.description }}
        </div>
      </div>
      <!-- Quick Specs List -->
      <div class="space-y-6">
        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">
          {{ $t('products.detail.keyFeatures') }}
        </h3>
        <div class="grid gap-3">
          <div
            v-if="product.Brand"
            class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
          >
            <span class="text-xs font-bold text-slate-500 uppercase">{{ $t('products.detail.brand') }}</span>
            <span class="text-xs font-black text-slate-900 uppercase">
              {{ (product.Brand && typeof product.Brand === 'object' && 'name' in product.Brand) ? product.Brand.name : product.Brand }}
            </span>
          </div>
          <div
            v-if="product.weight"
            class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
          >
            <span class="text-xs font-bold text-slate-500 uppercase">{{ $t('products.detail.weight') }}</span>
            <span class="text-xs font-black text-slate-900 uppercase">{{ product.weight }} KG</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
