<template>
  <div class="min-h-screen bg-neutral-50/50">
    <!-- Side Advertisements -->
    <VendorProfileAdSide
      :vendor="vendor || {}"
      @add-to-cart="addToCart"
    />

    <!-- Vendor Banner Slider -->
    <VendorBannerSlider :vendor-id="(route.params.id as string)" />

    <!-- Vendor Header -->
    <VendorProfileHeader
      :vendor="vendor || {}"
      :is-following="isFollowing"
      :follow-loading="followLoading"
      @follow="followVendor"
      @share="shareVendor"
    />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Tabs -->
      <div class="flex items-center gap-4 mb-16 p-2 bg-white rounded-[2rem] w-fit border border-neutral-100 shadow-sm font-black text-[10px] italic uppercase tracking-widest">
        <button
          v-for="tab in [{ id: 'products', label: 'ÜRÜNLER' }, { id: 'reviews', label: `DEĞERLENDİRMELER (${vendor?._count?.receivedReviews || 0})` }]"
          :key="tab.id"
          class="px-10 py-4 rounded-[1.5rem] transition-all"
          :class="activeMainTab === tab.id ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]' : 'text-gray-400 hover:text-gray-900'"
          @click="activeMainTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Advanced Search / Filters -->
      <div v-show="activeMainTab === 'products'" class="mb-16 animate-in">
        <AdvancedSearch
          :is-vendor-store="true"
          :categories="vendor?.categories?.map(vc => vc.category)"
          :brands="vendor?.brands"
          @filter="handleFilter"
        />
      </div>

      <div class="space-y-20">
        <!-- Flash Sales -->
        <VendorProfileFlashSales
          :vendor="vendor || {}"
          @add-to-cart="addToCart"
        />

        <!-- Product Grid -->
        <VendorProfileProductGrid
          v-show="activeMainTab === 'products'"
          :products="products"
          :loading="productsLoading"
          :has-more="hasMore"
          :total="totalProducts"
          @add-to-cart="addToCart"
          @load-more="loadMore"
        />

        <!-- Reviews Section -->
        <div v-show="activeMainTab === 'reviews'" class="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in italic">
          <div class="lg:col-span-1">
            <UserReviewStats :user-id="vendor?.userId as string" />
          </div>
          <div class="lg:col-span-2">
            <UserReviewList :user-id="vendor?.userId as string" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VendorProfileAdSide from '~/components/vendor/profile/VendorProfileAdSide.vue'
import VendorProfileHeader from '~/components/vendor/profile/VendorProfileHeader.vue'
import VendorProfileFlashSales from '~/components/vendor/profile/VendorProfileFlashSales.vue'
import VendorProfileProductGrid from '~/components/vendor/profile/VendorProfileProductGrid.vue'
import UserReviewStats from '~/components/trade/UserReviewStats.vue'
import UserReviewList from '~/components/trade/UserReviewList.vue'
import AdvancedSearch from '~/components/product/AdvancedSearch.vue'

const route = useRoute()
const cartStore = useCartStore()
const toast = useNuxtApp().$toast

const {
  vendor, isFollowing, followLoading, activeMainTab,
  products, productsLoading, totalProducts, hasMore,
  fetchVendor, fetchProducts, followVendor, checkFollowStatus,
  loadMore, handleFilter
} = useVendorProfile()

const addToCart = async (product: any) => {
  const res = await cartStore.addToCart(product.id.toString(), 1, undefined, undefined, product.id.toString())
  if (res.success) {
    toast.success(`${product.name} sepete eklendi!`)
  }
}

const shareVendor = () => {
  if (navigator.share) {
    navigator.share({
      title: vendor.value?.businessName || 'Satıcı',
      url: window.location.href
    }).catch(console.error)
  } else {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Bağlantı kopyalandı!')
  }
}

onMounted(() => {
  fetchVendor()
  fetchProducts()
  checkFollowStatus()
})

useHead({
  title: computed(() => vendor.value ? `${vendor.value.businessName} Mağazası` : 'Yükleniyor...'),
  meta: [
    { name: 'description', content: computed(() => vendor.value?.description || 'Satıcı Profil Sayfası') }
  ]
})
</script>

<style scoped>
.animate-in { animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.98) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
