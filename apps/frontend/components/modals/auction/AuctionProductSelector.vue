<template>
  <div v-if="!isEditing">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Ürün Seçin *
    </label>
    <select
      :value="modelValue"
      required
      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">
        Listeden Bir Ürün Seçin...
      </option>
      <option
        v-for="product in products"
        :key="product.id"
        :value="product.id"
      >
        {{ product.name }} (Stok: {{ product.stock }}) - {{ formatPrice(product.price) }}
      </option>
    </select>

    <!-- Product Preview -->
    <div
      v-if="selectedProduct"
      class="mt-4 flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
    >
      <img
        :src="resolveImageUrl(selectedProduct.image)"
        class="w-16 h-16 rounded-lg object-cover shadow-sm mr-4"
      >
      <div>
        <p class="text-sm font-bold text-gray-900">
          {{ selectedProduct.name }}
        </p>
        <p class="text-xs text-gray-500">
          {{ formatPrice(selectedProduct.price) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppImage } from '#imports'

const { resolveImageUrl } = useAppImage()

defineProps<{
  modelValue: string
  products: any[]
  selectedProduct: any
  isEditing: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}
</script>
