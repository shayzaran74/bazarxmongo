<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Tüm Takas Teklifleri
    </h2>

    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <select
        v-model="statusFilter"
        class="px-4 py-2 border border-gray-200 rounded-lg text-sm"
      >
        <option value="">
          Tüm Durumlar
        </option>
        <option value="WAITING_APPROVAL">
          Yönetici Onayı Bekliyor
        </option>
        <option value="PENDING">
          Beklemede
        </option>
        <option value="ACCEPTED">
          Kabul Edildi
        </option>
        <option value="REJECTED">
          Reddedildi
        </option>
        <option value="CANCELLED">
          İptal Edildi
        </option>
      </select>
      <button
        class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition"
        @click="fetchAllOffers"
      >
        Filtrele
      </button>
    </div>

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
        Teklif bulunmuyor.
      </div>
      <table
        v-else
        class="min-w-full divide-y divide-gray-200"
      >
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tarih
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teklif Veren
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alıcı
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teklif Edilen Ürün
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İstenen Ürün
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nakit
              Fark
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlem
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="offer in offers"
            :key="offer.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(offer.createdAt).toLocaleDateString('tr-TR') }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ offer.fromCompany?.name || '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              {{ offer.toCompany?.name || '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              {{ offer.offeredItem?.title || offer.offeredItems?.[0]?.listing?.title || '-' }}
              <span class="text-xs text-gray-400 block">{{ offer.offeredQuantity || offer.offeredItems?.[0]?.quantity || 0 }} Birim</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              {{ offer.requestedItem?.title || offer.requestedItems?.[0]?.listing?.title || '-' }}
              <span class="text-xs text-gray-400 block">{{ offer.requestedQuantity || offer.requestedItems?.[0]?.quantity || 0 }} Birim</span>
            </td>
            <td
              class="px-4 py-3 whitespace-nowrap text-sm font-medium"
              :class="offer.cashDifference > 0 ? 'text-green-600' : offer.cashDifference < 0 ? 'text-red-600' : 'text-gray-500'"
            >
              {{ formatCurrency(offer.cashDifference) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                class="px-2 py-1 rounded-full text-xs font-bold"
                :class="{
                  'bg-cyan-100 text-cyan-800': offer.status.toUpperCase() === 'WAITING_APPROVAL',
                  'bg-yellow-100 text-yellow-800': offer.status.toUpperCase() === 'PENDING',
                  'bg-green-100 text-green-800': offer.status.toUpperCase() === 'ACCEPTED',
                  'bg-red-100 text-red-800': offer.status.toUpperCase() === 'REJECTED' || offer.status.toUpperCase() === 'CANCELLED'
                }"
              >
                {{ getStatusLabel(offer.status) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
              <button
                class="text-blue-600 hover:text-blue-900 text-xs font-bold"
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
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
        >
          <div>
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-4">
              Teklif Detayları
            </h3>

            <!-- Timeline -->
            <div class="border-l-2 border-gray-200 pl-4 space-y-4 mb-6">
              <div class="relative">
                <div class="absolute -left-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                <p class="text-xs font-bold text-gray-500">
                  {{ new
                    Date(selectedOffer.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric', month:
                        'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) }}
                </p>
                <p class="text-sm font-medium text-gray-900">
                  Teklif Oluşturuldu
                </p>
                <p class="text-xs text-gray-500">
                  {{ selectedOffer.fromCompany?.name }} tarafından
                </p>
              </div>
              <div
                v-if="selectedOffer.status.toUpperCase() !== 'WAITING_APPROVAL'"
                class="relative"
              >
                <div class="absolute -left-6 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
                <p class="text-sm font-medium text-gray-900">
                  Admin Onaylandı
                </p>
              </div>
              <div
                v-if="['ACCEPTED', 'COMPLETED'].includes(selectedOffer.status.toUpperCase())"
                class="relative"
              >
                <div class="absolute -left-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                <p class="text-sm font-medium text-green-700">
                  Teklif Kabul Edildi
                </p>
                <p class="text-xs text-gray-500">
                  {{ selectedOffer.toCompany?.name }} tarafından
                </p>
              </div>
              <div
                v-if="['REJECTED', 'CANCELLED'].includes(selectedOffer.status.toUpperCase())"
                class="relative"
              >
                <div class="absolute -left-6 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                <p class="text-sm font-medium text-red-700">
                  Teklif Reddedildi
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="block text-xs font-bold text-gray-500 uppercase">Teklif Veren</span>
                <p class="mt-1 text-gray-900 font-medium">
                  {{ selectedOffer.fromCompany?.name }}
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="block text-xs font-bold text-gray-500 uppercase">Alıcı</span>
                <p class="mt-1 text-gray-900 font-medium">
                  {{ selectedOffer.toCompany?.name }}
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="block text-xs font-bold text-gray-500 uppercase">Teklif Edilen</span>
                <p class="mt-1 text-gray-900 font-medium">
                  {{ selectedOffer.offeredItem?.title }} ({{
                    selectedOffer.offeredQuantity }} adet)
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="block text-xs font-bold text-gray-500 uppercase">İstenen</span>
                <p class="mt-1 text-gray-900 font-medium">
                  {{ selectedOffer.requestedItem?.title }} ({{
                    selectedOffer.requestedQuantity }} adet)
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg col-span-2">
                <span class="block text-xs font-bold text-gray-500 uppercase">Mesaj</span>
                <p class="mt-1 text-gray-900">
                  {{ selectedOffer.message || 'Mesaj yok' }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6">
            <!-- Action buttons for waiting_approval offers -->
            <div
              v-if="selectedOffer.status.toUpperCase() === 'WAITING_APPROVAL'"
              class="flex gap-3"
            >
              <button
                type="button"
                class="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:text-sm"
                @click="approveOffer"
              >
                ✓ Onayla
              </button>
              <button
                type="button"
                class="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:text-sm"
                @click="rejectOffer"
              >
                ✗ Reddet
              </button>
              <button
                type="button"
                class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                @click="closeModal"
              >
                Kapat
              </button>
            </div>
            <!-- Close button for other statuses -->
            <button
              v-else
              type="button"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 sm:text-sm"
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
const statusFilter = ref('')

const fetchAllOffers = async () => {
    loading.value = true
    try {
        const params = {}
        if (statusFilter.value) params.status = statusFilter.value

        const response = await $api('/api/v1/admin/barter/offers', {
            params
        })
        if (response.success) {
            offers.value = response.data
        }
    } catch (error) {
        console.error('Fetch offers error:', error)
    } finally {
        loading.value = false
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

const approveOffer = async () => {
    if (!selectedOffer.value) return

    try {
        const response = await $api(`/api/v1/admin/offers/${selectedOffer.value.id}/approve`, {
            method: 'PATCH'
        })

        if (response.success) {
            const toast = useNuxtApp().$toast
            toast.success('Teklif onaylandı!')
            closeModal()
            fetchAllOffers()
        }
    } catch (error) {
        console.error('Approve offer error:', error)
        const toast = useNuxtApp().$toast
        toast.error('Teklif onaylanırken hata oluştu')
    }
}

const rejectOffer = async () => {
    if (!selectedOffer.value) return

    try {
        const response = await $api(`/api/v1/admin/offers/${selectedOffer.value.id}/reject`, {
            method: 'PATCH'
        })

        if (response.success) {
            const toast = useNuxtApp().$toast
            toast.success('Teklif reddedildi!')
            closeModal()
            fetchAllOffers()
        }
    } catch (error) {
        console.error('Reject offer error:', error)
        const toast = useNuxtApp().$toast
        toast.error('Teklif reddedilirken hata oluştu')
    }
}

const getStatusLabel = (status) => {
    if (!status) return '-'
    const s = status.toUpperCase()
    const labels = {
        'WAITING_APPROVAL': 'Yönetici Onayı Bekliyor',
        'PENDING': 'Beklemede',
        'ACCEPTED': 'Kabul Edildi',
        'REJECTED': 'Reddedildi',
        'CANCELLED': 'İptal Edildi',
        'COMPLETED': 'Tamamlandı',
        'DISPUTED': 'İhtilaf',
        'COUNTER_OFFERED': 'Karşı Teklif'
    }
    return labels[s] || s
}

onMounted(() => {
    fetchAllOffers()
})
</script>
