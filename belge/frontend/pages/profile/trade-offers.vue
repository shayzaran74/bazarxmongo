<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-black text-gray-900 mb-8 uppercase italic tracking-tight">
      TAKAS TEKLİFLERİM
    </h1>

    <!-- Tabs -->
    <div class="flex space-x-1 bg-gray-100 p-1 rounded-2xl w-fit mb-8">
      <button
        :class="activeTab === 'received' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'"
        class="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        @click="activeTab = 'received'"
      >
        GELEN TEKLİFLER
      </button>
      <button
        :class="activeTab === 'sent' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'"
        class="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        @click="activeTab = 'sent'"
      >
        GİDEN TEKLİFLER
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="text-center py-12"
    >
      <div class="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary-600 rounded-full mx-auto mb-4" />
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
        Yükleniyor...
      </p>
    </div>

    <!-- No Company -->
    <div
      v-else-if="!myCompany"
      class="bg-amber-50 rounded-2xl p-8 text-center"
    >
      <p class="text-gray-600 font-medium">
        Takas tekliflerinizi görebilmek için önce bir firma profiliniz
        olmalıdır.
      </p>
      <NuxtLink
        to="/my/surplus"
        class="inline-block mt-4 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition"
      >
        Takas Paneline Git
      </NuxtLink>
    </div>

    <!-- Offers List -->
    <div
      v-else-if="offers.length > 0"
      class="space-y-4"
    >
      <div
        v-for="offer in offers"
        :key="offer.id"
        class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <img
              :src="getMainImage(activeTab === 'received' ? offer.offeredItem : offer.requestedItem)"
              class="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100"
            >
            <div>
              <p class="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1">
                {{ activeTab === 'received' ? 'TEKLİF EDEN' : 'ALICI' }}
              </p>
              <h4 class="text-lg font-black text-gray-900">
                {{ activeTab === 'received' ? offer.fromCompany?.name : offer.toCompany?.name }}
              </h4>
              <p class="text-xs text-gray-500 font-medium">
                {{ activeTab === 'received' ? offer.offeredItem?.title : offer.requestedItem?.title }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <span
              class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border"
              :class="{
                'bg-yellow-50 text-yellow-700 border-yellow-100': offer.status === 'pending' || offer.status === 'waiting_approval',
                'bg-green-50 text-green-700 border-green-100': offer.status === 'accepted',
                'bg-red-50 text-red-700 border-red-100': offer.status === 'rejected' || offer.status === 'rejected_by_admin'
              }"
            >
              {{ getStatusLabel(offer.status) }}
            </span>
            <span class="text-xs text-gray-400">{{ new Date(offer.createdAt).toLocaleDateString('tr-TR')
            }}</span>
          </div>

          <div
            v-if="activeTab === 'received' && offer.status === 'pending'"
            class="flex gap-2"
          >
            <button
              class="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition"
              @click="acceptOffer(offer.id)"
            >
              KABUL ET
            </button>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
              @click="rejectOffer(offer.id)"
            >
              REDDET
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span class="text-gray-400 font-bold uppercase">Teklif Edilen</span>
            <p class="font-medium text-gray-900">
              {{ offer.offeredItem?.title }} ({{ offer.offeredQuantity }}
              adet)
            </p>
          </div>
          <div>
            <span class="text-gray-400 font-bold uppercase">İstenen</span>
            <p class="font-medium text-gray-900">
              {{ offer.requestedItem?.title }} ({{
                offer.requestedQuantity }} adet)
            </p>
          </div>
          <div>
            <span class="text-gray-400 font-bold uppercase">Nakit Fark</span>
            <p
              class="font-medium"
              :class="offer.cashDifference > 0 ? 'text-green-600' : offer.cashDifference < 0 ? 'text-red-600' : 'text-gray-600'"
            >
              {{ formatCurrency(offer.cashDifference) }}
            </p>
          </div>
          <div>
            <span class="text-gray-400 font-bold uppercase">Mesaj</span>
            <p class="font-medium text-gray-900 truncate">
              {{ offer.message || '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs"
    >
      HENÜZ BİR TEKLİF YOK
    </div>
  </div>
</template>

<script setup>
import { useCompanyService } from '~/services/api/CompanyService'
import { useOfferService } from '~/services/api/OfferService'

definePageMeta({
    layout: 'default'
})

const companyService = useCompanyService()
const offerService = useOfferService()
const authStore = useAuthStore()
const offers = ref([])
const myCompany = ref(null)
const activeTab = ref('received')
const loading = ref(true)

const fetchMyCompany = async () => {
    try {
        const response = await companyService.getMyCompany()
        if (response.success) {
            myCompany.value = response.company
            if (myCompany.value) fetchOffers()
        }
    } catch (error) {
        console.error('Fetch company error:', error)
    } finally {
        loading.value = false
    }
}

const fetchOffers = async () => {
    if (!myCompany.value) return
    loading.value = true
    try {
        const response = await offerService.getMyOffers()
        if (response.success) {
            offers.value = response.offers
        }
    } catch (error) {
        console.error('Fetch offers error:', error)
    } finally {
        loading.value = false
    }
}

const acceptOffer = async (id) => {
    if (!confirm('Bu teklifi kabul etmek istediğinize emin misiniz?')) return
    try {
        const response = await offerService.accept(id)
        if (response.success) {
            useNuxtApp().$toast.success('Teklif kabul edildi.')
            fetchOffers()
        }
    } catch (error) {
        console.error('Accept error:', error)
        useNuxtApp().$toast.error('İşlem başarısız.')
    }
}

const rejectOffer = async (id) => {
    if (!confirm('Bu teklifi reddetmek istediğinize emin misiniz?')) return
    try {
        const response = await offerService.updateStatus(id, status)
        if (response.success) {
            useNuxtApp().$toast.success('Teklif reddedildi.')
            fetchOffers()
        }
    } catch (error) {
        console.error('Reject error:', error)
        useNuxtApp().$toast.error('İşlem başarısız.')
    }
}

watch(activeTab, () => {
    fetchOffers()
})

const getMainImage = (item) => {
    if (item?.images && item.images.length > 0) {
        const img = item.images[0]
        return typeof img === 'string' ? img : img.url
    }
    return '/placeholder-surplus.jpg'
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
}

const getStatusLabel = (status) => {
    const labels = {
        'waiting_approval': 'Yönetici Onayı Bekliyor',
        'pending': 'Beklemede',
        'accepted': 'Kabul Edildi',
        'rejected': 'Reddedildi',
        'rejected_by_admin': 'Admin Tarafından Reddedildi'
    }
    return labels[status] || status
}

onMounted(async () => {
    await authStore.init()
    if (authStore.isAuthenticated) {
        fetchMyCompany()
    } else {
        loading.value = false
        useRouter().push('/login')
    }
})
</script>
