<template>
  <div class="space-y-6">
    <!-- Header Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-500 text-sm font-medium">Bekleyen Toplam Hak Ediş</span>
          <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon class="h-6 w-6" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">
          {{ formatPrice(totalPendingAmount) }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          {{ pendingPayouts.length }} sipariş incelenmeyi bekliyor
        </p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-500 text-sm font-medium">Onay Süresi Dolan</span>
          <div class="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircleIcon class="h-6 w-6" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">
          {{ formatPrice(totalEligibleAmount) }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          {{ eligiblePayouts.length }} sipariş 14 günü tamamladı
        </p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-500 text-sm font-medium">Onay Gerektiren Satıcı Sayısı</span>
          <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <UserGroupIcon class="h-6 w-6" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">
          {{ uniqueVendors.size }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          Aktif ödeme bekleyen satıcılar
        </p>
      </div>
    </div>

    <!-- Payouts Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 class="text-lg font-bold text-gray-900">
            Yönetilmeyi Bekleyen Hak Edişler
          </h2>
          <p class="text-xs text-gray-500 mt-1">
            Sipariş tesliminden 14 gün sonra onaylanabilir hale gelirler.
          </p>
        </div>
        <button
          class="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
          :class="{ 'animate-spin': loading }"
          @click="fetchPayouts"
        >
          <ArrowPathIcon class="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th class="px-6 py-4">
                Sipariş / Tarih
              </th>
              <th class="px-6 py-4">
                Satıcı & Kazanç
              </th>
              <th class="px-6 py-4">
                Onay Tarihi
              </th>
              <th class="px-6 py-4">
                Durum
              </th>
              <th class="px-6 py-4 text-right">
                Aksiyon
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <template v-if="loading">
              <tr
                v-for="i in 5"
                :key="i"
                class="animate-pulse"
              >
                <td
                  colspan="5"
                  class="px-6 py-4 h-16 bg-gray-50/20"
                />
              </tr>
            </template>
            <tr v-else-if="pendingPayouts.length === 0">
              <td
                colspan="5"
                class="px-6 py-20 text-center"
              >
                <InboxIcon class="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p class="text-gray-400 font-medium">
                  Onay bekleyen hak ediş bulunamadı.
                </p>
              </td>
            </tr>
            <tr
              v-for="order in pendingPayouts"
              :key="order.id"
              class="hover:bg-gray-50/80 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 text-sm">
                  #{{ order.orderNumber }}
                </div>
                <div class="text-[10px] text-gray-400 font-medium">
                  {{ formatDate(order.createdAt) }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <div
                    v-for="vendor in getOrderVendors(order)"
                    :key="vendor.id"
                    class="flex items-center gap-2"
                  >
                    <span class="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{{
                      vendor.businessName }}</span>
                    <span class="text-xs font-black text-indigo-600">{{ formatPrice(vendor.share) }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <ClockIcon
                    class="h-4 w-4"
                    :class="isEligible(order) ? 'text-green-500' : 'text-amber-500'"
                  />
                  <span
                    class="text-xs font-black uppercase tracking-tight"
                    :class="isEligible(order) ? 'text-green-600' : 'text-amber-600'"
                  >
                    {{ formatDate(order.payoutEligibleAt) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  :class="ELIGIBILITY_CONFIG[isEligible(order)].class"
                >
                  {{ ELIGIBILITY_CONFIG[isEligible(order)].label }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  :disabled="processingId === order.id || !isEligible(order)"
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  @click="approvePayout(order)"
                >
                  <template v-if="processingId === order.id">
                    <ArrowPathIcon class="h-3 w-3 animate-spin mr-2" />
                    İŞLENİYOR
                  </template>
                  <template v-else>
                    ONAYLA
                  </template>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ArrowPathIcon,
  InboxIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'super-admin'
})

const { $api } = useApi()
const { $toast } = useNuxtApp()

const pendingPayouts = ref([])
const loading = ref(true)
const processingId = ref(null)

const fetchPayouts = async () => {
  loading.value = true
  try {
    const res = await $api('/api/v1/admin/orders/payouts/pending')
    pendingPayouts.value = res.data
  } catch (e) {
    $toast.error('Hak edişler yüklenemedi')
  } finally {
    loading.value = false
  }
}

const approvePayout = async (order) => {
  if (confirm('#' + order.orderNumber + ' numaralı siparişin hak edişini onaylıyor musunuz?')) {
    processingId.value = order.id
    try {
      await $api(`/api/v1/admin/orders/payouts/${order.id}/approve`, {
        method: 'POST'
      })
      $toast.success('Hak ediş başarıyla onaylandı ve satıcı hesaplarına aktarıldı.')
      await fetchPayouts()
    } catch (e) {
      $toast.error(e.data?.error || 'Onay işlemi başarısız')
    } finally {
      processingId.value = null
    }
  }
}

const getOrderVendors = (order) => {
  const vendorMap = {}
  order.OrderItem.forEach(item => {
    const v = item.Product?.Vendor
    if (!v) return

    const itemPrice = Number(item.price) * item.quantity
    const commissionRate = v.commissionRate || 10.0
    const commissionAmount = itemPrice * (commissionRate / 100)
    const vendorShare = itemPrice - commissionAmount

    if (!vendorMap[v.id]) {
      vendorMap[v.id] = {
        id: v.id,
        businessName: v.businessName,
        share: 0
      }
    }
    vendorMap[v.id].share += vendorShare
  })
  return Object.values(vendorMap)
}

const isEligible = (order) => {
  if (!order.payoutEligibleAt) return false
  return new Date(order.payoutEligibleAt) <= new Date()
}

const totalPendingAmount = computed(() => {
  return pendingPayouts.value.reduce((total, order) => {
    return total + getOrderVendors(order).reduce((vt, v) => vt + v.share, 0)
  }, 0)
})

const totalEligibleAmount = computed(() => {
  return pendingPayouts.value.filter(isEligible).reduce((total, order) => {
    return total + getOrderVendors(order).reduce((vt, v) => vt + v.share, 0)
  }, 0)
})

const eligiblePayouts = computed(() => pendingPayouts.value.filter(isEligible))

const uniqueVendors = computed(() => {
  const set = new Set()
  pendingPayouts.value.forEach(order => {
    order.OrderItem.forEach(item => {
      if (item.Product?.vendorId) set.add(item.Product.vendorId)
    })
  })
  return set
})

const formatPrice = (p) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(p))
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// UI Configuration Maps
const ELIGIBILITY_CONFIG = {
  true: { label: 'Onaylanabilir', class: 'bg-green-50 text-green-700 border-green-200' },
  false: { label: 'Beklemede', class: 'bg-amber-50 text-amber-700 border-amber-200' }
}

onMounted(fetchPayouts)
</script>
