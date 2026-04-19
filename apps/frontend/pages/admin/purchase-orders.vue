<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Satın Alma Emirleri
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Tedarikçilerden sipariş edin ve envanter takip edin
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <EmptyState
        :icon="DocumentTextIcon"
        title="Satın alma emirleriniz yönedir"
        description="Tedarikçilerden sipariş edin ve envanter takip edin. Alıp satmayı bir arada yönetin."
        action-text="Satın alma emri oluştur"
        action-link="/admin/purchase-order-form"
      />
    </div>
  </div>
</template>

<script setup>
import { DocumentTextIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
</script>
