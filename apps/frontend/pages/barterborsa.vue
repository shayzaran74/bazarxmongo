<template>
  <SharedAccessGuard :requiresAuth="true" :requiresVendor="true" :requiresApex="true">
    <NuxtPage />
  </SharedAccessGuard>
</template>

<script setup>
// Bu parent route, /barterborsa/* altındaki tüm sayfalara otomatik olarak SharedAccessGuard uygular.
</script>
