<template>
  <div class="p-8">
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center h-64"
    >
      <div class="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mb-4" />
      <p class="text-gray-500">
        Sipariş detayları yükleniyor...
      </p>
    </div>

    <div
      v-else-if="!order"
      class="bg-white p-12 rounded-2xl text-center shadow-sm border border-gray-200"
    >
      <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-xl font-bold text-gray-900">
        Sipariş Bulunamadı
      </h2>
      <NuxtLink
        to="/admin/orders"
        class="mt-4 inline-block text-primary-600 font-medium"
      >
        Sipariş listesine dön
      </NuxtLink>
    </div>

    <div v-else>
      <!-- On Screen View -->
      <div class="print:hidden">
        <!-- Breadcrumb & Actions -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div class="flex items-center space-x-2 text-sm">
            <NuxtLink
              to="/admin/orders"
              class="text-gray-500 hover:text-primary-600 transition-colors"
            >
              Siparişler
            </NuxtLink>
            <ChevronRightIcon class="h-3 w-3 text-gray-400" />
            <span class="text-gray-900 font-bold">#{{ order.orderNumber }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              class="btn-outline flex items-center px-4 py-2 text-sm text-red-600 border-red-200 hover:bg-red-50"
              @click="rejectOrder"
            >
              <XMarkIcon class="h-4 w-4 mr-2" />
              Siparişi Reddet
            </button>
            <button
              class="bg-red-600 text-white flex items-center px-4 py-2 text-sm rounded-lg hover:bg-red-700"
              @click="handleDelete"
            >
              <TrashIcon class="h-4 w-4 mr-2" />
              Siparişi Sil
            </button>
            <button
              class="btn-outline flex items-center px-4 py-2 text-sm"
              @click="printOrder"
            >
              <PrinterIcon class="h-4 w-4 mr-2" />
              Yazdır
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Info -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Order Items -->
            <AdminOrderItemList 
              :items="order.OrderItem || []"
              :sub-total="subTotal"
              :shipping-cost="shippingCost"
              :total-amount="Number(order.totalAmount || 0)"
            />

            <!-- Shipping Process -->
            <AdminOrderShippingForm 
              v-model:shipping-update="shippingUpdate"
              :updating="updating"
              @update-status="updateStatus"
            />
          </div>

          <!-- Sidebar Info -->
          <div class="space-y-8">
            <!-- Customer Info -->
            <AdminOrderCustomerCard 
              :user="order.User"
              :parsed-address="parsedAddress"
              :raw-address="typeof order.shippingAddress === 'string' ? order.shippingAddress : ''"
            />

            <!-- Payment -->
            <AdminOrderPaymentCard 
              :payment-method="order.paymentMethod"
              :paid-at="order.paidAt"
              :payment-intent-id="order.paymentIntentId"
            />
          </div>
        </div>
      </div>

      <!-- Printable Invoice View (Hidden on Screen, Shown on Print) -->
      <div class="hidden print:block font-sans text-gray-800 p-4">
        <!-- Brand/Header -->
        <div class="flex justify-between items-start border-b pb-6 mb-8">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span>🏭</span> TicariTakas
            </h1>
            <p class="text-xs text-gray-500 mt-1">Endüstriyel Barter ve B2B Ticaret Platformu</p>
          </div>
          <div class="text-right">
            <h2 class="text-lg font-extrabold text-gray-900 tracking-tight">SİPARİŞ MAKBUZU</h2>
            <p class="text-sm font-bold text-primary-600 mt-1">#{{ order.orderNumber }}</p>
            <p class="text-xs text-gray-500 mt-1">Tarih: {{ formatDate(order.createdAt) }}</p>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-8 mb-8 text-xs">
          <!-- Customer Info -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="font-bold text-gray-950 mb-2 uppercase tracking-wider text-[10px]">Müşteri Bilgileri</h3>
            <p class="font-bold text-gray-800 text-sm">
              {{ order.User?.profile ? `${order.User.profile.firstName} ${order.User.profile.lastName || ''}` : ((order.User as any)?.name || 'Bilinmeyen Müşteri') }}
            </p>
            <p class="text-gray-600 mt-1">{{ order.User?.email }}</p>
            <p class="text-gray-600">{{ parsedAddress?.phone || 'Telefon Yok' }}</p>
          </div>

          <!-- Shipping Address -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="font-bold text-gray-950 mb-2 uppercase tracking-wider text-[10px]">Teslimat Adresi</h3>
            <p class="text-gray-700 leading-relaxed font-medium">
              <span v-if="parsedAddress">
                <strong class="block mb-0.5">{{ parsedAddress.fullName }}</strong>
                {{ parsedAddress.addressLine1 }} {{ parsedAddress.addressLine2 || '' }}<br>
                {{ parsedAddress.postalCode || '' }} {{ parsedAddress.city || '' }} {{ parsedAddress.district ? `/ ${parsedAddress.district}` : '' }}
              </span>
              <span v-else>
                {{ typeof order.shippingAddress === 'string' ? order.shippingAddress : 'Adres belirtilmemiş' }}
              </span>
            </p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="grid grid-cols-2 gap-8 mb-8 text-xs">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="font-bold text-gray-950 mb-2 uppercase tracking-wider text-[10px]">Ödeme Detayları</h3>
            <p class="text-gray-700 font-medium">Ödeme Yöntemi: <span class="font-bold">{{ order.paymentMethod || 'Cüzdan / Kredi Kartı' }}</span></p>
            <p class="text-gray-700 mt-1 font-medium">
              Ödeme Durumu: 
              <span class="font-bold text-emerald-600" v-if="order.paidAt">Ödendi</span>
              <span class="font-bold text-amber-500" v-else>Ödeme Bekleniyor</span>
            </p>
            <p v-if="order.paidAt" class="text-gray-500 mt-1">Ödeme Tarihi: {{ formatDate(order.paidAt) }}</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 class="font-bold text-gray-950 mb-2 uppercase tracking-wider text-[10px]">Sipariş Durumu</h3>
            <span class="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase" :class="statusBadgeClass">
              {{ getStatusText(order.status || 'PENDING') }}
            </span>
          </div>
        </div>

        <!-- Product Table -->
        <div class="border border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                <th class="px-4 py-3">Ürün Adı / Açıklama</th>
                <th class="px-4 py-3 text-right">Birim Fiyat</th>
                <th class="px-4 py-3 text-center">Miktar</th>
                <th class="px-4 py-3 text-right">Toplam</th>
              </tr>
            </thead>
            <tbody class="text-xs divide-y divide-gray-100 text-gray-700">
              <tr v-for="item in order.OrderItem" :key="item.id">
                <td class="px-4 py-4">
                  <div class="font-bold text-gray-900">{{ item.Product?.name || 'Ürün' }}</div>
                  <div class="text-[10px] text-gray-400 mt-1">
                    SKU: {{ item.Product?.sku || 'N/A' }} 
                    <span v-if="item.Product?.Vendor">
                      | Satıcı: {{ item.Product.Vendor.profile?.storeName || item.Product.Vendor.businessName || 'Mağaza' }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4 text-right">{{ formatCurrency(item.price) }}</td>
                <td class="px-4 py-4 text-center font-bold">x {{ item.quantity }}</td>
                <td class="px-4 py-4 text-right font-bold text-gray-900">{{ formatCurrency(Number(item.price) * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Price Totals -->
        <div class="flex justify-end pr-4">
          <div class="w-72 space-y-2.5 text-xs">
            <div class="flex justify-between text-gray-500 font-medium">
              <span>Ara Toplam:</span>
              <span>{{ formatCurrency(subTotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-500 font-medium">
              <span>Kargo Bedeli:</span>
              <span>{{ formatCurrency(shippingCost) }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-3 font-black text-gray-950 text-sm tracking-tight">
              <span>GENEL TOPLAM:</span>
              <span>{{ formatCurrency(order.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Corporate Note -->
        <div class="border-t border-gray-100 pt-12 mt-20 text-center text-[10px] text-gray-400">
          Bu belge TicariTakas sistemi üzerinden üretilmiştir. Resmi fatura yerine geçmez.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import {
  ChevronRightIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import AdminOrderItemList from '~/components/admin/order/AdminOrderItemList.vue'
import AdminOrderShippingForm from '~/components/admin/order/AdminOrderShippingForm.vue'
import AdminOrderCustomerCard from '~/components/admin/order/AdminOrderCustomerCard.vue'
import AdminOrderPaymentCard from '~/components/admin/order/AdminOrderPaymentCard.vue'
import { useAdminOrderDetail } from '~/composables/useAdminOrderDetail'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const {
  order, loading, updating, shippingUpdate,
  parsedAddress, subTotal, shippingCost,
  fetchOrder, deleteOrder, rejectOrder, updateStatus,
} = useAdminOrderDetail(route.params.id as string)

const handleDelete = async () => {
  const success = await deleteOrder()
  if (success) navigateTo('/admin/orders')
}

const printOrder = () => {
  window.print()
}

const formatCurrency = (price: number | string | undefined) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(price) || 0)

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const getStatusText = (status: string) => {
  const STATUS_TEXT: Record<string, string> = {
    PENDING: 'Beklemede',
    PAID: 'Ödendi',
    CONFIRMED: 'Onaylandı',
    PROCESSING: 'Hazırlanıyor',
    PREPARING: 'Hazırlanıyor',
    READY: 'Hazır',
    SHIPPED: 'Kargoda',
    DELIVERED: 'Teslim Edildi',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi',
    REFUNDED: 'İade Edildi',
  }
  return STATUS_TEXT[status] ?? status
}

const statusBadgeClass = computed(() => {
  switch (order.value?.status) {
    case 'DELIVERED':
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border border-green-200'
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border border-purple-200'
    case 'PROCESSING':
    case 'PREPARING':
      return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border border-amber-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200'
  }
})

onMounted(() => {
  fetchOrder()
})
</script>

<style>
@media print {
  /* Hide screen-only layouts (including layout components outside page scope) */
  aside,
  header,
  .print\:hidden {
    display: none !important;
  }

  /* Reset outer layout constraint heights & overflow */
  .flex,
  .h-screen,
  .overflow-hidden,
  .overflow-y-auto,
  main {
    height: auto !important;
    overflow: visible !important;
    display: block !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .print\:block {
    display: block !important;
  }
}
</style>
