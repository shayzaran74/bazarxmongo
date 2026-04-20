<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar
      :navigation="navigation"
      :full-name="authStore.fullName"
      :user-role="authStore.user?.role"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <AdminHeader :page-title="pageTitle" />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-[#FBFBFE] custom-scrollbar">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useAdminNavigation } from '~/composables/useAdminNavigation'
import AdminSidebar from '~/components/layout/admin/AdminSidebar.vue'
import AdminHeader from '~/components/layout/admin/AdminHeader.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const { navigation, getPageTitle } = useAdminNavigation(authStore.isSuperAdmin)

const pageTitle = computed(() => getPageTitle(route.path))

onMounted(async () => {
  await authStore.init()
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
  } else if (!authStore.isAdmin) {
    console.warn('🚫 Admin Layout: Access denied', { role: authStore.user?.role })
    router.push('/')
  }
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    useNuxtApp().$toast.success('Çıkış yapıldı!')
    router.push('/login')
  } catch {
    useNuxtApp().$toast.error('Hata oluştu!')
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>
