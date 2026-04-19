<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">
        Kampanya Performansı & ROI
      </h2>
      <button
        class="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
        @click="openModal"
      >
        + Yeni Kampanya
      </button>
    </div>

    <!-- Campaigns Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Kampanya
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Bütçe / Harcanan
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Gelir (ROI)
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Siparişler
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Durum
            </th>
            <th
              scope="col"
              class="relative px-6 py-3"
            >
              <span class="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="campaign in campaigns"
            :key="campaign.id"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ campaign.name }}
              </div>
              <div class="text-xs text-gray-500">
                UTM: {{ campaign.utmCampaign || '-' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {{ formatCurrency(campaign.budget) }}
              </div>
              <div class="text-xs text-red-500">
                Harcanan: {{ formatCurrency(campaign.spent) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-green-600 font-bold">
                {{ formatCurrency(campaign.revenue) }}
              </div>
              <div
                class="text-xs"
                :class="campaign.roi >= 0 ? 'text-green-500' : 'text-red-500'"
              >
                ROI: {{ campaign.roi }}%
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ campaign.ordersCount }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="statusClass(campaign.status)"
              >
                {{ campaign.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                class="text-indigo-600 hover:text-indigo-900 mr-2"
                @click="editCampaign(campaign)"
              >
                Düzenle
              </button>
              <button
                class="text-red-600 hover:text-red-900"
                @click="removeCampaign(campaign.id)"
              >
                Sil
              </button>
            </td>
          </tr>
          <tr v-if="campaigns.length === 0">
            <td
              colspan="6"
              class="px-6 py-8 text-center text-gray-500 text-sm"
            >
              Henüz kampanya oluşturulmamış.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="showModal = false"
        />
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >&#8203;</span>
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3
              id="modal-title"
              class="text-lg leading-6 font-medium text-gray-900"
            >
              {{ isEditing ? 'Kampanyayı Düzenle' : 'Yeni Kampanya' }}
            </h3>
            <div class="mt-4 grid grid-cols-1 gap-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Kampanya Adı</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Başlangıç</label>
                  <input
                    v-model="form.startDate"
                    type="date"
                    class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Bitiş</label>
                  <input
                    v-model="form.endDate"
                    type="date"
                    class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Bütçe (TL)</label>
                <input
                  v-model="form.budget"
                  type="number"
                  class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-xs font-medium text-gray-700">UTM Source</label>
                  <input
                    v-model="form.utmSource"
                    placeholder="google"
                    class="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700">UTM Medium</label>
                  <input
                    v-model="form.utmMedium"
                    placeholder="cpc"
                    class="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700">UTM Campaign</label>
                  <input
                    v-model="form.utmCampaign"
                    placeholder="sevgililer_gunu"
                    class="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              @click="save"
            >
              Kaydet
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="showModal = false"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getCampaignPerformance, createCampaign, updateCampaign, deleteCampaign } = useAnalytics()
const { $toast } = useNuxtApp()

const campaigns = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const form = ref({
    id: null,
    name: '',
    budget: 0,
    startDate: '',
    endDate: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: ''
})

const fetchCampaigns = async () => {
    try {
        const res = await getCampaignPerformance()
        if (res.success) campaigns.value = res.data
    } catch (e) { console.error(e) }
}

const openModal = () => {
    isEditing.value = false
    form.value = {
        id: null,
        name: '',
        budget: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: ''
    }
    showModal.value = true
}

const editCampaign = (campaign) => {
    isEditing.value = true
    form.value = { ...campaign }
    // Fix dates for input type="date"
    // Assuming API might not return them in this specific view, but if it did...
    showModal.value = true
}

const save = async () => {
    try {
        if (isEditing.value) {
            await updateCampaign(form.value.id, form.value)
            $toast.success('Kampanya güncellendi')
        } else {
            await createCampaign(form.value)
            $toast.success('Kampanya oluşturuldu')
        }
        showModal.value = false
        fetchCampaigns()
    } catch (e) {
        $toast.error('Hata oluştu')
    }
}

const removeCampaign = async (id) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return
    try {
        await deleteCampaign(id)
        $toast.success('Kampanya silindi')
        fetchCampaigns()
    } catch (e) {
        $toast.error('Hata oluştu')
    }
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
}

const statusClass = (status) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-800'
    if (status === 'PAUSED') return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
}

onMounted(() => {
    fetchCampaigns()
})
</script>
