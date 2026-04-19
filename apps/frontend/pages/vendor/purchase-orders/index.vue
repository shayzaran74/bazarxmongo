<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
          📦 Satın Alım Emirleri
        </h1>
        <p class="mt-2 text-gray-600">
          Tedarikçilerinizden gelen ürünleri yönetin ve stoklarınıza ekleyin.
        </p>
      </div>
      <NuxtLink
        to="/vendor/purchase-orders/create"
        class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Yeni Satın Alım
      </NuxtLink>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-20"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    </div>

    <div
      v-else-if="purchaseOrders.length === 0"
      class="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100"
    >
      <div class="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <DocumentTextIcon class="h-10 w-10 text-blue-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">
        Henüz satın alım emri yok
      </h3>
      <p class="text-gray-500 max-w-sm mx-auto mb-8">
        Tedarikçilerinizden ürün aldığınızda buradan takip edebilir ve
        stoklarınızı güncelleyebilirsiniz.
      </p>
      <NuxtLink
        to="/vendor/purchase-orders/create"
        class="text-blue-600 font-bold hover:underline"
      >
        İlk satın alım emrini oluştur →
      </NuxtLink>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-6"
    >
      <div
        v-for="po in purchaseOrders"
        :key="po.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <span class="text-lg font-black text-gray-900">{{ po.orderNumber }}</span>
                <span
                  :class="getStatusClass(po.status)"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  {{ formatStatus(po.status) }}
                </span>
              </div>
              <div class="text-sm text-gray-500">
                <span class="font-medium text-gray-700">{{ po.supplier }}</span> • {{ formatDate(po.createdAt) }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="po.status !== 'Received'"
                class="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                @click="openReceiveModal(po)"
              >
                Teslim Al
              </button>
              <button
                class="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                @click="toggleDetails(po.id)"
              >
                {{ expandedId === po.id ? 'Gizle' : 'Detaylar' }}
              </button>
            </div>
          </div>

          <!-- Product Preview -->
          <div class="flex -space-x-3 overflow-hidden mb-2">
            <img
              v-for="item in po.items.slice(0, 5)"
              :key="item.id"
              :src="item.product?.image || 'https://placehold.co/100x100'"
              class="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
              :title="item.product?.name"
            >
            <div
              v-if="po.items.length > 5"
              class="inline-flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 text-xs font-bold text-gray-500"
            >
              +{{ po.items.length - 5 }}
            </div>
          </div>

          <!-- Expanded Details -->
          <div
            v-if="expandedId === po.id"
            class="mt-6 border-t border-gray-50 pt-6 animate-fadeIn"
          >
            <h4 class="text-sm font-bold text-gray-900 mb-4 px-2 uppercase tracking-widest">
              Ürün Listesi
            </h4>
            <div class="space-y-3">
              <div
                v-for="item in po.items"
                :key="item.id"
                class="flex items-center p-3 bg-gray-50 rounded-xl"
              >
                <img
                  :src="item.product?.image"
                  class="h-12 w-12 rounded-lg object-cover"
                >
                <div class="ml-4 flex-1">
                  <div class="text-sm font-bold text-gray-900">
                    {{ item.product?.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Birim Maliyet: ₺{{ item.costPerItem }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-black text-gray-900">
                    {{ item.receivedQty }} / {{ item.quantity }}
                  </div>
                  <div class="text-xs text-gray-400">
                    Adet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Receive Modal -->
    <div
      v-if="showReceiveModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 class="text-xl font-black text-gray-900">
              Ürünleri Teslim Al
            </h3>
            <p class="text-sm text-gray-500">
              {{ selectedPO?.orderNumber }} - {{ selectedPO?.supplier }}
            </p>
          </div>
          <button
            class="text-gray-400 hover:text-gray-600 text-3xl"
            @click="closeReceiveModal"
          >
            &times;
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div
            v-for="item in receiveItems"
            :key="item.id"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200"
          >
            <img
              :src="item.image"
              class="h-16 w-16 rounded-xl object-cover shadow-sm"
            >
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-gray-900 truncate">
                {{ item.productName }}
              </div>
              <div class="text-xs text-gray-500">
                Kalan: {{ item.remaining }} / {{ item.total }}
              </div>
            </div>
            <div class="w-32">
              <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Gelen Miktar</label>
              <input
                v-model.number="item.incoming"
                type="number"
                min="0"
                :max="item.remaining"
                class="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
              >
            </div>
          </div>
        </div>

        <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            class="px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-white transition-colors"
            @click="closeReceiveModal"
          >
            İptal
          </button>
          <button
            :disabled="!hasIncoming"
            class="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-100 transition-all"
            @click="saveReceiving"
          >
            Stokları Güncelle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const purchaseOrders = ref([])
const loading = ref(false)
const expandedId = ref(null)

const showReceiveModal = ref(false)
const selectedPO = ref(null)
const receiveItems = ref([])

const fetchPOs = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const response = await $api('/api/vendors/purchase-orders')
    purchaseOrders.value = response.data
  } catch (error) {
    console.error('Fetch POs error:', error)
  } finally {
    loading.value = false
  }
}

const toggleDetails = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const openReceiveModal = (po) => {
  selectedPO.value = po
  receiveItems.value = po.items.map(item => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name,
    image: item.product?.image,
    total: item.quantity,
    remaining: item.quantity - item.receivedQty,
    incoming: item.quantity - item.receivedQty
  }))
  showReceiveModal.value = true
}

const closeReceiveModal = () => {
  showReceiveModal.value = false
  selectedPO.value = null
  receiveItems.value = []
}

const hasIncoming = computed(() => {
  return receiveItems.value.some(i => i.incoming > 0)
})

const saveReceiving = async () => {
  try {
    const { $api } = useApi()
    const items = receiveItems.value
      .filter(i => i.incoming > 0)
      .map(i => ({ itemId: i.id, receivedQty: i.incoming }))

    await $api(`/api/vendors/purchase-orders/${selectedPO.value.id}/receive`, {
      method: 'POST',
      body: { items }
    })

    useNuxtApp().$toast.success('Stoklar başarıyla güncellendi!')
    closeReceiveModal()
    fetchPOs()
  } catch (error) {
    useNuxtApp().$toast.error('Hata oluştu.')
  }
}

const formatStatus = (status) => {
  const map = {
    'Draft': 'Taslak',
    'Pending': 'Beklemede',
    'Ordered': 'Sipariş Edildi',
    'PartiallyReceived': 'Kısmen Alındı',
    'Received': 'Tamamlandı',
    'Cancelled': 'İptal'
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'PartiallyReceived': 'bg-blue-100 text-blue-700',
    'Received': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700'
  }
  return map[status] || 'bg-blue-100 text-blue-700'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(fetchPOs)
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
