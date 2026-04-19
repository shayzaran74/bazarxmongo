<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-6">
      Müşteri
    </h2>
    <div class="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
      <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg overflow-hidden">
        <img
          v-if="user?.profile?.avatar || user?.avatar"
          :src="user?.profile?.avatar || user?.avatar"
          class="w-full h-full object-cover"
        >
        <span v-else>{{ (user?.profile?.firstName || user?.name || 'A').charAt(0) }}</span>
      </div>
      <div class="flex-1">
        <p class="font-bold text-gray-900">
          {{ user?.profile ? `${user.profile.firstName} ${user.profile.lastName || ''}` : (user?.name || 'Anonim Müşteri') }}
        </p>
        <p class="text-xs text-gray-500">
          {{ user?.email }}
        </p>
      </div>
    </div>

    <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
      Teslimat Adresi
    </h3>
    <div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed italic">
      <template v-if="parsedAddress">
        <p class="font-bold mb-1">
          {{ parsedAddress.name }}
        </p>
        <p>{{ parsedAddress.address }}</p>
        <p>{{ parsedAddress.postalCode }} {{ parsedAddress.city }}</p>
        <p>{{ parsedAddress.country || 'Türkiye' }}</p>
      </template>
      <p v-else>
        {{ rawAddress || 'Adres bilgisi girilmemiş' }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  parsedAddress: {
    type: Object,
    default: () => ({})
  },
  rawAddress: {
    type: String,
    default: ''
  }
})
</script>
