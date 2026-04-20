<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          👥 Birlikte Al (Grup Alımı)
        </h2>
        <p class="text-gray-500 text-sm mt-1">
          Belirli bir sürede toplu alım sayısına göre fiyatın düştüğü kampanyalar
          oluşturun.
        </p>
      </div>
      <button
        class="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center"
        @click="openModal()"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Yeni Kampanya
      </button>
    </div>

    <!-- Active Campaign Card (if any) -->
    <div
      v-if="campaigns.length > 0"
      class="grid grid-cols-1 gap-6"
    >
      <div
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
      >
        <div class="p-6">
          <div class="flex flex-col md:flex-row gap-6">
            <img
              :src="campaign.Product?.image"
              :alt="campaign.Product?.name"
              class="w-32 h-32 rounded-2xl object-cover bg-gray-50 shadow-sm"
            >

            <div class="flex-1 space-y-3">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">
                    {{ campaign.title || campaign.Product?.name }}
                  </h3>
                  <div class="flex items-center mt-1 space-x-2">
                    <span
                      :class="campaign.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      class="px-2 py-0.5 rounded-md text-xs font-bold"
                    >
                      {{ campaign.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                    <span class="text-gray-400 text-xs">•</span>
                    <span class="text-gray-500 text-xs flex items-center">
                      <ClockIcon class="h-3 w-3 mr-1" />
                      {{ formatDate(campaign.startDate) }} - {{ formatDate(campaign.endDate) }}
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    @click="openModal(campaign)"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    @click="deleteCampaign(campaign.id)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                <div class="bg-gray-50 p-3 rounded-2xl">
                  <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Mevcut Satış
                  </p>
                  <p class="text-lg font-black text-primary-600">
                    {{ campaign.currentQuantity }} Adet
                  </p>
                </div>
                <div class="bg-gray-50 p-3 rounded-2xl border-l-4 border-primary-500">
                  <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">
                    Baz Fiyat
                  </p>
                  <p class="text-lg font-black text-gray-900">
                    ₺{{ formatPrice(campaign.Product?.price) }}
                  </p>
                </div>
                <div class="bg-gray-50 p-3 rounded-2xl lg:col-span-2 overflow-hidden">
                  <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                    İndirim Kademeleri
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tier in campaign.tiers"
                      :key="tier.minQuantity"
                      class="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg shadow-sm"
                    >
                      <b class="text-primary-600">{{ tier.minQuantity }}+:</b> ₺{{ formatPrice(tier.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center"
    >
      <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <UserGroupIcon class="h-10 w-10 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900">
        Henüz kampanya yok
      </h3>
      <p class="text-gray-500 mt-2">
        İlk "Birlikte Al" kampanyasını oluşturarak satışları artırın.
      </p>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingCampaign ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Oluştur' }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600"
            @click="showModal = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <!-- Ürün Seçimi -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Ürün Seçin</label>
            <div
              v-if="!form.productId"
              class="relative"
            >
              <input
                v-model="productSearch"
                type="text"
                placeholder="Ürün adı veya SKU ile ara..."
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                @input="searchProducts"
              >
              <div
                v-if="searchResults.length > 0"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto"
              >
                <div
                  v-for="p in searchResults"
                  :key="p.id"
                  class="p-3 hover:bg-primary-50 cursor-pointer flex items-center space-x-3 transition-colors border-b last:border-0 border-gray-50"
                  @click="selectProduct(p)"
                >
                  <img
                    :src="p.image"
                    class="w-10 h-10 rounded-lg object-cover"
                  >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-gray-900 truncate">
                      {{ p.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      ₺{{ formatPrice(p.price) }} • {{ p.sku }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100"
            >
              <div class="flex items-center space-x-4">
                <img
                  :src="selectedProductData?.image"
                  class="w-12 h-12 rounded-xl object-cover shadow-sm"
                >
                <div>
                  <p class="font-bold text-primary-900">
                    {{ selectedProductData?.name }}
                  </p>
                  <p class="text-xs text-primary-600">
                    Mevcut Fiyat: ₺{{ formatPrice(selectedProductData?.price) }}
                  </p>
                </div>
              </div>
              <button
                class="text-primary-600 hover:text-primary-800 font-bold text-sm"
                @click="form.productId = ''; selectedProductData = null"
              >
                Değiştir
              </button>
            </div>
          </div>

          <!-- Baslık ve Açıklama -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Kampanya Başlığı</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Durum</label>
              <select
                v-model="form.isActive"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
                <option :value="true">
                  Aktif
                </option>
                <option :value="false">
                  Pasif
                </option>
              </select>
            </div>
          </div>

          <!-- Tarihler -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Başlangıç Tarihi</label>
              <input
                v-model="form.startDate"
                type="datetime-local"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Bitiş Tarihi</label>
              <input
                v-model="form.endDate"
                type="datetime-local"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
            </div>
          </div>

          <!-- Tiers -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-bold text-gray-700">İndirim Kademeleri</label>
              <button
                class="text-primary-600 text-xs font-bold hover:underline"
                @click="addTier"
              >
                + Kademe Ekle
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="(tier, index) in form.tiers"
                :key="index"
                class="flex items-center space-x-3 animate-in slide-in-from-right-4 duration-200"
              >
                <div class="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <span class="text-gray-400 text-sm font-bold mr-2">Adet:</span>
                  <input
                    v-model.number="tier.minQuantity"
                    type="number"
                    class="w-full bg-transparent outline-none font-bold"
                  >
                </div>
                <div class="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <span class="text-gray-400 text-sm font-bold mr-2">Fiyat (₺):</span>
                  <input
                    v-model.number="tier.price"
                    type="number"
                    step="0.01"
                    class="w-full bg-transparent outline-none font-bold text-primary-600"
                  >
                </div>
                <button
                  class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  @click="removeTier(index)"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-50 flex space-x-3">
          <button
            :disabled="saving"
            class="flex-1 bg-primary-600 text-white py-3 rounded-2xl font-bold hover:bg-primary-700 shadow-xl shadow-primary-100 transition-all disabled:opacity-50"
            @click="saveCampaign"
          >
            {{ saving ? 'Kaydediliyor...' : 'Kampanyayı Kaydet' }}
          </button>
          <button
            class="px-8 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            @click="showModal = false"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ClockIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const campaigns = ref([])
const showModal = ref(false)
const saving = ref(false)
const editingCampaign = ref(null)

const productSearch = ref('')
const searchResults = ref([])
const selectedProductData = ref(null)

const form = ref({
  productId: '',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  tiers: [{ minQuantity: 5, price: 0 }, { minQuantity: 10, price: 0 }],
  isActive: true
})

// Fetch campaigns
const fetchCampaigns = async () => {
  try {
    const res = await $api('/api/v1/admin/group-buy')
    if (res.success) {
      campaigns.value = res.data
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
  }
}

// Search products
const searchProducts = async () => {
  if (productSearch.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const res = await $api(`/api/v1/admin/products`, {
      query: { search: productSearch.value, limit: 5 }
    })
    if (res.success) {
      searchResults.value = res.data
    }
  } catch (error) {
    console.error('Error searching products:', error)
  }
}

const selectProduct = (p) => {
  form.value.productId = p.id
  selectedProductData.value = p
  searchResults.value = []
  productSearch.value = ''

  // Update tier prices with some default discount if empty
  if (form.value.tiers[0].price === 0) {
    form.value.tiers[0].price = p.price * 0.95
    form.value.tiers[1].price = p.price * 0.90
  }
}

const addTier = () => {
  form.value.tiers.push({ minQuantity: 0, price: 0 })
}

const removeTier = (index) => {
  form.value.tiers.splice(index, 1)
}

const openModal = (campaign = null) => {
  if (campaign) {
    editingCampaign.value = campaign
    form.value = {
      ...campaign,
      startDate: new Date(campaign.startDate).toISOString().slice(0, 16),
      endDate: new Date(campaign.endDate).toISOString().slice(0, 16),
    }
    selectedProductData.value = campaign.Product
  } else {
    editingCampaign.value = null
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 7)

    form.value = {
      productId: '',
      title: '',
      description: '',
      startDate: now.toISOString().slice(0, 16),
      endDate: tomorrow.toISOString().slice(0, 16),
      tiers: [{ minQuantity: 5, price: 0 }, { minQuantity: 10, price: 0 }],
      isActive: true
    }
    selectedProductData.value = null
  }
  showModal.value = true
}

const saveCampaign = async () => {
  if (!form.value.productId) {
    useNuxtApp().$toast.error('Lütfen bir ürün seçin')
    return
  }

  saving.value = true
  try {
    const url = editingCampaign.value
      ? `/api/v1/admin/group-buy/${editingCampaign.value.id}`
      : '/api/v1/admin/group-buy'

    const method = editingCampaign.value ? 'PUT' : 'POST'

    const res = await $api(url, {
      method,
      body: form.value
    })

    if (res.success) {
      useNuxtApp().$toast.success('Kampanya başarıyla kaydedildi')
      showModal.value = false
      fetchCampaigns()
    }
  } catch (error) {
    console.error('Error saving campaign:', error)
    useNuxtApp().$toast.error('Kampanya kaydedilirken hata oluştu')
  } finally {
    saving.value = false
  }
}

const deleteCampaign = async (id) => {
  if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return
  try {
    const res = await $api(`/api/v1/admin/group-buy/${id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      useNuxtApp().$toast.success('Kampanya silindi')
      fetchCampaigns()
    }
  } catch (error) {
    console.error('Error deleting campaign:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(fetchCampaigns)
</script>

<style scoped>
.animate-in {
  animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
