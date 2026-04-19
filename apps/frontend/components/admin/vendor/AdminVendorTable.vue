<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div
      v-if="loading"
      class="flex justify-center items-center h-64"
    >
      <div class="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mb-4" />
    </div>

    <table
      v-else
      class="w-full"
    >
      <thead class="bg-gray-50 border-b">
        <tr>
          <th class="px-6 py-3 text-left text-sm font-semibold">
            İşletme Adı
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold">
            İletişim
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold">
            Kategoriler
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold">
            Ürün
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold">
            Durum
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold">
            Özellik
          </th>
          <th class="px-6 py-3 text-left text-sm font-semibold">
            İşlem
          </th>
        </tr>
      </thead>
      <tbody class="divide-y">
        <tr
          v-for="vendor in vendors"
          :key="vendor.id"
          class="hover:bg-gray-50"
        >
          <td class="px-6 py-4">
            <div>
              <p class="font-semibold text-gray-900">
                {{ vendor.profile?.storeName || vendor.company?.name || 'İsimsiz Satıcı' }}
              </p>
              <div class="flex items-center text-xs text-gray-400 space-x-1 mt-1">
                <span class="font-medium text-gray-600">
                  {{ vendor.user?.profile?.firstName }} {{ vendor.user?.profile?.lastName }}
                </span>
                <span>•</span>
                <span>{{ vendor.user?.email || '-' }}</span>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-sm">
            <p class="text-gray-700">
              {{ vendor.user?.profile?.phone || vendor.phone || '-' }}
            </p>
            <p class="text-xs text-gray-400 font-medium">
              {{ vendor.profile?.city || vendor.city || '-' }}
            </p>
          </td>
          <td class="px-6 py-4 text-sm">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="cat in vendor.vendorCategories"
                :key="cat.id"
                class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              >
                {{ cat.category?.name || 'Bilinmiyor' }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 text-sm font-semibold text-gray-700">
            {{ vendor._count?.listings || 0 }}
          </td>
          <td class="px-6 py-4">
            <span :class="['px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider', VENDOR_STATUS_CONFIG[vendor.status]?.class || 'bg-gray-50 text-gray-700 border border-gray-200']">
              {{ VENDOR_STATUS_CONFIG[vendor.status]?.label || vendor.status }}
            </span>
          </td>
          <td class="px-6 py-4">
            <span
              v-if="vendor.profile?.isFeatured"
              class="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-1 rounded border border-indigo-100 uppercase tracking-tighter"
            >
              🌟 ÖNE ÇIKAN
            </span>
            <span
              v-else
              class="text-gray-300 text-xs"
            >-</span>
          </td>
          <td class="px-6 py-4 text-sm flex items-center space-x-3">
            <button
              class="text-blue-600 hover:text-blue-700 font-bold"
              @click="$emit('open-detail', vendor)"
            >
              Detay
            </button>
            <div
              v-if="vendor.status === 'PENDING'"
              class="flex space-x-1 border-l pl-3 border-gray-100"
            >
              <button
                class="bg-green-100 text-green-700 p-1.5 rounded-lg hover:bg-green-200 transition-colors"
                title="Hızlı Onay"
                @click="$emit('approve', vendor.id)"
              >
                <CheckIcon class="h-4 w-4" />
              </button>
              <button
                class="bg-red-100 text-red-700 p-1.5 rounded-lg hover:bg-red-200 transition-colors"
                title="Reddet"
                @click="$emit('show-reject', vendor)"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="vendors.length === 0 && !loading"
      class="text-center py-12"
    >
      <p class="text-gray-500">
        Satıcı bulunamadı
      </p>
    </div>
  </div>
</template>

<script setup>
import CheckIcon from '@heroicons/vue/24/outline/CheckIcon'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'

defineProps({
  vendors: { type: Array, required: true },
  loading: Boolean
})

defineEmits(['open-detail', 'approve', 'show-reject'])

// UI Configuration Maps
const VENDOR_STATUS_CONFIG = {
  APPROVED: { label: 'Onaylı', class: 'bg-green-50 text-green-700 border border-green-200' },
  PENDING: { label: 'Beklemede', class: 'bg-amber-50 text-amber-700 border border-amber-200' },
  REJECTED: { label: 'Reddedildi', class: 'bg-red-50 text-red-700 border border-red-200' }
}
</script>
