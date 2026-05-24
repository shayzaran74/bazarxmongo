<template>
  <SharedAccessGuard :requiresAuth="true" :requiresVendor="true">
    <NuxtPage />
  </SharedAccessGuard>
</template>

<script setup>
// Bu parent route, /ticaritakas/* altındaki tüm sayfalara otomatik olarak SharedAccessGuard uygular.
</script>
