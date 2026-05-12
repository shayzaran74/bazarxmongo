<template>
  <div class="space-y-8 animate-fade-in-up">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Mağaza Tipinizi Seçin</h2>
      <p class="text-sm text-gray-500">İşletmenize en uygun olan kategoriyi belirleyin</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        v-for="type in vendorTypes"
        :key="type.value"
        type="button"
        @click="$emit('update:modelValue', { ...modelValue, vendorType: type.value })"
        class="relative p-6 border-2 rounded-2xl transition-all group text-left"
        :class="[
          modelValue.vendorType === type.value
            ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
        ]"
      >
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors"
          :class="modelValue.vendorType === type.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'"
        >
          <component :is="type.icon" class="w-7 h-7" />
        </div>
        <h3 class="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">{{ type.label }}</h3>
        <p class="text-xs text-gray-500 leading-relaxed">{{ type.description }}</p>
        <div
          v-if="modelValue.vendorType === type.value"
          class="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
        >
          <span class="text-white text-xs font-black">✓</span>
        </div>
      </button>
    </div>

    <div v-if="modelValue.vendorType" class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div class="flex items-center gap-2 text-sm">
        <CheckCircleIcon class="w-5 h-5 text-primary-500" />
        <span class="font-medium text-gray-700">
          {{ selectedTypeLabel }} seçtiniz.
          <template v-if="modelValue.vendorType === 'RESTAURANT'">
            Restoran olarak kayıt olduğunuzda yemek teslimatı ve hazırlık süreçleri yönetebileceksiniz.
          </template>
          <template v-else-if="modelValue.vendorType === 'MARKET'">
            Market olarak kayıt olduğunuzda taze ürünlerinizi listeleyebileceksiniz.
          </template>
          <template v-else-if="modelValue.vendorType === 'COMMERCE'">
            E-ticaret olarak kayıt olduğunuzda ürünlerinizi kargoya gönderebileceksiniz.
          </template>
          <template v-else>
            Hizmet olarak kayıt olduğunuzda profesyonel hizmetlerinizi sunabileceksiniz.
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingBagIcon,
  CakeIcon,
  BuildingStorefrontIcon,
  WrenchIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  modelValue: {
    vendorType: string
    [key: string]: any
  }
}>()

defineEmits(['update:modelValue'])

const vendorTypes = [
  {
    value: 'COMMERCE',
    label: 'E-Ticaret',
    description: 'Giyim, elektronik, ev eşyaları gibi ürünlerinizi kargo ile gönderin',
    icon: ShoppingBagIcon
  },
  {
    value: 'RESTAURANT',
    label: 'Restoran',
    description: 'Yemeklerinizi hazırlayıp kurye ile teslim edin',
    icon: CakeIcon
  },
  {
    value: 'MARKET',
    label: 'Market',
    description: 'Taze ürün, bakkal ve süpermarket ürünleri satın',
    icon: BuildingStorefrontIcon
  },
  {
    value: 'SERVICE',
    label: 'Hizmet',
    description: 'Tamir, temizlik, organizasyon gibi profesyonel hizmetler sunun',
    icon: WrenchIcon
  }
]

const selectedTypeLabel = computed(() => {
  return vendorTypes.find(t => t.value === props.modelValue.vendorType)?.label || ''
})
</script>