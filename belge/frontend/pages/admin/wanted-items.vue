<template>
  <div>
    <DashboardWantedItemsManager
      title="İstek Onay ve Yönetim"
      subtitle="Kullanıcılar ve firmalar tarafından oluşturulan alım/satım isteklerini yönetin."
      :is-admin="true"
      api-endpoint="/api/admin/wanted-items"
    />
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    middleware: ['admin'] // Assuming 'admin' middleware exists for protection
})
</script>
