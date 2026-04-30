<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950 pb-20">
    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center h-64">
      <div class="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <template v-else-if="restaurant">
      <!-- Header -->
      <div class="relative h-64 overflow-hidden">
        <img
          v-if="restaurant.imageUrl"
          :src="restaurant.imageUrl"
          :alt="restaurant.name"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        <div class="absolute bottom-6 left-6">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6 }"
          >
            <h1 class="text-3xl font-black text-white">{{ restaurant.name }}</h1>
            <p class="text-slate-300 mt-1">{{ restaurant.city }}{{ restaurant.district ? ` · ${restaurant.district}` : '' }}</p>
            <span v-if="restaurant.isLaunchPartner" class="mt-2 inline-block bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Lansman Ortağı
            </span>
          </Motion>
        </div>
      </div>

      <!-- Menüler -->
      <div class="max-w-4xl mx-auto px-4 mt-8">
        <h2 class="text-white font-bold text-xl mb-6">Menüler</h2>

        <div class="space-y-4">
          <Motion
            v-for="(menu, i) in restaurant.menus"
            :key="menu.id"
            :initial="{ opacity: 0, filter: 'blur(8px)', y: 16 }"
            :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
            :transition="{ duration: 0.45, delay: i * 0.09 }"
          >
            <div class="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 transition-colors">
              <div class="flex gap-4">
                <img
                  v-if="menu.imageUrl"
                  :src="menu.imageUrl"
                  :alt="menu.title"
                  class="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-bold text-lg">{{ menu.title }}</h3>
                  <p v-if="menu.description" class="text-slate-400 text-sm mt-1 line-clamp-2">{{ menu.description }}</p>

                  <!-- Fiyat detayı -->
                  <div class="mt-3 bg-white/5 rounded-xl p-3 text-sm space-y-1">
                    <div class="flex justify-between text-slate-400">
                      <span>Tam fiyat</span>
                      <span class="line-through">{{ menu.originalPrice.toLocaleString('tr-TR') }}₺</span>
                    </div>
                    <div class="flex justify-between text-slate-300">
                      <span>%50 indirimli</span>
                      <span>{{ menu.discountedPrice.toLocaleString('tr-TR') }}₺</span>
                    </div>
                    <div class="flex justify-between text-slate-400">
                      <span>Hizmet (%8) + KDV</span>
                      <span>+{{ (menu.pricing.serviceFee + menu.pricing.vatAmount).toLocaleString('tr-TR') }}₺</span>
                    </div>
                    <div class="flex justify-between font-bold text-white border-t border-white/10 pt-2 mt-2">
                      <span>Toplam ödeme</span>
                      <span class="text-purple-400">{{ menu.pricing.totalPaid.toLocaleString('tr-TR') }}₺</span>
                    </div>
                    <div class="text-center text-emerald-400 text-xs font-bold">
                      {{ menu.pricing.savings.toLocaleString('tr-TR') }}₺ tasarruf
                    </div>
                  </div>
                </div>
              </div>

              <!-- Satın Al -->
              <div class="mt-4 flex gap-3">
                <Motion
                  :while-hover="{ scale: 1.05 }"
                  :while-tap="{ scale: 0.95 }"
                  class="flex-1"
                >
                  <button
                    class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    :disabled="purchasing === menu.id"
                    @click="purchase(menu.id)"
                  >
                    {{ purchasing === menu.id ? 'İşleniyor...' : 'Satın Al + QR Al' }}
                  </button>
                </Motion>
              </div>
            </div>
          </Motion>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

import { ref } from 'vue'
import { useRoute } from 'vue-router'
const { $api } = useApi()
const route    = useRoute()
const toast    = useNuxtApp().$toast

interface MenuPricing { totalPaid: number; serviceFee: number; vatAmount: number; savings: number }
interface RestaurantMenu { id: string; title: string; description?: string; imageUrl?: string
  originalPrice: number; discountedPrice: number; pricing: MenuPricing }
interface Restaurant { id: string; name: string; city: string; district?: string; imageUrl?: string
  isLaunchPartner: boolean; menus: RestaurantMenu[] }

const restaurant = ref<Restaurant | null>(null)
const pending    = ref(true)
const purchasing = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await $api<Restaurant>(`/api/menu/restaurants/${route.params.id}`)
    restaurant.value = res.data ?? null
  } catch { toast?.error('Restoran yüklenemedi') }
  finally  { pending.value = false }
})

async function purchase(menuId: string) {
  purchasing.value = menuId
  try {
    const res = await $api<{ qrCode: string; oneFreeQrCode: string }>(`/api/menu/purchase/${menuId}`, { method: 'POST' })
    if (res.data) {
      toast?.success('QR kodunuz hazır! Menülerim sayfasından görebilirsiniz.')
      await navigateTo('/menu/my-menus')
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast?.error(err.data?.message ?? 'Satın alım başarısız')
  } finally {
    purchasing.value = null
  }
}
</script>
