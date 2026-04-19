<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-gray-900">
        {{ $t('profile.registeredAddresses') }}
      </h3>
      <button
        class="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition text-sm font-semibold"
        @click="$emit('add')"
      >
        <PlusIcon class="h-4 w-4" /> {{ $t('profile.addNewAddress') }}
      </button>
    </div>
    
    <div
      v-if="addressStore.loading && addressStore.addresses.length === 0"
      class="flex justify-center py-12"
    >
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
    <div
      v-else-if="addressStore.addresses.length === 0"
      class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
    >
      <MapPinIcon class="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-500">
        {{ $t('profile.noAddressFound') }}
      </p>
    </div>
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div
        v-for="address in addressStore.addresses"
        :key="address.id"
        class="bg-white border-2 rounded-2xl p-4 relative"
        :class="address.isDefault ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100'"
      >
        <div
          v-if="address.isDefault"
          class="absolute top-4 right-4 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
        >
          {{ $t('profile.default') }}
        </div>
        <h4 class="font-bold text-gray-900 mb-1">
          {{ address.title }}
        </h4>
        <p class="text-sm font-semibold text-gray-800">
          {{ address.fullName }}
        </p>
        <p class="text-sm text-gray-600 mt-1">
          {{ address.addressLine }}
        </p>
        <p class="text-sm text-gray-600">
          {{ address.district }} / {{ address.city }}
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Tel: {{ address.phone }}
        </p>
        <div class="mt-4 pt-4 border-t flex justify-end gap-3">
          <button
            class="text-gray-600 hover:text-primary-600 text-xs font-bold flex items-center gap-1"
            @click="$emit('edit', address)"
          >
            <PencilIcon class="h-3.5 w-3.5" /> {{ $t('profile.edit') }}
          </button>
          <button
            class="text-gray-400 hover:text-red-600 text-xs font-bold flex items-center gap-1"
            @click="$emit('delete', address.id)"
          >
            <TrashIcon class="h-3.5 w-3.5" /> {{ $t('profile.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, MapPinIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

defineProps({
  addressStore: {
    type: Object,
    default: () => ({ addresses: [], loading: false })
  }
})

defineEmits(['add', 'edit', 'delete'])
</script>
