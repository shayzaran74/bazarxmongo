<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
      Kuponlarım & Escrow Hediyelerim
    </h1>
    <p class="text-gray-500 mb-6 font-medium">
      Satıcılar tarafından dağıtılan özel indirimler ve bedava ürün
      (Ad-Swap) kodlarınız burada listelenir.
    </p>

    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
    </div>

    <div
      v-else-if="coupons.length === 0"
      class="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
    >
      <TicketIcon class="h-20 w-20 text-gray-300 mx-auto mb-4" />
      <p class="text-xl font-bold text-gray-600">
        Henüz hiç kuponunuz yok.
      </p>
      <p class="text-gray-400 mt-2">
        BazarX kampanyalarını takip ederek kupon kazanabilirsiniz.
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div
        v-for="coupon in coupons"
        :key="coupon.id"
        class="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100 hover:shadow-lg transition-all group group-hover:bg-gradient-to-br from-orange-50/50 to-white"
      >
        <div
          class="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"
        />

        <div class="p-6 flex flex-col md:flex-row gap-6">
          <!-- Ürün Görseli veya İkon -->
          <div
            class="flex-shrink-0 w-24 h-24 bg-orange-100 rounded-xl overflow-hidden flex items-center justify-center border border-orange-200"
          >
            <img
              v-if="coupon.Listing?.CatalogProduct?.images?.length > 0"
              :src="coupon.Listing.CatalogProduct.images[0]"
              class="w-full h-full object-cover"
            >
            <GiftIcon
              v-else
              class="w-10 h-10 text-orange-500"
            />
          </div>

          <div class="flex-1 flex flex-col justify-center">
            <h3 class="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span
                v-if="coupon.rewardType === 'FREE_ITEM'"
                class="bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide"
              >BEDAVA
                ÜRÜN</span>
              <span
                v-else
                class="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide"
              >%
                İNDİRİM</span>
              {{ coupon.Vendor?.storeName || 'BazarX Satıcısı' }}
            </h3>

            <p
              v-if="coupon.Listing"
              class="text-sm text-gray-600 font-medium mb-2 leading-snug"
            >
              {{ coupon.Listing.CatalogProduct?.name || 'Özel Ürün' }}
            </p>

            <div class="flex items-center gap-3 mt-auto">
              <div class="text-2xl font-black text-orange-600">
                {{ formatCurrency(coupon.rewardValue) }} <span
                  class="text-sm font-bold text-orange-400"
                >Değerinde</span>
              </div>
            </div>

            <!-- Status & Action -->
            <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span
                :class="{
                  'text-green-600 bg-green-50 border-green-200': coupon.status === 'ACTIVE',
                  'text-gray-500 bg-gray-50 border-gray-200': coupon.status === 'REDEEMED',
                  'text-red-500 bg-red-50 border-red-200': coupon.status === 'LOCKED'
                }"
                class="px-3 py-1 rounded-full text-xs font-bold border"
              >
                {{ formatStatus(coupon.status) }}
              </span>

              <NuxtLink
                v-if="coupon.status === 'ACTIVE' && coupon.Listing"
                :to="`/products/${coupon.Listing.id}`"
                class="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Ürüne Git
                <ArrowRightIcon class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TicketIcon, GiftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useApi } from '~/composables/useApi'



const { $api } = useApi()
const coupons = ref([])
const loading = ref(true)

const fetchCoupons = async () => {
    loading.value = true
    try {
        const response = await $api('/api/escrow-coupons')
        if (response.success) {
            coupons.value = response.data
        }
    } catch (error) {
        console.error('Failed to fetch coupons:', error)
    } finally {
        loading.value = false
    }
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
}

const formatStatus = (status) => {
    const map = {
        'ACTIVE': 'Kullanıma Hazır',
        'LOCKED': 'Kilitli (Bekliyor)',
        'REDEEMED': 'Kullanıldı',
        'CANCELLED': 'İptal Edildi'
    }
    return map[status] || status
}

onMounted(() => {
    fetchCoupons()
})
</script>
