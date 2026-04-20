<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <VendorSidebar
      :pending-order-count="pendingOrderCount"
      :full-name="authStore.fullName"
      :user-email="authStore.user?.email"
      :avatar-url="authStore.avatarUrl"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <VendorHeader :page-title="pageTitle" />

      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import VendorSidebar from '~/components/layout/vendor/VendorSidebar.vue'
import VendorHeader from '~/components/layout/vendor/VendorHeader.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { $api } = useApi()

const routeTitles: Record<string, string> = {
  '/vendor/dashboard': 'Dashboard',
  '/vendor/products': 'Ürünler',
  '/vendor/inventory': 'Envanter',
  '/vendor/order': 'Siparişler',
  '/vendor/analytic': 'Satış Analizi',
  '/vendor/setting': 'Ayarlar',
  '/vendor/transfers': 'Aktarımlar',
  '/vendor/advertising': 'Reklam Yönetimi',
  '/vendor/brands': 'Marka Yönetimi',
  '/vendor/banners': 'Banner Yönetimi',
  '/vendor/financial': 'Finansal Raporlar'
}

const pageTitle = computed(() => {
  const path = route.path
  if (routeTitles[path]) return routeTitles[path]
  const matchedKey = Object.keys(routeTitles)
    .sort((a, b) => b.length - a.length)
    .find(key => path.startsWith(key) && key !== '/vendor/dashboard')
  return matchedKey ? routeTitles[matchedKey] : 'Satıcı Paneli'
})

// Pending orders polling
const pendingOrderCount = ref(0)
let pendingOrderInterval: ReturnType<typeof setInterval> | null = null

const fetchPendingOrderCount = async () => {
  try {
    const response = await $api('/api/vendors/orders/pending-count')
    if (response.success) {
      const data = response.data as any
      pendingOrderCount.value = data.pendingCount || data
    }
  } catch {
    console.error('Failed to fetch pending order count')
  }
}

onMounted(async () => {
  await authStore.init()
  if (authStore.isVendor && authStore.vendorStatus === 'APPROVED') {
    fetchPendingOrderCount()
    pendingOrderInterval = setInterval(fetchPendingOrderCount, 300000)
  }
})

onUnmounted(() => {
  if (pendingOrderInterval) clearInterval(pendingOrderInterval)
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    useNuxtApp().$toast.success('Çıkış yapıldı!')
    await router.push('/login')
  } catch {
    useNuxtApp().$toast.error('Çıkış yapılırken bir hata oluştu!')
  }
}
</script>