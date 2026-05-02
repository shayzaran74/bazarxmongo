<template>
  <div>
    <DashboardWantedItemsManager
      title="Ticari Takas İlan Onayları"
      subtitle="Üyelerin paylaştığı atıl kapasite ve stok ilanlarını yönetin."
      :is-admin="true"
      api-endpoint="/api/v1/surplus"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout:     'admin',
  middleware: ['admin'],
})
</script>
