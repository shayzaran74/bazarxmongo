<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <table class="w-full text-left border-collapse">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-6 py-4 w-12">
            <input 
              type="checkbox" 
              :checked="isAllSelected" 
              class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              @change="$emit('toggle-select-all')" 
            >
          </th>
          <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
            Sipariş No
          </th>
          <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
            Müşteri
          </th>
          <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
            Tarih
          </th>
          <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
            Toplam
          </th>
          <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
            Durum
          </th>
          <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
            İşlemler
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="loading && orders.length === 0">
          <td
            colspan="7"
            class="px-6 py-12 text-center"
          >
            <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </td>
        </tr>
        <tr v-else-if="orders.length === 0">
          <td
            colspan="7"
            class="px-6 py-12 text-center text-gray-500 italic"
          >
            Sipariş bulunamadı
          </td>
        </tr>
        <tr 
          v-for="order in orders" 
          :key="order.id" 
          class="hover:bg-gray-50/50 transition-colors"
          :class="{ 'bg-indigo-50/30': selectedIds.includes(order.id) }"
        >
          <td class="px-6 py-4">
            <input 
              type="checkbox" 
              :value="order.id" 
              :checked="selectedIds.includes(order.id)"
              class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              @change="toggleSelect(order.id)" 
            >
          </td>
          <td class="px-6 py-4">
            <span class="font-bold text-gray-900 text-sm">#{{ order.orderNumber }}</span>
          </td>
          <td class="px-6 py-4">
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-gray-900">{{ order.User?.name || 'Anonim' }}</span>
              <span class="text-xs text-gray-500">{{ order.User?.email }}</span>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</span>
          </td>
          <td class="px-6 py-4">
            <span class="text-sm font-bold text-gray-900">{{ formatPrice(order.totalAmount) }}</span>
          </td>
          <td class="px-6 py-4">
            <span :class="getStatusBadgeClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <NuxtLink 
              :to="`/admin/orders/${order.id}`"
              class="inline-flex items-center px-3 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all"
            >
              Detay
              <ChevronRightIcon class="h-3.5 w-3.5 ml-1" />
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  loading: Boolean,
  selectedIds: {
    type: Array,
    default: () => []
  },
  isAllSelected: Boolean
})

const emit = defineEmits(['update:selectedIds', 'toggle-select-all'])

const toggleSelect = (id) => {
  const current = [...props.selectedIds]
  const index = current.indexOf(id)
  if (index === -1) {
    current.push(id)
  } else {
    current.splice(index, 1)
  }
  emit('update:selectedIds', current)
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const getStatusBadgeClass = (status) => {
  const base = 'px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap'
  switch (status) {
    case 'Pending': return `${base} bg-orange-100 text-orange-700`
    case 'Processing': return `${base} bg-blue-100 text-blue-700`
    case 'Shipped': return `${base} bg-purple-100 text-purple-700`
    case 'Delivered': return `${base} bg-green-100 text-green-700`
    case 'Cancelled': return `${base} bg-red-100 text-red-700`
    default: return `${base} bg-gray-100 text-gray-700`
  }
}

const getStatusText = (status) => {
  const map = {
    'Pending': 'Beklemede',
    'Processing': 'Hazırlanıyor',
    'Shipped': 'Kargolandı',
    'Delivered': 'Teslim Edildi',
    'Cancelled': 'İptal Edildi'
  }
  return map[status] || status
}
</script>
