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
            :raw-address="order.shippingAddress"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
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

onMounted(() => {
  fetchOrder()
})
</script>

<style scoped>
@media print {
  .btn-outline,
  .bg-primary-600,
  .bg-red-600,
  .space-y-6,
  .mb-8,
  header,
  aside {
    display: none !important;
  }

  .lg\:col-span-2,
  .grid {
    display: block !important;
    width: 100% !important;
  }

  .p-8 {
    padding: 0 !important;
  }
}
</style>
