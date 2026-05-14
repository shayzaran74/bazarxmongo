<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true">
    <NuxtPage />
  </AccessGuard>
</template>

<script setup>
// Bu parent route, /ticaritakas/* altındaki tüm sayfalara otomatik olarak AccessGuard uygular.
</script>
