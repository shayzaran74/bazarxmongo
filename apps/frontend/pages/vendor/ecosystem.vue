<script setup lang="ts">
definePageMeta({ middleware: ['vendor'] })

const {
  memberships, membershipCount, membershipLimit, canJoinMore, upgradeRequired,
  activeGarageSales, publishedListings, publishLoading,
  fetchMemberships, fetchActiveGarageSales, fetchPublishedListings,
  toggleBazarXPublish,
} = useVendorEcosystem()

const selectedEcosystemId = ref<string | null>(null)
const selectedEcosystem = computed(() =>
  memberships.value.find(m => m.ecosystem.id === selectedEcosystemId.value)
)

onMounted(async () => {
  await Promise.all([
    fetchMemberships(),
    fetchActiveGarageSales(),
    fetchPublishedListings(),
  ])
  if (memberships.value.length > 0) {
    selectedEcosystemId.value = memberships.value[0].ecosystem.id
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">

    <!-- HEADER + KOTA BANDI -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-medium text-gray-900">Ekosistemlerim</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ membershipCount }} / {{ membershipLimit }} ekosistem kullanımda
        </p>
      </div>
      <NuxtLink
        v-if="!canJoinMore && upgradeRequired"
        to="/pricing"
        class="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        {{ upgradeRequired }} üyeliğine geç → daha fazla ekosistem
      </NuxtLink>
    </div>

    <!-- KOTA PROGRESS BAR -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <div class="flex items-center justify-between text-sm mb-2">
        <span class="text-gray-600">Ekosistem kotası</span>
        <span class="font-medium">{{ membershipCount }}/{{ membershipLimit }}</span>
      </div>
      <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all"
          :class="membershipCount >= membershipLimit ? 'bg-red-500' : membershipCount / membershipLimit > 0.7 ? 'bg-amber-400' : 'bg-purple-500'"
          :style="{ width: `${Math.min((membershipCount / membershipLimit) * 100, 100)}%` }"
        />
      </div>
    </div>

    <!-- UPGRADE BANNER -->
    <EcosystemUpgradeBanner
      v-if="!canJoinMore && upgradeRequired"
      :current-tier="'CORE'"
      :current-count="membershipCount"
      :limit="membershipLimit"
      :upgrade-required="upgradeRequired"
    />

    <!-- ANA PANEL: Ekosistem kartları + sağ panel -->
    <div class="grid grid-cols-12 gap-6">

      <!-- SOL: Ekosistem Kart Listesi -->
      <div class="col-span-4 space-y-3">
        <div
          v-for="m in memberships"
          :key="m.ecosystem.id"
          class="bg-white border rounded-xl p-4 cursor-pointer transition-all"
          :class="selectedEcosystemId === m.ecosystem.id
            ? 'border-purple-500 ring-1 ring-purple-500'
            : 'border-gray-200 hover:border-gray-300'"
          @click="selectedEcosystemId = m.ecosystem.id"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700 font-medium text-sm flex-shrink-0">
              {{ m.ecosystem.name.slice(0, 2).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="font-medium text-gray-900 text-sm truncate">{{ m.ecosystem.name }}</p>
              <p class="text-xs text-gray-500">
                Üye: {{ new Date(m.joinedAt).toLocaleDateString('tr-TR') }}
              </p>
            </div>
          </div>
          <!-- Blind Pool badge -->
          <div v-if="m.ecosystem.isBlindPool" class="mt-3 flex items-center gap-1 text-xs text-gray-400">
            <span>🔒 Kör havuz — diğer bayi kimlikleri gizli</span>
          </div>
          <!-- Üyelik durumu -->
          <div class="mt-2">
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="m.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
            >
              {{ m.status === 'ACTIVE' ? 'Aktif' : m.status === 'SUSPENDED' ? 'Askıya alındı' : 'Çıkarıldı' }}
            </span>
          </div>
        </div>

        <!-- Boş durum -->
        <div v-if="memberships.length === 0" class="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p class="text-sm text-gray-500">Henüz hiçbir ekosisteme üye değilsin.</p>
          <NuxtLink to="/bazarborsa" class="text-sm text-purple-600 mt-2 inline-block">
            Ekosistem keşfet →
          </NuxtLink>
        </div>
      </div>

      <!-- SAĞ: Seçili ekosistem detayı -->
      <div class="col-span-8 space-y-4">
        <template v-if="selectedEcosystem">
          <EcosystemStatsSidebar :ecosystem-id="selectedEcosystem.ecosystem.id" />
          <EcosystemMembersTable :ecosystem-id="selectedEcosystem.ecosystem.id" />
          <EcosystemWatchtower :ecosystem-id="selectedEcosystem.ecosystem.id" />
        </template>
        <div v-else class="bg-gray-50 rounded-xl p-8 text-center text-sm text-gray-400">
          Detayları görmek için bir ekosistem seç
        </div>
      </div>
    </div>

    <!-- GARAJ GÜNÜ KAMPANYALARI -->
    <div v-if="activeGarageSales.length > 0">
      <h2 class="text-base font-medium text-gray-900 mb-3">Aktif Garaj Günü Kampanyaları</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <GarageSaleCard
          v-for="sale in activeGarageSales"
          :key="sale.id"
          :sale="sale"
        />
      </div>
    </div>

    <!-- BAZARX YAYIN YÖNETİMİ -->
    <div>
      <h2 class="text-base font-medium text-gray-900 mb-3">BazarX Yayın Yönetimi</h2>
      <BazarXPublishTable
        :listings="publishedListings"
        :loading="publishLoading"
        @toggle="toggleBazarXPublish"
      />
    </div>

  </div>
</template>