<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true">
    <div class="min-h-screen bg-[#000814]">
      <TtHero />
      <TtBento />
      <TtTiers />
      <TtTrust />
      <TtApply />
    </div>
  </AccessGuard>
</template>

<script setup lang="ts">
import TtHero  from '~/components/ticaritakas/TtHero.vue'
import TtBento from '~/components/ticaritakas/TtBento.vue'
import TtTiers from '~/components/ticaritakas/TtTiers.vue'
import TtTrust from '~/components/ticaritakas/TtTrust.vue'
import TtApply from '~/components/ticaritakas/TtApply.vue'

definePageMeta({ layout: 'default' })
useHead({
  title: 'Ticari Takas Ekosistemi | BazarX',
  meta: [{ name: 'description', content: 'Türkiye\'nin #1 kurumsal B2B takas platformu. Firma başvurusu yapın, fazla stoklarınızı nakit kullanmadan takas edin.' }]
})
</script>
