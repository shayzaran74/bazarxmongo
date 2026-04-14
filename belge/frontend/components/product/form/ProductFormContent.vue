<script setup lang="ts">
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import type { Product } from '@barterborsa/shared-types'

interface Props {
  description: string
  technicalSpecificationsRaw: string
  foundCatalogProduct: Product | null
  isEditing: boolean
}

defineProps<Props>()
const emit = defineEmits(['update:description', 'update:technicalSpecificationsRaw'])
</script>

<template>
  <section
    id="content"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    :class="{ 'opacity-50 grayscale select-none pointer-events-none': foundCatalogProduct && !isEditing }"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-amber-100 p-2 rounded-lg">
          <DocumentTextIcon class="h-5 w-5 text-amber-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          4. Açıklama ve Teknik Detaylar
        </h3>
      </div>
    </div>
    <div class="p-6 space-y-6">
      <div>
        <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Ürün Açıklaması *</label>
        <textarea
          :value="description"
          rows="8"
          required
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          placeholder="Müşterileri ikna edecek detaylı bir açıklama yazın..."
          @input="e => emit('update:description', (e.target as HTMLTextAreaElement).value)"
        />
      </div>

      <div>
        <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
          Her satıra bir özellik gelecek şekilde yazabilirsiniz. Örn: Materyal: Pamuk
        </label>
        <textarea
          :value="technicalSpecificationsRaw"
          rows="4"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          placeholder="Örn: Materyal: Deri"
          @input="e => emit('update:technicalSpecificationsRaw', (e.target as HTMLTextAreaElement).value)"
        />
      </div>
    </div>
  </section>
</template>
