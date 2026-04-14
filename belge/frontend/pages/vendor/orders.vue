<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          📦 Müşteri Siparişleri
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Sizin ürünlerinizi içeren siparişleri takip edin
        </p>
      </div>
      <button
        class="btn-outline flex items-center px-4 py-2"
        @click="fetchOrders"
      >
        <ArrowPathIcon
          class="h-4 w-4 mr-2"
          :class="{ 'animate-spin': loading }"
        />
        Yenile
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          Bekleyen Siparişler
        </p>
        <p class="text-2xl font-bold text-orange-600">
          {{ pendingCount }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          Kargolananlar
        </p>
        <p class="text-2xl font-bold text-primary-600">
          {{ shippedCount }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          Toplam Kazanç
        </p>
        <p class="text-2xl font-bold text-green-600">
          {{ formatPrice(totalRevenue) }}
        </p>
      </div>
    </div>

    <!-- Orders Filter -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex items-center space-x-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          v-model="searchQuery"
          placeholder="Sipariş no ile ara..."
          class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
      </div>
      <select
        v-model="filterStatus"
        class="p-2 border border-gray-100 rounded-lg text-sm bg-gray-50 outline-none"
      >
        <option value="">
          Tüm Durumlar
        </option>
        <option value="PENDING">
          Beklemede
        </option>
        <option value="PROCESSING">
          Hazırlanıyor
        </option>
        <option value="SHIPPED">
          Kargoda
        </option>
        <option value="DELIVERED">
          Teslim Edildi
        </option>
      </select>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Sipariş No
            </th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Ürünler
            </th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Tarih
            </th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Toplam
            </th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Müşteri
            </th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
              İşlem
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading && orders.length === 0">
            <td
              colspan="6"
              class="px-6 py-12 text-center"
            >
              <div class="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
            </td>
          </tr>
          <tr v-else-if="filteredOrders.length === 0">
            <td
              colspan="6"
              class="px-6 py-12 text-center text-gray-500 italic"
            >
              Sipariş bulunamadı
            </td>
          </tr>
          <tr
            v-for="order in filteredOrders"
            :key="order.id"
            class="hover:bg-gray-50/50 transition-colors"
          >
            <td class="px-6 py-4 text-sm">
              <span class="font-bold text-gray-900 border-b border-dotted border-gray-300">#{{ order.orderNumber
              }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1">
                <div
                  v-for="item in order.OrderItem"
                  :key="item.id"
                  class="flex items-center space-x-2"
                >
                  <div class="h-6 w-6 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img
                      v-if="item.Listing?.CatalogProduct?.images?.[0]"
                      :src="resolveImageUrl(item.Listing.CatalogProduct.images[0])"
                      class="h-full w-full object-cover rounded"
                    >
                  </div>
                  <span class="text-xs text-gray-700 truncate max-w-[200px]">{{ item.Listing?.CatalogProduct?.name ||
                    'Ürün' }}</span>
                  <span class="text-[10px] font-bold text-gray-400">x{{ item.quantity }}</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ formatDate(order.createdAt) }}
            </td>
            <td class="px-6 py-4 text-sm font-bold text-gray-900">
              {{ formatPrice(orderTotalForVendor(order)) }}
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">
                {{ order.User?.name }}
              </div>
              <div class="text-xs text-gray-500">
                {{ order.User?.email }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span :class="getStatusBadgeClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
                <span
                  v-if="order.OrderItem.some(i => i.trackingNumber)"
                  class="text-[10px] text-green-600 mt-1 font-bold"
                >
                  ✓ Kargo Bilgisi Girildi
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                class="inline-flex items-center text-primary-600 hover:text-primary-700 text-xs font-bold"
                @click="selectedOrder = order"
              >
                Kargo Yönet
                <ChevronRightIcon class="h-4 w-4 ml-1" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Shipping Modal -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        <div
          class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700"
        >
          <div class="text-white">
            <h2 class="font-bold text-xl">
              📦 Sipariş İşlemleri
            </h2>
            <p class="text-sm opacity-90">
              Sipariş No: #{{ selectedOrder.orderNumber }}
            </p>
          </div>
          <button
            class="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
            @click="selectedOrder = null"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <!-- Customer & Shipping Address Card -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
            <h3 class="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span class="text-lg">👤</span> Müşteri & Teslimat Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">
                  Müşteri
                </p>
                <p class="font-bold text-gray-900">
                  {{ selectedOrder.User?.name || 'İsimsiz' }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ selectedOrder.User?.email }}
                </p>
                <p
                  v-if="selectedOrder.User?.phone"
                  class="text-sm text-gray-600"
                >
                  📱 {{ selectedOrder.User?.phone }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">
                  Teslimat Adresi
                </p>
                <div
                  v-if="selectedOrder.Address"
                  class="text-sm"
                >
                  <p class="font-bold text-gray-900">
                    {{ selectedOrder.Address.fullName }}
                  </p>
                  <p class="text-gray-600">
                    {{ selectedOrder.Address.addressLine }}
                  </p>
                  <p class="text-gray-600">
                    {{ selectedOrder.Address.district }}, {{ selectedOrder.Address.city }} {{
                      selectedOrder.Address.postalCode }}
                  </p>
                  <p
                    v-if="selectedOrder.Address.phone"
                    class="text-gray-600 mt-1"
                  >
                    📞 {{ selectedOrder.Address.phone }}
                  </p>
                </div>
                <div
                  v-else-if="selectedOrder.shippingAddress"
                  class="text-sm text-gray-600"
                >
                  {{ selectedOrder.shippingAddress }}
                </div>
                <p
                  v-else
                  class="text-sm text-gray-400 italic"
                >
                  Adres bilgisi bulunamadı
                </p>
              </div>
            </div>
            <!-- Print Label Button -->
            <div class="mt-4 pt-4 border-t border-blue-200">
              <button
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                @click="printShippingLabel(selectedOrder)"
              >
                <PrinterIcon class="h-4 w-4 mr-2" />
                Kargo Etiketi Yazdır
              </button>
            </div>
          </div>

          <!-- Logi-Shield: Kusur Kanıtı (Dispatch Proof) -->
          <div class="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-200 shadow-sm">
            <h3 class="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
              <ShieldCheckIcon class="h-5 w-5 text-orange-600" />
              Logi-Shield Kusur Kanıtı (Gözetim Kulesi)
            </h3>
            <p class="text-xs text-orange-700 mb-4">
              Müşterinin "Kusurlu/Yanlış Ürün" iade taleplerine karşı kendinizi korumak için, paketi kargolarken
              çektiğiniz kanıt (video/fotoğraf) bağlantılarını ekleyin.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-orange-600 uppercase mb-1 flex items-center">
                  <VideoCameraIcon class="h-3 w-3 mr-1" />
                  Paketleme Videosu (URL)
                </label>
                <input
                  v-model="selectedOrder.packingVideoUrl"
                  placeholder="https://..."
                  class="w-full text-sm p-2 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
              </div>
              <div>
                <label class="block text-[10px] font-bold text-orange-600 uppercase mb-1 flex items-center">
                  <PhotoIcon class="h-3 w-3 mr-1" />
                  Paketleme Fotoğrafı (URL)
                </label>
                <input
                  v-model="selectedOrder.packingPhotoUrl"
                  placeholder="https://..."
                  class="w-full text-sm p-2 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
              </div>
            </div>
            <div class="mt-3 flex justify-end">
              <button
                :disabled="isSavingProof"
                class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors disabled:opacity-50"
                @click="saveDispatchProof(selectedOrder)"
              >
                {{ isSavingProof ? 'Yükleniyor...' : '✓ Kanıtları Gönder' }}
              </button>
            </div>
          </div>

          <!-- Order Items -->
          <div
            v-for="item in selectedOrder.OrderItem"
            :key="item.id"
            class="p-5 rounded-2xl border border-gray-100 bg-gray-50/50"
          >
            <div class="flex items-start gap-4 mb-5">
              <img
                :src="resolveImageUrl(item.Listing?.CatalogProduct?.images?.[0])"
                class="w-20 h-20 rounded-xl object-cover shadow-sm bg-white"
              >
              <div class="flex-1">
                <h3 class="font-bold text-gray-900 leading-tight mb-2">
                  {{ item.Listing?.CatalogProduct?.name || 'Ürün'
                  }}
                </h3>
                <div class="flex items-center gap-3">
                  <span :class="getStatusBadgeClass(item.status || 'PENDING')">{{ getStatusText(item.status ||
                    'PENDING') }}</span>
                  <span class="text-xs font-bold text-gray-400">ADET: {{ item.quantity }}</span>
                  <span class="text-xs font-bold text-primary-600">{{ formatPrice(item.price) }}</span>
                </div>
              </div>
            </div>

            <!-- Status Timeline -->
            <div class="mb-5">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">
                Durum Değiştir
              </p>
              <div class="flex items-center gap-2">
                <button
                  v-for="status in statusOptions"
                  :key="status.value"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                    item.status === status.value
                      ? status.activeClass
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  ]"
                  @click="item.status = status.value"
                >
                  {{ status.icon }} {{ status.label }}
                </button>
              </div>
            </div>

            <!-- Quick Carrier Selection -->
            <div class="mb-4">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">
                Hızlı Kargo Seçimi
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="carrier in carrierOptions"
                  :key="carrier"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    item.shippingCarrier === carrier
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  ]"
                  @click="item.shippingCarrier = carrier"
                >
                  🚚 {{ carrier }}
                </button>
              </div>
            </div>

            <!-- Shipping Form -->
            <div class="bg-white p-4 rounded-xl border border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kargo Firması</label>
                  <input
                    v-model="item.shippingCarrier"
                    placeholder="Kargo firması adı"
                    class="w-full text-sm p-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Takip Numarası</label>
                  <input
                    v-model="item.trackingNumber"
                    placeholder="Kargo Takip No"
                    class="w-full text-sm p-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button
                  class="bg-primary-600 text-white rounded-lg px-6 py-2.5 text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                  :disabled="updatingItem === item.id"
                  @click="updateItemShipping(item)"
                >
                  {{ updatingItem === item.id ? 'Kaydediliyor...' : '✓ Kaydet ve Bildir' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
    ChevronRightIcon,
  XMarkIcon,
  PrinterIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const { resolveImageUrl } = useAppImage()
const {
  orders, loading, searchQuery, filterStatus, selectedOrder, updatingItem, isSavingProof,
  carrierOptions, statusOptions,
  filteredOrders, pendingCount, shippedCount, totalRevenue,
  fetchOrders, updateItemShipping, saveDispatchProof, orderTotalForVendor
} = useVendorOrders()

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const getStatusBadgeClass = (status) => {
  const base = 'px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider'
  const s = (status || '').toUpperCase()
  switch (s) {
    case 'PENDING': return `${base} bg-orange-100 text-orange-700`
    case 'PROCESSING': return `${base} bg-blue-100 text-blue-700`
    case 'SHIPPED': return `${base} bg-purple-100 text-purple-700`
    case 'DELIVERED': return `${base} bg-green-100 text-green-700`
    default: return `${base} bg-gray-100 text-gray-700`
  }
}

const getStatusText = (status) => {
  const map = {
    'PENDING': 'Beklemede',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoda',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal'
  }
  return map[(status || '').toUpperCase()] || status
}

onMounted(() => {
  fetchOrders()
})

// Print shipping label
const printShippingLabel = (order) => {
  const address = order.Address
  const labelContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kargo Etiketi - #${order.orderNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .label { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { font-size: 18px; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 5px; }
        .section-content { font-size: 14px; }
        .order-number { font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background: #f0f0f0; margin: 15px 0; }
        .products { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
        .product { font-size: 12px; margin-bottom: 5px; }
        @media print { body { padding: 0; } .label { border: none; } }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="header">
          <h1>📦 KARGO ETİKETİ</h1>
          <p style="font-size: 12px; color: #666;">TicariTakas</p>
        </div>
        <div class="order-number">#${order.orderNumber}</div>
        <div class="section">
          <div class="section-title">Alıcı</div>
          <div class="section-content">
            <strong>${address?.fullName || order.User?.name || 'İsimsiz'}</strong><br>
            ${address?.addressLine || ''}<br>
            ${address?.district || ''}, ${address?.city || ''} ${address?.postalCode || ''}<br>
            ${address?.phone || order.User?.phone || ''}
          </div>
        </div>
        <div class="products">
          <div class="section-title">Ürünler</div>
          ${order.OrderItem.map(item => `
            <div class="product">• ${item.Listing?.CatalogProduct?.name || 'Ürün'} x${item.quantity}</div>
          `).join('')}
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #999;">
          ${new Date().toLocaleDateString('tr-TR')}
        </div>
      </div>
      <script>window.print(); window.onafterprint = function() { window.close(); }<${'/'}script>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=500,height=600')
  printWindow.document.write(labelContent)
  printWindow.document.close()
}
</script>
