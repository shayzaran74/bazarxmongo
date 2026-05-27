<template>
  <div>
    <!-- Not Logged In -->
    <div v-if="requiresAuth && !authStore.isAuthenticated" class="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <h2 class="text-2xl font-bold mb-4">Giriş Yapmanız Gerekiyor</h2>
        <NuxtLink to="/auth/login" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">Giriş Yap</NuxtLink>
      </div>
    </div>

    <!-- Not a Vendor -->
    <div v-else-if="requiresVendor && (!authStore.isVendor || (authStore.vendorStatus !== 'APPROVED' && !authStore.isAdmin))" class="min-h-[80vh] flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <div class="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-gray-900 mb-4">Satıcı Kaydı Gerekli</h2>
        <p class="text-gray-600 mb-8">Bu sayfaya erişebilmek için onaylı bir satıcı hesabınız olması gerekmektedir. Lütfen satıcı kaydınızı oluşturun.</p>
        <NuxtLink to="/become-vendor" class="block w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-1">
          Satıcı Kaydı Oluştur
        </NuxtLink>
      </div>
    </div>

    <!-- Not APEX -->
    <div v-else-if="requiresApex && !isApexOrAdmin" class="min-h-[80vh] flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-[#000814] p-8 rounded-2xl shadow-2xl text-center border border-yellow-500/30 relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div class="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-yellow-500/30">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
        </div>
        <h2 class="text-2xl font-black text-white mb-4 relative z-10">APEX Tier Gerekli</h2>
        <p class="text-gray-400 mb-8 relative z-10">Barter Borsa ekosistemine sadece APEX seviyesindeki premium firmalar erişebilir.</p>
        <NuxtLink to="/premium" class="block w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-400 text-gray-900 rounded-xl font-black uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all hover:-translate-y-1 relative z-10">
          Lütfen Tier APEX Yükseltin
        </NuxtLink>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  requiresAuth: { type: Boolean, default: true },
  requiresVendor: { type: Boolean, default: false },
  requiresApex: { type: Boolean, default: false },
})

const isApexOrAdmin = computed(() => {
  if (authStore.isAdmin) return true;
  const tier = authStore.user?.vendor?.tier;
  return tier === 'APEX' || tier === 'APEX_PLUS';
})
</script>
