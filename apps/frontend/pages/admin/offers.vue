<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Bekleyen Takas Teklifleri
    </h2>

    <!-- Offers Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        v-if="loading"
        class="p-8 text-center text-gray-500"
      >
        Yükleniyor...
      </div>
      <div
        v-else-if="offers.length === 0"
        class="p-8 text-center text-gray-500"
      >
        Bekleyen teklif bulunmuyor.
      </div>
      <table
        v-else
        class="min-w-full divide-y divide-gray-200"
      >
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarih
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teklif Veren
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alıcı
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teklif Edilen
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İstenen
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="offer in offers"
            :key="offer.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(offer.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ offer.fromCompany.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ offer.toCompany.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div v-for="item in offer.offeredItems" :key="item.id">
                {{ item.listing?.title || item.surplusItem?.name || 'Ürün' }}
                <span class="text-xs text-gray-400 block">{{ item.quantity }} Birim</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div v-for="item in offer.requestedItems" :key="item.id">
                {{ item.listing?.title || item.surplusItem?.name || 'Ürün' }}
                <span class="text-xs text-gray-400 block">{{ item.quantity }} Birim</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button
                class="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md"
                @click="approveOffer(offer.id)"
              >
                Onayla
              </button>
              <button
                class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md"
                @click="rejectOffer(offer.id)"
              >
                Reddet
              </button>
              <button
                class="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md"
                @click="viewDetails(offer)"
              >
                Detay
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Details Modal -->
    <div
      v-if="showModal && selectedOffer"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="closeModal"
        />
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >&#8203;</span>
        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div>
            <h3
              id="modal-title"
              class="text-lg leading-6 font-medium text-gray-900"
            >
              Teklif Detayları
            </h3>
            <div class="mt-4 space-y-3 text-sm">
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="block text-xs font-bold text-gray-500 uppercase">Mesaj</span>
                <p class="mt-1 text-gray-900">
                  {{ selectedOffer.message || 'Mesaj yok' }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                  <span class="block text-xs font-bold text-gray-500 uppercase">Nakit Farkı</span>
                  <p class="mt-1 text-gray-900 font-bold">
                    {{ selectedOffer.cashDifference ? formatCurrency(selectedOffer.cashDifference) :
                      'Yok' }}
                  </p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <span class="block text-xs font-bold text-gray-500 uppercase">Durum</span>
                  <p class="mt-1 text-yellow-600 font-bold uppercase">
                    {{ selectedOffer.status }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6">
            <button
              type="button"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none sm:text-sm"
              @click="closeModal"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin', middleware: 'admin'
})

const { $api } = useApi()
const offers = ref([])
const loading = ref(true)
const showModal = ref(false)
const selectedOffer = ref(null)

const fetchOffers = async () => {
    loading.value = true
    try {
        const response = await $api('/api/v1/admin/barter/offers/pending')
        if (response.success) {
            offers.value = response.data
        }
    } catch (error) {
        console.error('Fetch offers error:', error)
    } finally {
        loading.value = false
    }
}

const approveOffer = async (id) => {
    if (!confirm('Bu teklifi onaylamak istediğinize emin misiniz?')) return

    try {
        const response = await $api(`/api/v1/admin/barter/offers/${id}/approve`, {
            method: 'PATCH'
        })

        if (response.success) {
            useNuxtApp().$toast.success('Teklif onaylandı ve taraflara iletildi.')
            fetchOffers()
        }
    } catch (error) {
        console.error('Approve error:', error)
        useNuxtApp().$toast.error('İşlem sırasında hata oluştu.')
    }
}

const rejectOffer = async (id) => {
    if (!confirm('Bu teklifi reddetmek istediğinize emin misiniz?')) return

    try {
        const response = await $api(`/api/v1/admin/barter/offers/${id}/reject`, {
            method: 'PATCH'
        })

        if (response.success) {
            useNuxtApp().$toast.success('Teklif reddedildi.')
            fetchOffers()
        }
    } catch (error) {
        console.error('Reject error:', error)
        useNuxtApp().$toast.error('İşlem sırasında hata oluştu.')
    }
}

const viewDetails = (offer) => {
    selectedOffer.value = offer
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedOffer.value = null
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
}

onMounted(() => {
    fetchOffers()
})
</script>
