<script setup lang="ts">
import { ClipboardDocumentListIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { Product } from '@barterborsa/shared-types'
import type { CategoryAttribute } from '~/types/product-form'

interface Props {
  categoryAttributes: CategoryAttribute[]
  foundCatalogProduct: Product | null
  isEditing: boolean
}

defineProps<Props>()
const technicalSpecifications = defineModel<Record<string, string | number | boolean | null | undefined>>('technicalSpecifications', { required: true })
</script>

<template>
  <section
    v-if="categoryAttributes.length > 0"
    id="attributes"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    :class="{ 'opacity-50 grayscale select-none pointer-events-none': foundCatalogProduct && !isEditing }"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-purple-100 p-2 rounded-lg">
          <ClipboardDocumentListIcon class="h-5 w-5 text-purple-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          3. Kategoriye Özel Özellikler
        </h3>
      </div>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="attr in categoryAttributes"
          :key="attr.id"
          class="space-y-1.5"
        >
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider">
            {{ attr.label }} <span
              v-if="attr.isRequired"
              class="text-red-500 ml-0.5"
            >*</span>
          </label>

          <!-- Select Option -->
          <div
            v-if="attr.type === 'select' && attr.options"
            class="relative"
          >
            <select
              v-model="technicalSpecifications[attr.name]"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">
                Seçiniz
              </option>
              <option
                v-for="opt in (typeof attr.options === 'string' ? JSON.parse(attr.options) : attr.options)"
                :key="opt"
                :value="opt"
              >
                {{ opt }}
              </option>
            </select>
            <ChevronDownIcon class="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <!-- Number -->
          <div
            v-else-if="attr.type === 'number'"
            class="relative"
          >
            <input
              v-model.number="technicalSpecifications[attr.name]"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              :placeholder="attr.placeholder || '0'"
            >
            <span
              v-if="attr.unit"
              class="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400"
            >{{ attr.unit }}</span>
          </div>

          <!-- Text (Default) -->
          <input
            v-else
            v-model="technicalSpecifications[attr.name]"
            type="text"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            :placeholder="attr.placeholder || ''"
          >
        </div>
      </div>
    </div>
  </section>
</template>
