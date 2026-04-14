<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
          🏪 Mağazalarımız
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
          Güvenilir satıcılarımızdan en kaliteli ürünleri keşfedin. Her mağaza kendi benzersiz ürün
          koleksiyonuyla sizi bekliyor.
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="animate-pulse bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6" />
          <div class="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
          <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>

      <!-- Vendors Grid -->
      <div
        v-else-if="vendors.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <div
          v-for="vendor in vendors"
          :key="vendor.id"
          class="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 relative overflow-hidden"
          @click="navigateTo(`/vendors/${vendor.id}`)"
        >
          <!-- Featured Badge -->
          <div
            v-if="vendor.isFeatured"
            class="absolute top-4 right-4 bg-primary-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-10 animate-pulse"
          >
            ÖNE ÇIKAN
          </div>

          <!-- Decorative background -->
          <div
            class="absolute -top-12 -right-12 w-32 h-32 bg-primary-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"
          />

          <!-- Logo -->
          <div class="relative mb-6">
            <div
              class="w-28 h-28 rounded-[2rem] bg-white p-1 shadow-xl border-4 border-gray-50 overflow-hidden group-hover:border-primary-100 transition-colors"
            >
              <NuxtImg
                :src="vendor.logoUrl || 'https://placehold.co/200x200?text=' + vendor.businessName"
                class="w-full h-full object-contain rounded-2xl group-hover:scale-110 transition-transform duration-500"
                placeholder
              />
            </div>
            <div
              class="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-lg"
            />
          </div>

          <!-- Info -->
          <div class="relative z-10 w-full">
            <h3
              class="text-xl font-black text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors"
            >
              {{ vendor.businessName }}
            </h3>

            <p class="text-sm text-gray-500 line-clamp-2 mb-6 h-10 leading-tight">
              {{ vendor.description || 'Kaliteli ürünler ve hızlı teslimat ile hizmetinizdeyiz.' }}
            </p>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <div
                class="bg-gray-50 rounded-2xl p-3 border border-gray-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors"
              >
                <span
                  class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1"
                >Ürünler</span>
                <span
                  class="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors"
                >{{
                  vendor._count?.products || 0 }}</span>
              </div>
              <div
                class="bg-gray-50 rounded-2xl p-3 border border-gray-100 group-hover:bg-yellow-50 group-hover:border-yellow-100 transition-colors"
              >
                <span
                  class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1"
                >Puan</span>
                <span
                  class="text-lg font-black text-gray-900 group-hover:text-yellow-600 transition-colors"
                >{{
                  vendor.averageRating?.toFixed(1) || '0.0' }}</span>
              </div>
            </div>

            <!-- Action -->
            <button
              class="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs group-hover:bg-primary-600 group-hover:shadow-xl group-hover:shadow-primary-200 transition-all flex items-center justify-center gap-2"
            >
              Mağazayı Gör
              <ArrowRightIcon class="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm"
      >
        <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
          🏪
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-2">
          Henüz Mağaza Bulunmuyor
        </h3>
        <p class="text-gray-500 mb-8 max-w-md mx-auto">
          Sistemimizde henüz aktif bir mağaza bulunmamaktadır. Çok
          yakında yeni mağazalarla hizmetinizdeyiz.
        </p>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary-200 transition-all"
        >
          Anasayfaya Dön
        </NuxtLink>
      </div>

      <!-- Pagination (Simple) -->
      <div
        v-if="totalPages > 1"
        class="mt-16 flex justify-center gap-4"
      >
        <button
          :disabled="currentPage === 1"
          class="p-4 bg-white border border-gray-200 rounded-2xl disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
          @click="changePage(currentPage - 1)"
        >
          <ChevronLeftIcon class="h-6 w-6" />
        </button>
        <span
          class="flex items-center px-6 font-black text-gray-900 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          class="p-4 bg-white border border-gray-200 rounded-2xl disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
          @click="changePage(currentPage + 1)"
        >
          <ChevronRightIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useVendorService } from '~/services/api/VendorService'
import {
    ArrowRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/vue/24/solid'

const vendorService = useVendorService()
const vendors = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 12

const fetchVendors = async () => {
    loading.value = true
    try {
        // Calling the internal /api/vendors which should return approved vendors
        // Based on backend/src/routes/vendors.js, this route exists
        const response = await vendorService.getVendors({
                page: currentPage.value,
                limit,
                status: 'APPROVED'
            })

        if (response.success) {
            vendors.value = response.data
            totalPages.value = Math.ceil(response.pagination.total / limit)
        }
    } catch (error) {
        console.error('Fetch vendors error:', error)
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    fetchVendors()
    if (process.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
    fetchVendors()
})

useHead({
    title: 'Mağazalarımız - E-Commerce Platform',
    meta: [
        { name: 'description', content: 'Güvenilir satıcılarımızdan en kaliteli ürünleri keşfedin.' }
    ]
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
}
</style>
